# Architecture domoticz-mobile

**Document Version:** 3.0.0  
**Last Updated:** 2026-05-11  
**Audience:** Développeurs contribuant à l'application

---

## 📋 Table des Matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Flux de données](#-flux-de-données)
3. [Structure des dossiers](#-structure-des-dossiers)
4. [Patterns & Conventions](#-patterns--conventions)
5. [Composants principaux](#-composants-principaux)
6. [Services](#-services)
7. [Gestion d'État Global](#-gestion-détat-global)
8. [Modèles de Données](#-modèles-de-données)
9. [Énumérations & Constantes](#-énumérations--constantes)
10. [Routing](#-routing)
11. [Meilleures Pratiques](#-meilleures-pratiques)

---

## 👁️ Vue d'ensemble

**domoticz-mobile** est une application React Native/Expo qui permet de contrôler et consulter les équipements d'une maison intelligente via un serveur **Domoticz** (https://www.domoticz.com/).

**Caractéristiques principales :**
- **Stack technologique :** React Native (Expo), TypeScript strict, Context API
- **Plateforme cible :** Android native, Web (navigateur)
- **Authentification :** Basic Auth via `Constants.expoConfig.extra.domoticzAuth` (Base64, injecté depuis `app.config.ts`)
- **Intégration Domoticz :** API REST HTTP
- **État global :** React Context (DomoticzContextProvider)
- **Routing :** Expo Router (file-based)
- **Tests :** Jest + jest-expo + Testing Library
- **Linting :** ESLint
- **CI/CD :** GitHub Actions, SonarQube

---

## 🔄 Flux de Données

### Schéma global

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI LAYERS                               │
│  (Tabs: Favoris, Lumières, Volets, Températures, Maison)        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CONTROLLERS                                 │
│  (Bridge entre UI et Services, logique métier simple)           │
│  - FavoritesController                                          │
│  - LightsController                                             │
│  - BlindsController                                             │
│  - TemperaturesController                                       │
│  - HouseController                                              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICES                                   │
│  (Logique métier, accès données, API calls)                     │
│  - ClientHTTP.service (requêtes HTTP, Basic Auth)               │
│  - DataUtils.service (tri, filtrage, transformation)            │
│  - DomoticzContextProvider (gestion état global)                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DOMOTICZ SERVER                              │
│  (API REST HTTP avec endpoints spécifiques)                     │
│  - /json.htm?type=devices                                       │
│  - /json.htm?type=command&param=switchlight                     │
│  - /json.htm?type=command&param=setused                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL STATE (Context)                        │
│  DomoticzContextProvider → re-render UI on data change          │
└─────────────────────────────────────────────────────────────────┘
```

### Flux d'une action utilisateur (Exemple: allumer une lumière)

1. **Utilisateur clique** sur le bouton de la lumière dans `ViewLightDevice`
2. **Composant appelle** `lightController.toggleLight(device)`
3. **Controller** :
   - Valide l'état actuel
   - Construit la commande Domoticz
   - Appelle `ClientHTTP.callDomoticz()`
4. **Service HTTP** :
    - Ajoute Basic Auth
    - Ajoute traçage UUID
    - Envoie POST/GET au serveur Domoticz
    - Sur une action utilisateur (devices/thermostats/paramètres), déclenche un **double refresh** (immédiat + 1s)
5. **Réponse** :
   - Serveur répond `{ status: "OK" }`
   - Service met à jour Context
   - UI re-render automatiquement
6. **Feedback utilisateur** :
   - Badge connexion : "Connecté"
   - Lumière affichée comme "Allumée"

### Gestion des erreurs

Si la requête échoue (réseau, SSL, API) :

```
ClientHTTP.service
  ├─ Catch network error
  ├─ Set context { connectionStatus: "Erreur" }
  ├─ Log UUID for debugging
  └─ UI affiche badge "Erreur" + logs dans console
```

---

## 📁 Structure des Dossiers

### Racine du projet

```
domoticz-mobile/
├── app/                          # Code métier (Expo Router, TypeScript)
│   ├── (tabs)/                   # 5 écrans principaux (file-based routing)
│   │   ├── favoris.tsx
│   │   ├── lights.tsx
│   │   ├── blinds.tsx
│   │   ├── temperatures.tsx
│   │   └── house.tsx
│   ├── components/               # Composants écran (*.component.tsx)
│   │   ├── device.component.tsx
│   │   ├── lightDevice.component.tsx
│   │   ├── blindDevice.component.tsx
│   │   ├── deviceCard.component.tsx
│   │   ├── favoriteCard.component.tsx
│   │   ├── temperature.component.tsx
│   │   ├── thermostat.component.tsx
│   │   ├── paramList.component.tsx
│   │   ├── primaryIconAction.component.tsx
│   │   └── disconnectedState.component.tsx
│   ├── controllers/              # Controllers métier (*.controller.tsx)
│   │   ├── favorites.controller.tsx
│   │   ├── lights.controller.tsx
│   │   ├── blinds.controller.tsx
│   │   ├── temperatures.controller.tsx
│   │   └── house.controller.tsx
│   ├── services/                 # Services (logique métier, HTTP, state)
│   │   ├── ClientHTTP.service.ts
│   │   ├── DataUtils.service.ts
│   │   ├── DomoticzContext.ts
│   │   └── DomoticzContextProvider.tsx
│   ├── models/                   # Modèles données (classes TypeScript)
│   │   ├── Device.model.ts
│   │   ├── Light.model.ts
│   │   ├── Blind.model.ts
│   │   ├── Temperature.model.ts
│   │   ├── Thermostat.model.ts
│   │   ├── Status.model.ts
│   │   └── Favorite.model.ts
│   ├── enums/                    # Énums, constantes, endpoints
│   │   ├── DeviceType.enum.ts
│   │   ├── ConnectionStatus.enum.ts
│   │   ├── Colors.enum.ts
│   │   └── DomoticzEndpoints.enum.ts
│   └── _layout.tsx               # Root layout avec Context Provider
├── components/                   # Composants génériques réutilisables
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   ├── IconSymbol.tsx
│   └── TabBarIcon.tsx
├── hooks/                        # Hooks React personnalisés
│   ├── useThemeColor.ts
│   ├── useColorScheme.ts
│   └── (autres hooks)
├── assets/                       # Ressources statiques
│   ├── images/                   # Images PNG, JPG
│   ├── icons/                    # SVG icons
│   ├── fonts/                    # Polices custom
│   └── certificates/             # Certificats SSL auto-signés
├── docs/                         # Documentation (Markdown)
│   ├── ARCHITECTURE.md           # Ce fichier
│   ├── API.md                    # Documentation API Domoticz
│   └── TESTING.md                # Guide testing
├── __tests__/                    # Tests unitaires
│   ├── controllers/
│   ├── services/
│   └── components/
├── .github/                      # Configuration GitHub
│   ├── workflows/
│   │   └── ci.yml
│   ├── plans/
│   └── copilot-instructions.md
├── app.json                      # Configuration Expo
├── eas.json                      # Configuration EAS Builds
├── tsconfig.json                 # Configuration TypeScript (strict mode)
├── jest.config.js                # Configuration Jest
├── package.json                  # Dépendances, scripts npm
├── README.md                     # Documentation utilisateur
├── CONTRIBUTING.md               # Guide contribution
├── CHANGELOG.md                  # Historique des versions
└── LICENSE                       # Licence MIT
```

### Dossier `app/components/` — Détail des composants écran

| Composant | Fichier | Responsabilité |
|-----------|---------|-----------------|
| `DeviceComponent` | `device.component.tsx` | Orchestrateur : dispatcher vers ViewLightDevice ou ViewBlindDevice |
| `ViewLightDevice` | `lightDevice.component.tsx` | Rendu + contrôle lumière (on/off, slider, état groupe) |
| `ViewBlindDevice` | `blindDevice.component.tsx` | Rendu + contrôle volet (slider, état groupe, confirmation modale) |
| `DeviceCard` | `deviceCard.component.tsx` | Carte générique (header + body + action buttons) |
| `FavoriteCard` | `favoriteCard.component.tsx` | Carte "action rapide" (1 tap, slider conditionnel) |
| `PrimaryIconAction` | `primaryIconAction.component.tsx` | Bouton icône avec label |
| `DisconnectedState` | `disconnectedState.component.tsx` | Badge "Déconnecté" pour équipements inactifs |
| `TemperatureComponent` | `temperature.component.tsx` | Card compacte pour capteur température |
| `ThermostatComponent` | `thermostat.component.tsx` | Contrôle consigne (±0,5°C) |
| `ParamListComponent` | `paramList.component.tsx` | Chips segmentés pour paramètres (présence, phase) |

---

## 🎨 Patterns & Conventions

### 1. Nommage des fichiers

```
TypeScript/TSX files:
├── *.model.ts          → Classes modèles de données
├── *.controller.tsx    → Controllers (pont UI/Services)
├── *.service.ts        → Services (logique métier, HTTP)
├── *.component.tsx     → Composants écran (app/components/)
├── *.tsx               → Pages, layouts, composants génériques
└── *.enum.ts           → Énums et constantes

Test files:
├── *-test.tsx          → Tests
└── *.test.tsx          → Tests (Jest standard)
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
export class Light {
  readonly id: string;
  readonly name: string;
  readonly level: number;
  
  constructor(id: string, name: string, level: number) {
    this.id = id;
    this.name = name;
    this.level = level;
  }
}

export type ViewLightDeviceProps = {
  device: Light;
  onToggle: (device: Light) => void;
};
```

### 3. Controllers Pattern

Les **controllers** sont des ponts entre l'UI et les services :

```typescript
// app/controllers/lights.controller.tsx
import { useContext } from 'react';
import { DomoticzContext } from '../services/DomoticzContext';
import { ClientHTTP } from '../services/ClientHTTP.service';

export function useLightsController() {
  const { devices, setDevices } = useContext(DomoticzContext);
  const http = useContext(ClientHTTPContext);
  
  return {
    toggleLight: async (device: Light) => {
      // 1. Valider
      if (!device) return;
      
      // 2. Construire commande
      const newLevel = device.level === 0 ? 100 : 0;
      
      // 3. Appeler service
      const result = await http.callDomoticz({...});
      
      // 4. Mettre à jour Context (re-render)
      setDevices([...]);
    }
  };
}
```

**Usage dans composant :**
```typescript
export const ViewLightDevice: React.FC<ViewLightDeviceProps> = ({ device }) => {
  const { toggleLight } = useLightsController();
  
  return (
    <Pressable onPress={() => toggleLight(device)}>
      {/* ... */}
    </Pressable>
  );
};
```

### 4. Services Pattern

Les **services** contiennent la logique métier réutilisable :

```typescript
// app/services/ClientHTTP.service.ts
export class ClientHTTP {
  private baseURL: string;
  private auth: string;
  
  async callDomoticz(params: object): Promise<DomoticzResponse> {
    const uuid = generateUUID();
    console.log(`[${uuid}] Calling Domoticz...`);
    
    try {
      const response = await fetch(`${this.baseURL}/json.htm?...`, {
        headers: {
          'Authorization': `Basic ${this.auth}`
        }
      });
      
      const data = await response.json();
      console.log(`[${uuid}] Response:`, data);
      return data;
    } catch (error) {
      console.error(`[${uuid}] Error:`, error);
      throw error;
    }
  }
}

export class DataUtils {
  static sortEquipements(devices: Device[]): Device[] {
    return [...devices].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  static getDeviceType(device: Device): DeviceType {
    // Détection type depuis nom
    if (device.name.includes('Lumière')) return DeviceType.LIGHT;
    if (device.name.includes('Volet')) return DeviceType.BLIND;
    // ...
  }
}
```

### 5. Models Pattern (Classes TypeScript)

Les données Domoticz sont modélisées comme des **classes immuables** :

```typescript
// app/models/Device.model.ts
export class Device {
  readonly id: string;
  readonly idx: number;
  readonly name: string;
  readonly type: string;
  readonly subtype: string;
  readonly level: number;
  readonly status: string;
  readonly lastupdate: string;
  
  constructor(data: {
    id: string;
    idx: number;
    name: string;
    type: string;
    subtype: string;
    level?: number;
    status?: string;
    lastupdate?: string;
  }) {
    this.id = data.id;
    this.idx = data.idx;
    this.name = data.name;
    this.type = data.type;
    this.subtype = data.subtype;
    this.level = data.level ?? 0;
    this.status = data.status ?? 'Unknown';
    this.lastupdate = data.lastupdate ?? new Date().toISOString();
  }
}
```

---

## 🧩 Composants Principaux

### Favoris (favorites.tsx)

**Flux :**
1. Charger tous les favoris depuis AsyncStorage
2. Afficher cartes "action rapide" (max 8 actifs)
3. Chaque carte : 1 tap = action principale, bouton = action alternative
4. Mode previewC : slider conditionnel disponible

**Composants :** `FavoriteCard`, `primaryIconAction`

### Lumières (lights.tsx)

**Flux :**
1. Charger equipements type "Light"
2. Trier alphabétiquement
3. Afficher groupe/lumière individuelle
4. Contrôles : on/off, variateur (0-100%)
5. État groupe : "Éteintes", "Allumées", "Mixte", "%niveau"

**Composants :** `DeviceComponent`, `ViewLightDevice`, `DeviceCard`

### Volets (blinds.tsx)

**Flux :**
1. Charger équipements type "Blind"
2. Trier alphabétiquement
3. Afficher groupe/volet individuel
4. Contrôles : slider (0-100%), icônes open/close
5. Confirmation modale si nom contient "Tous"

**Composants :** `DeviceComponent`, `ViewBlindDevice`, `DeviceCard`

### Températures (temperatures.tsx)

**Flux :**
1. Charger capteurs température
2. Afficher température + état (Connecté/Déconnecté/Inconnu)
3. Afficher thermostats avec point de consigne
4. Contrôles thermostat : ±0,5°C

**Composants :** `TemperatureComponent`, `ThermostatComponent`

### Maison (house.tsx)

**Flux :**
1. Paramètres interactifs (présence, phase) via chips
2. Section "À propos" : version app, version Domoticz, connexion
3. Édition paramètres → mise à jour Context

**Composants :** `ParamListComponent`

---

## 🔧 Services

### ClientHTTP.service.ts

**Responsabilités :**
- Centraliser tous les appels HTTP vers Domoticz
- Gérer Basic Auth (header `Authorization`) via `Constants.expoConfig.extra.domoticzAuth`
- Traçage UUID pour debugging
- Gestion des erreurs réseau/SSL

**Stratégie de rafraîchissement (état réel) :**
- HTTP : `callDomoticz()` effectue toujours un appel réseau direct — pas de cache côté client (voir [ADR 004](../adr/004-suppression-cache-http-et-rafraichissement-appstate.md)).
- Rafraîchissement automatique à chaque changement d'onglet et à chaque retour en foreground via un listener `AppState` dans `app/(tabs)/_layout.tsx`.
- Politique de rafraîchissement post-action conservée : **2 appels** (immédiat puis après 1 seconde) afin de refléter rapidement l'état Domoticz puis capter l'état stabilisé.

**Méthodes principales :**
```typescript
callDomoticz(params: {
  type: string;        // 'devices', 'command', 'status', etc.
  param?: string;      // 'switchlight', 'setused', etc.
  idx?: number;        // Device idx
  nvalue?: number;     // Command value
  svalue?: string;     // Command svalue
}): Promise<DomoticzResponse>
```

### DataUtils.service.ts

**Responsabilités :**
- Tri/filtrage équipements
- Détection type équipement (LIGHT, BLIND, etc.)
- Évaluation cohérence groupe (état "Mixte")
- Gestion favoris (AsyncStorage)

**Méthodes principales :**
```typescript
sortEquipements(devices: Device[]): Device[]
getDeviceType(device: Device): DeviceType
evaluateGroupLevelConsistency(devices: Device[]): GroupConsistency
getFavoritesFromStorage(): Promise<string[]>
saveFavoritesToStorage(favorites: string[]): Promise<void>
```

### DomoticzContextProvider.tsx

**Responsabilités :**
- Fournir état global via Context API
- Méthodes pour mettre à jour état (devices, connectionStatus)
- Chargement initial des équipements

**État :**
```typescript
type DomoticzContextType = {
  devices: Device[];
  connectionStatus: ConnectionStatus;  // 'connected' | 'syncing' | 'disconnected' | 'error'
  setDevices: (devices: Device[]) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  fetchDevices: () => Promise<void>;
};
```

---

## 🌍 Gestion d'État Global

### React Context API

État global fourni par `DomoticzContextProvider` :

```typescript
// app/services/DomoticzContext.ts
export const DomoticzContext = createContext<DomoticzContextType | undefined>(undefined);

// Usage dans composant
const context = useContext(DomoticzContext);
if (!context) throw new Error('DomoticzContext not found');

const { devices, connectionStatus, setDevices } = context;
```

### Local State vs Global State

| Donnée | Scope | Stockage |
|--------|-------|----------|
| Devices (liste équipements) | Global | Context + AsyncStorage |
| Connection status | Global | Context |
| UI state (modal ouvert, etc.) | Local | `useState()` |
| Favoris | Global | AsyncStorage (persisté) |
| Préférences utilisateur | Global | AsyncStorage (persisté) |

### Flux de mise à jour Context

1. **Component** appelle `controller.toggleLight(device)`
2. **Controller** appelle `ClientHTTP.callDomoticz()`
3. **Service HTTP** reçoit réponse Domoticz
4. **Service HTTP** appelle `setDevices([... new device state])`
5. **Context** notifie tous les subscribers
6. **Composants** re-render avec nouvel état

---

## 📊 Modèles de Données

Tous les modèles sont des classes TypeScript immuables :

### Device

```typescript
export class Device {
  readonly id: string;        // Unique device ID
  readonly idx: number;       // Domoticz device index
  readonly name: string;      // Device name
  readonly type: string;      // 'Light', 'Blind', 'Temp', etc.
  readonly subtype: string;   // Subtype (may indicate Light type)
  readonly level: number;     // Current level (0-100%)
  readonly status: string;    // Device status ('On', 'Off', 'Mixed')
  readonly lastupdate: string; // ISO timestamp
}
```

### Light extends Device

```typescript
export class Light extends Device {
  readonly maxLevel: number;  // Usually 100
  readonly isGroup: boolean;  // Is this a light group?
  
  get isOn(): boolean { return this.level > 0; }
  get percentage(): string { return `${this.level}%`; }
}
```

### Blind extends Device

```typescript
export class Blind extends Device {
  readonly maxLevel: number;  // Usually 100
  readonly isGroup: boolean;  // Is this a blind group?
  
  get isOpen(): boolean { return this.level > 0; }
  get isClosed(): boolean { return this.level === 0; }
}
```

---

## 🔢 Énumérations & Constantes

### DeviceType.enum.ts

```typescript
export enum DeviceType {
  LIGHT = 'Light',
  BLIND = 'Blind',
  TEMPERATURE = 'Temperature',
  THERMOSTAT = 'Thermostat',
  UNKNOWN = 'Unknown'
}
```

### ConnectionStatus.enum.ts

```typescript
export enum ConnectionStatus {
  CONNECTED = 'connected',
  SYNCING = 'syncing',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}
```

### DomoticzEndpoints.enum.ts

```typescript
export enum DomoticzEndpoint {
  GET_DEVICES = '/json.htm?type=devices',
  SWITCH_LIGHT = '/json.htm?type=command&param=switchlight',
  SET_LEVEL = '/json.htm?type=command&param=setused',
  GET_STATUS = '/json.htm?type=status'
}
```

---

## 🛣️ Routing

### File-based Routing (Expo Router)

Structure des fichiers = structure des routes :

```
app/(tabs)/
├── favoris.tsx     → Route: /(tabs)/favoris
├── lights.tsx      → Route: /(tabs)/lights
├── blinds.tsx      → Route: /(tabs)/blinds
├── temperatures.tsx → Route: /(tabs)/temperatures
└── house.tsx       → Route: /(tabs)/house
```

### Typed Routes

Expo Router activé avec `expoRouterTypeValidation: true` dans `app.json` :

```typescript
import { Link } from 'expo-router';

// Type-checked link
<Link href="/(tabs)/lights">
  Go to Lights
</Link>
```

### Navigation par onglets

Root layout utilise `BottomTabNavigator` :

```typescript
// app/_layout.tsx
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

## ✨ Meilleures Pratiques

### 1. Tests Unitaires

Chaque **controller** et **service** doit avoir des tests :

```typescript
// app/controllers/__tests__/lights.controller-test.tsx
describe('LightsController', () => {
  it('should toggle light on', async () => {
    const device = new Light({ id: '1', level: 0 });
    const result = await toggleLight(device);
    expect(result.level).toBe(100);
  });
});
```

### 2. Snapshot Testing pour Composants

```typescript
// app/components/__tests__/device.component-test.tsx
it('renders DeviceCard', () => {
  const tree = render(
    <DeviceComponent device={mockDevice} />
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
```

### 3. Gestion des Erreurs

Toujours utiliser try-catch dans les async calls :

```typescript
try {
  await ClientHTTP.callDomoticz({ ... });
} catch (error) {
  console.error('Failed to toggle light:', error);
  setConnectionStatus(ConnectionStatus.ERROR);
}
```

### 4. Props Typing

Typage explicite des props :

```typescript
export type DeviceComponentProps = {
  device: Device;
  onAction?: (device: Device) => void;
};

export const DeviceComponent: React.FC<DeviceComponentProps> = ({
  device,
  onAction
}) => {
  // ...
};
```

### 5. Const Readability

Préférer `readonly` et `const` :

```typescript
readonly MAX_FAVORITES = 8;
readonly SYNC_INTERVAL_MS = 5000;
const DEVICE_TYPE_MAPPING: Record<string, DeviceType> = { ... };
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
- **Expo Router :** https://docs.expo.dev/routing/introduction/
- **React Context :** https://react.dev/reference/react/useContext
- **TypeScript :** https://www.typescriptlang.org/

---

**Document maintained by:** @vzwingma  
**Last reviewed:** 2026-05-04
