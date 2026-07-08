# Architecture domoticz-mobile

**Document Version:** 4.0.0
**Last Updated:** 2026-07-08
**Audience:** Développeurs contribuant à l'application

---

## 📋 Table des Matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Flux de données](#-flux-de-données)
3. [Structure des dossiers](#-structure-des-dossiers)
4. [Patterns & Conventions](#-patterns--conventions)
5. [Écrans principaux](#-écrans-principaux)
6. [Services](#-services)
7. [Gestion d'État Global](#-gestion-détat-global)
8. [Modèles de Données](#-modèles-de-données)
9. [Énumérations & Constantes](#-énumérations--constantes)
10. [Routing](#-routing)
11. [CI/CD](#-cicd)
12. [Meilleures Pratiques](#-meilleures-pratiques)

---

## 👁️ Vue d'ensemble

**domoticz-mobile** est une application React Native/Expo qui permet de contrôler et consulter les équipements d'une maison intelligente via un serveur **Domoticz** (https://www.domoticz.com/).

**Caractéristiques principales :**
- **Stack technologique :** Expo SDK ~56.0.13, React 19.2.3, React Native 0.85.3, TypeScript strict, Context API
- **Routing :** expo-router ~56.2.12 (file-based routing)
- **Plateforme cible :** Android native, Web (navigateur)
- **Authentification :** Basic Auth via `Constants.expoConfig.extra.domoticzAuth` (Base64, injecté depuis `app.config.ts`)
- **Intégration Domoticz :** API REST HTTP
- **État global :** React Context (`DomoticzContextProvider`)
- **Tests :** Jest + jest-expo + Testing Library
- **Linting :** ESLint 9.39.1 (flat config, `eslint.config.js` — seule source de vérité)
- **CI/CD :** GitHub Actions (`ci.yml`/`quick-check.yml`), SonarQube (Quality Gate), EAS Workflows pour les builds Android

**Note :** SDK 56 supprime la compatibilité avec les packages `@react-navigation/*`. L'application utilise désormais `expo-router` pour tout le routage.

---

## 🔄 Flux de Données

### Schéma global

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI LAYERS                                │
│  Onglets (app/(tabs)/) : index (Favoris), devices.tabs           │
│  (Lumières/Volets), temperatures.tab, parametrages.tab (Maison)  │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CONTROLLERS (app/controllers/)                │
│  (Bridge entre UI et Services, logique métier simple)             │
│  - index.controller.tsx        (connexion initiale)               │
│  - devices.controller.tsx      (lumières/volets)                  │
│  - temperatures.controller.tsx (capteurs température)             │
│  - thermostats.controller.tsx  (thermostats)                      │
│  - parameters.controller.tsx   (paramètres + favoris)             │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICES (app/services/)                     │
│  (Logique métier, accès données, API calls)                       │
│  - ClientHTTP.service.ts        (requêtes HTTP, Basic Auth)       │
│  - RefreshOrchestrator.service.ts (orchestration refresh unifiée) │
│  - DataUtils.service.ts         (tri, filtrage, transformation)   │
│  - FavoritesManager.service.ts  (gestion favoris, AsyncStorage)   │
│  - Validator.service.ts         (validation des réponses API)     │
│  - ErrorHandler.service.ts      (typage/normalisation erreurs)    │
│  - DomoticzContextProvider.tsx  (gestion état global + Context)   │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DOMOTICZ SERVER                                │
│  (API REST HTTP avec endpoints spécifiques — voir SERVICES_URL    │
│   dans app/enums/APIconstants.ts)                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL STATE (Context)                          │
│  DomoticzContext (exporté par DomoticzContextProvider.tsx)        │
│  → re-render UI on data change                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Flux d'une action utilisateur (Exemple : allumer une lumière)

1. **Utilisateur clique** sur le bouton de la lumière dans `ViewDomoticzDevice` (`app/components/device.component.tsx`)
2. **Composant appelle** une fonction du controller `app/controllers/devices.controller.tsx` (ex. `updateDeviceLevel`)
3. **Controller** :
   - Valide l'état actuel
   - Construit la commande Domoticz
   - Appelle `callDomoticz()` (`app/services/ClientHTTP.service.ts`)
4. **Service HTTP** :
   - Ajoute Basic Auth
   - Ajoute un traceId (`generateTraceId()` — `ErrorHandler.service.ts`)
   - Envoie la requête au serveur Domoticz
   - Applique un timeout (15s) et le mode **single-flight** pour éviter les requêtes identiques en parallèle
5. **Réponse** :
   - Réponse validée par `Validator.service.ts` (`validateDomoticzResponse`, `validateRawDevice`, etc.)
   - Controller met à jour le Context (`setDomoticzDevicesData`, etc.)
   - UI re-render automatiquement
6. **Feedback utilisateur** :
   - Badge connexion (`ConnectionBadge.tsx`) : "Connecté"
   - Lumière affichée comme "Allumée"

### Gestion des erreurs

Si la requête échoue (réseau, SSL, API) :

```
ClientHTTP.service.ts
  ├─ Catch network error
  ├─ handleError() (ErrorHandler.service.ts) → normalise en DomoticzError typée
  ├─ Set context { domoticzConnexionData: 'Erreur' }
  └─ UI affiche badge "Erreur" + logs console avec traceId
```

---

## 📁 Structure des Dossiers

### Racine du projet

```
domoticz-mobile/
├── app/                              # Code métier (Expo Router, TypeScript)
│   ├── (tabs)/                       # Écrans principaux (file-based routing)
│   │   ├── index.tsx                 # Écran Favoris (route racine des tabs)
│   │   ├── devices.tabs.tsx          # Écran équipements (Lumières / Volets)
│   │   ├── temperatures.tab.tsx      # Écran Températures / Thermostats
│   │   ├── parametrages.tab.tsx      # Écran Maison (paramètres + À propos)
│   │   ├── _layout.tsx               # Layout des tabs, refresh orchestration, TabBar
│   │   └── __tests__/
│   ├── components/                   # Composants écran (*.component.tsx)
│   │   ├── device.component.tsx
│   │   ├── lightDevice.component.tsx
│   │   ├── blindDevice.component.tsx
│   │   ├── deviceCard.component.tsx
│   │   ├── deviceRow.styles.ts       # Styles partagés des lignes d'équipement
│   │   ├── favoriteCard.component.tsx
│   │   ├── temperature.component.tsx
│   │   ├── thermostat.component.tsx
│   │   ├── paramList.component.tsx
│   │   ├── primaryIconAction.component.tsx
│   │   ├── disconnectedState.component.tsx
│   │   └── __tests__/
│   ├── controllers/                  # Controllers métier (*.controller.tsx)
│   │   ├── index.controller.tsx      # Connexion initiale à Domoticz
│   │   ├── devices.controller.tsx    # Lumières / Volets (mapping, actions, labels)
│   │   ├── temperatures.controller.tsx
│   │   ├── thermostats.controller.tsx
│   │   ├── parameters.controller.tsx # Paramètres + reset favoris
│   │   └── __tests__/
│   ├── services/                     # Services (logique métier, HTTP, state)
│   │   ├── ClientHTTP.service.ts         # Appels HTTP Domoticz (callDomoticz, diagnostic latence)
│   │   ├── RefreshOrchestrator.service.ts# Orchestration refresh unifiée (voir ADR-004/005)
│   │   ├── DataUtils.service.ts          # Tri, filtrage, détection type équipement
│   │   ├── FavoritesManager.service.ts   # Gestion favoris (AsyncStorage)
│   │   ├── Validator.service.ts          # Validation des réponses/objets Domoticz
│   │   ├── ErrorHandler.service.ts       # Typage erreurs (DomoticzError), traceId
│   │   ├── DomoticzContextProvider.tsx   # Provider + export du DomoticzContext
│   │   └── __tests__/
│   ├── models/                       # Modèles données (classes TypeScript, préfixe `domoticz`)
│   │   ├── domoticzDevice.model.ts
│   │   ├── domoticzFavorites.model.ts
│   │   ├── domoticzParameter.model.ts
│   │   ├── domoticzTemperature.model.ts
│   │   ├── domoticzThermostat.model.ts
│   │   ├── domoticzConfig.model.ts
│   │   └── __tests__/
│   ├── enums/                        # Constantes, endpoints, énums (pas de suffixe `.enum.ts`)
│   │   ├── APIconstants.ts           # URLs/auth, SERVICES_URL, KeyValueParams
│   │   ├── Colors.ts                 # Palette thème sombre + couleurs de groupe
│   │   ├── DomoticzEnum.ts           # DomoticzStatus, DomoticzDeviceType, labels, tris
│   │   └── TabsEnums.ts              # Enum des onglets (Tabs)
│   └── _layout.tsx                   # Root layout avec DomoticzContextProvider
├── components/                       # Composants génériques réutilisables (hors app/)
│   ├── ThemedText.tsx
│   ├── AppHeader.tsx
│   ├── ConnectionBadge.tsx
│   ├── ParallaxScrollView.tsx
│   ├── IconDomoticzDevice.tsx
│   ├── IconDomoticzParametre.tsx
│   ├── IconDomoticzTemperature.tsx
│   ├── IconDomoticzThermostat.tsx
│   ├── IconVoletSVG.tsx
│   ├── navigation/
│   │   ├── TabBarIcon.tsx
│   │   ├── TabBarItem.tsx
│   │   └── TabHeaderIcon.tsx
│   └── __tests__/
├── hooks/                            # Hooks React personnalisés
│   ├── useThemeColor.ts
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   ├── AndroidToast.ts
│   └── __tests__/
├── assets/                           # Ressources statiques
│   ├── images/                       # Images PNG, JPG
│   ├── icons/                        # SVG icons
│   ├── fonts/                        # Polices custom
│   └── certificates/                 # Certificats SSL auto-signés
├── docs/                             # Documentation (Markdown)
│   ├── ARCHITECTURE.md               # Ce fichier
│   ├── API.md                        # Documentation API Domoticz
│   ├── TESTING.md                    # Guide testing
│   ├── PROCESS-VEILLE-VERSIONS.md    # Processus de veille des majors Expo/React/RN (ADR-007)
│   ├── DEPLOIEMENT.md                # Procédure build/déploiement EAS + keystore (ADR-010/011)
│   └── adr/                          # Architecture Decision Records
├── __tests__/                        # Tests unitaires transverses (racine)
├── .eas/
│   └── workflows/
│       └── android-build-main-workflow.yml  # EAS Workflow natif (builds previewV/previewC sur push main)
├── .github/                          # Configuration GitHub
│   ├── workflows/
│   │   ├── ci.yml                    # CI complet (lint, test, build, Sonar) — main/develop
│   │   ├── quick-check.yml           # CI allégé (lint, test) — autres branches
│   │   └── build-on-all.yml          # Neutralisé (workflow_dispatch uniquement, cf. ADR-008)
│   ├── agents/
│   ├── instructions/
│   ├── modernize/
│   ├── plans/
│   ├── prompts/
│   ├── skills/
│   ├── PLANS.md
│   └── copilot-instructions.md
├── app.json / app.config.ts          # Configuration Expo
├── eas.json                          # Configuration profils EAS Build
├── tsconfig.json                     # Configuration TypeScript (strict mode)
├── jest.config.js                    # Configuration Jest
├── eslint.config.js                  # Configuration ESLint (flat, seule source de vérité)
├── .nvmrc                            # Version Node figée (24)
├── package.json                      # Dépendances, scripts npm (engines >=24)
├── README.md                         # Documentation utilisateur
├── CONTRIBUTING.md                   # Guide contribution
├── CHANGELOG.md                      # Historique des versions
└── LICENSE                           # Licence MIT
```

### Dossier `app/components/` — Détail des composants écran

| Composant | Fichier | Responsabilité |
|-----------|---------|-----------------|
| `ViewDomoticzDevice` | `device.component.tsx` | Orchestrateur : dispatcher vers lumière ou volet selon le type |
| `ViewLightDevice` | `lightDevice.component.tsx` | Rendu + contrôle lumière (on/off, slider, état groupe) |
| `ViewBlindDevice` | `blindDevice.component.tsx` | Rendu + contrôle volet (slider, état groupe, confirmation modale) |
| `DeviceCard` | `deviceCard.component.tsx` | Carte générique (header + body + action buttons) |
| `FavoriteCard` | `favoriteCard.component.tsx` | Carte "action rapide" (1 tap, slider conditionnel) |
| `PrimaryIconAction` | `primaryIconAction.component.tsx` | Bouton icône avec label |
| `DisconnectedState` | `disconnectedState.component.tsx` | Badge "Déconnecté" pour équipements inactifs |
| `ViewDomoticzTemperature` | `temperature.component.tsx` | Card compacte pour capteur température |
| `ViewDomoticzThermostat` | `thermostat.component.tsx` | Contrôle consigne (±0,5°C) |
| `ViewDomoticzParamList` | `paramList.component.tsx` | Chips segmentés pour paramètres (présence, phase) |

`deviceRow.styles.ts` : styles partagés (pas un composant), utilisé par les composants ci-dessus.

---

## 🎨 Patterns & Conventions

### 1. Nommage des fichiers

```
TypeScript/TSX files:
├── domoticzXxx.model.ts   → Classes modèles de données (préfixe domoticz)
├── xxx.controller.tsx     → Controllers (pont UI/Services)
├── Xxx.service.ts         → Services (logique métier, HTTP)
├── xxx.component.tsx      → Composants écran (app/components/)
├── *.tsx                  → Pages, layouts, composants génériques (components/, app/(tabs)/)
└── (pas de suffixe dédié) → Enums et constantes (app/enums/)

Test files:
└── *.test.tsx / *.test.ts → Tests (Jest), regroupés dans __tests__/ à côté du code testé
```

### 2. TypeScript Strict Mode

Tous les fichiers utilisent TypeScript avec:
- `strict: true` dans `tsconfig.json`
- Types explicites pour les props : `export type XxxProps = { ... }`
- Pas d'`any`, utiliser `unknown` si nécessaire
- Propriétés `readonly` dans les modèles de données
- Interfaces pour les contrats, classes pour les modèles

**Exemple :**
```typescript
export class DomoticzDevice {
  readonly idx: number;
  readonly name: string;
  readonly level: number;

  constructor(data: DomoticzDeviceInput) {
    this.idx = data.idx;
    this.name = data.name;
    this.level = data.level ?? 0;
  }
}
```

### 3. Controllers Pattern

Les **controllers** sont des ponts entre l'UI et les services :

```typescript
// app/controllers/devices.controller.tsx
import { DomoticzContext } from '../services/DomoticzContextProvider';
import callDomoticz from '../services/ClientHTTP.service';

export function updateDeviceLevel(
  idx: number,
  device: DomoticzDevice,
  level: number,
  storeDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>
) {
  // 1. Construire la commande
  // 2. Appeler callDomoticz()
  // 3. Mettre à jour l'état via storeDevicesData(...)
}
```

### 4. Services Pattern

Les **services** contiennent la logique métier réutilisable :

```typescript
// app/services/ClientHTTP.service.ts
export default async function callDomoticz(path: SERVICES_URL, params?: KeyValueParams[]): Promise<any> {
  const traceId = generateTraceId();
  // Basic Auth, timeout 15s, single-flight, gestion erreurs via ErrorHandler.service.ts
}

// app/services/DataUtils.service.ts
export function sortEquipements(device1: DomoticzDevice, device2: DomoticzDevice, devicesOrder: number[]) { /* ... */ }
export function getDeviceType(deviceName: string): DomoticzDeviceType { /* ... */ }
```

### 5. Models Pattern (Classes TypeScript)

Les données Domoticz sont modélisées comme des **classes immuables**, préfixées `domoticz` :

```typescript
// app/models/domoticzDevice.model.ts
export type DomoticzDeviceInput = { idx: number; name: string; level?: number; /* ... */ };

export default class DomoticzDevice {
  readonly idx: number;
  readonly name: string;
  readonly level: number;
  // ...
}
```

---

## 🧩 Écrans principaux

### Favoris (`app/(tabs)/index.tsx`)

**Flux :**
1. Charger tous les favoris depuis AsyncStorage (`FavoritesManager.service.ts`)
2. Afficher cartes "action rapide" (max **7** favoris actifs)
3. Chaque carte : 1 tap = action principale, bouton = action alternative
4. Slider conditionnel disponible en mode `previewC`

**Composants :** `FavoriteCard`, `PrimaryIconAction`

### Lumières / Volets (`app/(tabs)/devices.tabs.tsx`)

**Flux :**
1. Charger équipements type `Light` ou `Blind` (`devices.controller.tsx`)
2. Trier selon l'ordre métier (`DataUtils.service.ts`, `DomoticzLightsSort`/`DomoticzBlindsSort`)
3. Afficher groupe/équipement individuel
4. Contrôles : on/off, variateur (0-100%) pour les lumières ; slider + icônes open/close pour les volets
5. État groupe : "Éteintes"/"Allumées"/"Mixte"/niveau% (lumières), "Ouvert"/"Fermé"/"Mixte" (volets)
6. Confirmation modale pour les actions sur groupe de volets (nom contenant "Tous")

**Composants :** `ViewDomoticzDevice`, `ViewLightDevice`, `ViewBlindDevice`, `DeviceCard`

### Températures (`app/(tabs)/temperatures.tab.tsx`)

**Flux :**
1. Charger capteurs température (`temperatures.controller.tsx`)
2. Afficher température + état (Connecté/Déconnecté/Inconnu)
3. Charger et afficher thermostats (`thermostats.controller.tsx`) avec point de consigne
4. Contrôles thermostat : ±0,5°C

**Composants :** `ViewDomoticzTemperature`, `ViewDomoticzThermostat`

### Maison (`app/(tabs)/parametrages.tab.tsx`)

**Flux :**
1. Paramètres interactifs (présence, phase) via chips (`parameters.controller.tsx`)
2. Section "À propos" : version app, version Domoticz, connexion
3. Édition paramètres → mise à jour Context
4. Réinitialisation des favoris (`handleResetFavorites`)

**Composants :** `ViewDomoticzParamList`

---

## 🔧 Services

### ClientHTTP.service.ts

**Responsabilités :**
- Centraliser tous les appels HTTP vers Domoticz (`callDomoticz`, export par défaut)
- Gérer Basic Auth (header `Authorization`) via `Constants.expoConfig.extra.domoticzAuth`
- Traçage (`generateTraceId()` via `ErrorHandler.service.ts`) pour debugging
- Diagnostic de latence (`runLatencyDiagnostic`)
- Gestion des erreurs réseau/SSL, déléguée à `ErrorHandler.service.ts`

**Stratégie de rafraîchissement (état réel) :**
- HTTP : `callDomoticz()` effectue toujours un appel réseau direct — pas de cache TTL global côté client (voir [ADR 004](./adr/004-suppression-cache-http-et-rafraichissement-appstate.md) et [ADR 005](./adr/005-orchestration-refresh-unifiee-sans-cache-ttl-persistant.md)).
- Orchestration centralisée via `refreshDomoticzData()` (`RefreshOrchestrator.service.ts`) : un seul `GET_DEVICES` partagé (devices/thermostats/parameters) + `GET_TEMPS` en parallèle.
- Anti-burst UI : rafraîchissement au changement d'onglet et au retour foreground, protégé par un cooldown de 5 secondes (`REFRESH_COOLDOWN_MS`) dans `app/(tabs)/_layout.tsx`.
- Robustesse réseau distante : timeout explicite 15s + coalescence single-flight des requêtes identiques en vol.

### RefreshOrchestrator.service.ts

**Responsabilités :**
- Point d'entrée unique de rafraîchissement des données (`refreshDomoticzData()`), appelé depuis `app/(tabs)/_layout.tsx`
- Coordonne les appels `GET_DEVICES` (partagé devices/thermostats/parameters) et `GET_TEMPS` (parallèle)

### DataUtils.service.ts

**Responsabilités :**
- Tri/filtrage équipements (`sortEquipements`, `sortFavorites`)
- Détection type équipement (`getDeviceType`)
- Évaluation cohérence groupe (`evaluateGroupLevelConsistency`, état "Mixte")
- Normalisation de texte (`normalizeDomoticzText`)

### FavoritesManager.service.ts

**Responsabilités :**
- Gestion des favoris persistés en AsyncStorage (`getFavoritesFromStorage`, `saveFavoritesToStorage`, `toggleFavorite`, `clearFavoritesFromStorage`)

### Validator.service.ts

**Responsabilités :**
- Valider les réponses brutes de l'API Domoticz avant mapping (`validateDomoticzResponse`, `validateRawDevice`, `validateRawTemperature`, `validateRawThermostat`)
- Valider les objets construits (`validateConstructedDevice`, `validateConstructedThermostat`, `validateConstructedTemperature`)

### ErrorHandler.service.ts

**Responsabilités :**
- Typer les erreurs métier (`DomoticzError`, `ErrorType`)
- Normaliser et gérer les erreurs (`handleError`)
- Générer les identifiants de traçage (`generateTraceId`)

### DomoticzContextProvider.tsx

**Responsabilités :**
- Fournir l'état global via Context API (`DomoticzContext`, exporté directement depuis ce fichier — pas de fichier `DomoticzContext.ts` séparé)
- Méthodes pour mettre à jour l'état (devices, températures, thermostats, paramètres, statut de connexion)
- Chargement initial des équipements

**État (simplifié) :**
```typescript
type DomoticzContextType = {
  domoticzDevicesData: DomoticzDevice[];
  domoticzTemperaturesData: DomoticzTemperature[];
  domoticzThermostatData: DomoticzThermostat[];
  domoticzParametersData: DomoticzParameter[];
  domoticzConnexionData: /* statut de connexion */;
  setDomoticzDevicesData: (devices: DomoticzDevice[]) => void;
  setDomoticzConnexionData: (status: /* ... */) => void;
  // ...
};
```

---

## 🌍 Gestion d'État Global

### React Context API

État global fourni par `DomoticzContextProvider` (`app/services/DomoticzContextProvider.tsx`) :

```typescript
// app/services/DomoticzContextProvider.tsx
export const DomoticzContext = React.createContext<DomoticzContextType | null>(null);

// Usage dans un composant/controller
const context = useContext(DomoticzContext)!;
const { domoticzDevicesData, domoticzConnexionData, setDomoticzDevicesData } = context;
```

> Contrairement à une version antérieure de ce document, il n'existe **pas** de fichier `DomoticzContext.ts` séparé : le contexte est exporté directement par `DomoticzContextProvider.tsx`.

### Local State vs Global State

| Donnée | Scope | Stockage |
|--------|-------|----------|
| Devices, Températures, Thermostats, Paramètres | Global | Context |
| Statut de connexion | Global | Context |
| UI state (modal ouvert, valeur en cours d'édition, etc.) | Local | `useState()` |
| Favoris | Global | AsyncStorage (persisté, via `FavoritesManager.service.ts`) |

### Flux de mise à jour Context

1. **Composant** appelle une fonction du controller (ex. `updateDeviceLevel`)
2. **Controller** appelle `callDomoticz()` (`ClientHTTP.service.ts`)
3. **Service HTTP** reçoit et fait valider la réponse Domoticz (`Validator.service.ts`)
4. **Controller** appelle le setter du Context (ex. `storeDevicesData([...])`)
5. **Context** notifie tous les subscribers
6. **Composants** re-render avec le nouvel état

---

## 📊 Modèles de Données

Tous les modèles sont des classes TypeScript immuables, préfixées `domoticz`, situées dans `app/models/` :

| Fichier | Rôle |
|---|---|
| `domoticzDevice.model.ts` | Équipement générique (lumière, volet — pas de sous-classes `Light`/`Blind` dédiées, le type est porté par `DomoticzDeviceType`) |
| `domoticzTemperature.model.ts` | Capteur de température |
| `domoticzThermostat.model.ts` | Thermostat (consigne, mesure) |
| `domoticzParameter.model.ts` | Paramètre Maison (présence, phase) |
| `domoticzFavorites.model.ts` | Favori (référence à un équipement + métadonnées) |
| `domoticzConfig.model.ts` | Configuration/état de connexion Domoticz (version serveur, etc.) |

**Exemple :**

```typescript
// app/models/domoticzDevice.model.ts
export type DomoticzDeviceInput = {
  idx: number;
  name: string;
  type: string;
  subtype: string;
  level?: number;
  status?: string;
};

export default class DomoticzDevice {
  readonly idx: number;
  readonly name: string;
  readonly type: string;
  readonly subtype: string;
  readonly level: number;
  readonly status: string;

  constructor(data: DomoticzDeviceInput) {
    this.idx = data.idx;
    this.name = data.name;
    this.type = data.type;
    this.subtype = data.subtype;
    this.level = data.level ?? 0;
    this.status = data.status ?? 'Unknown';
  }
}
```

---

## 🔢 Énumérations & Constantes

Situées dans `app/enums/` — **aucun fichier ne porte le suffixe `.enum.ts`** (convention de nommage historique abandonnée).

### APIconstants.ts

- `API_URL`, `API_AUTH` : configuration serveur Domoticz (variables d'environnement)
- `SERVICES_URL` (enum) : endpoints Domoticz (`GET_DEVICES`, `GET_TEMPS`, commandes switch/setused, etc.)
- `SERVICES_PARAMS`, `KeyValueParams` : paramètres de requête typés

### Colors.ts

- Palette du thème sombre (unique thème supporté)
- `getGroupColor(volet)` : couleur selon état de groupe
- `PROFILES_ENV` : environnements (`previewV`, `previewC`, `production`, etc.)

### DomoticzEnum.ts

- `DomoticzStatus`, `DomoticzDeviceType`, `DomoticzSwitchType`, `DomoticzDeviceStatus`
- `DomoticzThermostatLevelValue`, `DomoticzDeviceLevelValue`, `DomoticzDeviceLabel`, `DomoticzPhasePrefix`
- `DomoticzLightsSort`, `DomoticzBlindsSort` : ordres de tri métier par idx

### TabsEnums.ts

- `Tabs` : identifiants des onglets (`INDEX`, `DEVICES`, `TEMPERATURES`, `PARAMETRAGES`)

---

## 🛣️ Routing

### File-based Routing (Expo Router)

Structure des fichiers = structure des routes, sous `app/(tabs)/` :

```
app/(tabs)/
├── index.tsx              → Route: /(tabs)/          (Favoris)
├── devices.tabs.tsx        → Route: /(tabs)/devices.tabs   (Lumières / Volets)
├── temperatures.tab.tsx    → Route: /(tabs)/temperatures.tab
└── parametrages.tab.tsx    → Route: /(tabs)/parametrages.tab (Maison)
```

Les écrans sont chargés en **lazy loading** (`React.lazy`) depuis `app/(tabs)/_layout.tsx` pour la performance (cf. commentaire "T4.3 - Lazy-load screens" dans le code).

### Navigation par onglets

`app/(tabs)/_layout.tsx` gère :
- La `TabBar` personnalisée (`components/navigation/TabBarItem.tsx`, `TabBarIcon.tsx`, `TabHeaderIcon.tsx`)
- L'orchestration du rafraîchissement (changement d'onglet, retour au premier plan via `AppState`)
- Le badge de connexion global (`ConnectionBadge.tsx`)

```typescript
// app/_layout.tsx (root layout)
export default function RootLayout() {
  return (
    <DomoticzContextProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </DomoticzContextProvider>
  );
}
```

---

## 🚀 CI/CD

Trois workflows GitHub Actions dans `.github/workflows/` (voir [ADR-008](./adr/008-fusion-workflows-ci.md)) :

| Workflow | Déclencheurs | Rôle |
|---|---|---|
| `ci.yml` | `push`/`pull_request` sur `main`, `develop` + `workflow_dispatch` | Pipeline complet : `lint` → `test` → `build` → `sonarqube-scan` → `integration-check` |
| `quick-check.yml` | `push`/`pull_request` sur les autres branches + `workflow_dispatch` | Pipeline allégé : lint + test uniquement, feedback rapide sur branches de travail |
| `build-on-all.yml` | `workflow_dispatch` uniquement | **Neutralisé** — plus aucun déclenchement automatique ; conservé pour usage manuel ponctuel, en-tête documentant la dépréciation |

Les ensembles de branches de `ci.yml` et `quick-check.yml` sont strictement disjoints : une seule exécution CI complète possible par push/PR (pas de double déclenchement).

**Seuil de couverture (`ci.yml`, job `test`) :** l'étape `nyc --check-coverage` est **informative** (`continue-on-error: true`) — le blocage réel est délégué au **Quality Gate SonarCloud** (`sonar.qualitygate.wait=true` dans `sonar-project.properties`). Voir [ADR-009](./adr/009-seuil-couverture-ci.md).

**Build/déploiement Android :** géré séparément via **EAS Workflows** (`.eas/workflows/android-build-main-workflow.yml`, builds `previewV`/`previewC` automatiques sur push `main`) et des scripts npm locaux pour `development`/`production`/`submit`. Détails complets : [docs/DEPLOIEMENT.md](./DEPLOIEMENT.md).

**Veille des dépendances majeures** (Expo SDK, React, React Native) : processus formalisé dans [docs/PROCESS-VEILLE-VERSIONS.md](./PROCESS-VEILLE-VERSIONS.md) (voir [ADR-007](./adr/007-processus-veille-majors-expo-react.md)).

---

## ✨ Meilleures Pratiques

### 1. Tests Unitaires

Chaque **controller** et **service** doit avoir des tests, regroupés dans un dossier `__tests__/` à côté du code testé :

```typescript
// app/controllers/__tests__/devices.controller.test.tsx
describe('devices.controller', () => {
  it('should compute the correct level after toggle', () => {
    // ...
  });
});
```

### 2. Snapshot Testing pour Composants

```typescript
// app/components/__tests__/device.component.test.tsx
it('renders ViewDomoticzDevice', () => {
  const tree = render(
    <ViewDomoticzDevice device={mockDevice} />
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
```

### 3. Gestion des Erreurs

Toujours utiliser try-catch et déléguer à `ErrorHandler.service.ts` dans les async calls :

```typescript
try {
  await callDomoticz(SERVICES_URL.SWITCH_LIGHT, params);
} catch (error) {
  handleError(error, traceId);
  setDomoticzConnexionData(/* Erreur */);
}
```

### 4. Props Typing

Typage explicite des props :

```typescript
export type DeviceComponentProps = {
  device: DomoticzDevice;
  onAction?: (device: DomoticzDevice) => void;
};

export const ViewDomoticzDevice: React.FC<DeviceComponentProps> = ({
  device,
  onAction
}) => {
  // ...
};
```

### 5. Const Readability

Préférer `readonly` et `const` :

```typescript
const FAVORITES_MAX_QUICK_ACTIONS = 7;
const REFRESH_COOLDOWN_MS = 5000;
```

### 6. Committing Code

Format du message commit :

```
feat: Add light slider control

- Implement continuous level adjustment (0-100%)
- Add haptic feedback on slider drag
- Update state on release only

Co-authored-by: Contributor Name <email@example.com>
```

---

## 🔗 Ressources Complémentaires

- **Installation & Setup :** [README.md](../README.md)
- **Guide Contribution :** [CONTRIBUTING.md](../CONTRIBUTING.md)
- **API Domoticz :** [docs/API.md](./API.md)
- **Guide Testing :** [docs/TESTING.md](./TESTING.md)
- **Processus de veille des versions :** [docs/PROCESS-VEILLE-VERSIONS.md](./PROCESS-VEILLE-VERSIONS.md)
- **Déploiement & keystore :** [docs/DEPLOIEMENT.md](./DEPLOIEMENT.md)
- **ADR :** [docs/adr/](./adr/)
- **Expo Router :** https://docs.expo.dev/routing/introduction/
- **React Context :** https://react.dev/reference/react/useContext
- **TypeScript :** https://www.typescriptlang.org/

---

**Document maintained by:** @vzwingma
**Last reviewed:** 2026-07-08
