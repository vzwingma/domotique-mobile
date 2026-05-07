# Domoticz Mobile - Application de contrôle pour Domoticz
## 📌 Table des Matières

1. [Domoticz Mobile](#domoticz-mobile)
2. [Prérequis](#-prérequis)
3. [Installation](#-installation)
4. [Variables d'Environnement](#-variables-denvironnement)
5. [Configuration SSL/TLS](#-configurationssltls)
6. [Scripts npm](#scripts-npm)
7. [Architecture & Patterns](#️-architecture--patterns)
8. [Fonctionnalités](#fonctionnalités)
9. [Tests](#-tests)
10. [Contribution](#contribution)
11. [Licence](#licence)

---

# Domoticz Mobile

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=vzwingma_domotique-mobile&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=vzwingma_domotique-mobile)

Application mobile pour piloter les équipements [Domoticz](https://www.domoticz.com/). Développée avec React Native et Expo, elle cible principalement Android et le web.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- **Node.js** 21 ou supérieur ([télécharger](https://nodejs.org/))
- **npm** 6 ou supérieur (inclus avec Node.js)
- **Expo CLI** ([guide officiel](https://docs.expo.dev/))

```bash
# Vérifier les versions
node --version   # v21.0.0 ou supérieur
npm --version    # v6.0.0 ou supérieur

# Installer Expo CLI globalement
npm install -g expo-cli
```

**Plateforme cible :** Android et Web (React Native via Expo)

## 🚀 Installation

### Étape 1 : Cloner le dépôt

```bash
git clone https://github.com/vzwingma/domoticz-mobile.git
cd domoticz-mobile
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

Cette commande installe toutes les dépendances listées dans `package.json`, y compris React Native, Expo, TypeScript, Jest et ESLint.

## 🔑 Variables d'Environnement

La configuration de l'application passe exclusivement par des variables d'environnement préfixées `EXPO_PUBLIC_`, qui sont disponibles au build time.

### Configuration de Base

Créez un fichier `.env.local` à la racine du projet (non versionné) :

```env
# URL du serveur Domoticz (inclure le port si nécessaire)
# Format: http://HOST:PORT/ ou https://HOST:PORT/
EXPO_PUBLIC_DOMOTICZ_URL=http://192.168.1.x:8080/

# Authentification Basic Auth encodée en Base64
# Format: "login:password" encodé en Base64
EXPO_PUBLIC_DOMOTICZ_AUTH=<Base64 de login:password>

# Environnement courant (optionnel, par défaut: "production")
# Valeurs: development, staging, production
EXPO_PUBLIC_MY_ENVIRONMENT=development

# Domaine du serveur Domoticz pour la configuration SSL
# Format: IP ou FQDN SANS protocole ni port (ex: 192.168.1.100 ou domotique.home.local)
# Requis pour le support HTTPS avec certificat auto-signé
EXPO_PUBLIC_DOMOTICZ_DOMAIN=192.168.1.x
```

### Générer la valeur Base64

Pour encoder vos identifiants :

```bash
# macOS/Linux
echo -n "monlogin:monmotdepasse" | base64

# Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("monlogin:monmotdepasse"))
```

### Variables Disponibles

| Variable | Requis | Description |
|----------|--------|-------------|
| `EXPO_PUBLIC_DOMOTICZ_URL` | ✅ Oui | URL serveur Domoticz avec protocole et port |
| `EXPO_PUBLIC_DOMOTICZ_AUTH` | ✅ Oui | Identifiants Basic Auth encodés en Base64 |
| `EXPO_PUBLIC_DOMOTICZ_DOMAIN` | ⚠️ Si HTTPS + certificat auto-signé | Domaine pour configuration SSL |
| `EXPO_PUBLIC_MY_ENVIRONMENT` | ❌ Non | Environnement d'exécution (debug info) |

## 🔐 Configuration SSL/TLS

Si votre serveur Domoticz utilise HTTPS avec un certificat auto-signé, suivez ces étapes :

### 1. Exporter le certificat depuis votre serveur

```bash
openssl s_client -connect <HOST>:<PORT> -showcerts </dev/null 2>/dev/null \
  | openssl x509 -outform PEM > domoticz.crt
# Exemple :
openssl s_client -connect 192.168.1.100:8443 -showcerts </dev/null 2>/dev/null \
  | openssl x509 -outform PEM > domoticz.crt
```

Ou via un navigateur : cadenas → Certificat → Exporter au format PEM/Base64.

### 2. Placer le certificat dans le projet

```
assets/
  certificates/
    domoticz.crt   ← votre certificat ici (format PEM)
```

### 3. Configurer l'URL dans `.env.local`

```env
EXPO_PUBLIC_DOMOTICZ_URL=https://domatique.freeboxos.fr:38243/
```

> Le domaine est configuré directement dans `app.json` en option du plugin (pas via variable d'environnement).

### 4. Lancer le build natif

Le plugin SSL ne s'applique **pas** avec `npm start` (Expo Go). Il faut un build natif :

| Commande | Contexte | SSL |
|---|---|---|
| `npm start` | Expo Go — développement rapide | ❌ |
| `npm run android` | Build local Android (nécessite SDK + JDK) | ✅ |
| `npm run android:clean` | Build local force-clean (plugin garanti) | ✅ |
| `npm run start:dev-client` | Dev-client déjà buildé (EAS development) | ✅ |
| `eas build --profile previewV` | APK distribution interne | ✅ |

**Pour développer localement avec SSL :**
```bash
npm run android          # prebuild + compile + installe sur l'appareil/émulateur
```
Les modifications JS sont ensuite rechargées à chaud sans recompiler.

Si le premier build ne résout pas le problème (fichiers natifs en cache) :
```bash
npm run android:clean    # force un prebuild complet
```

> **Note Web :** Pour le navigateur, acceptez l'exception de sécurité en naviguant manuellement vers l'URL HTTPS de Domoticz une première fois.

## Scripts npm

```bash
npm start                                           # Serveur Metro (Expo Go — sans SSL)
npm run start:dev-client                            # Serveur Metro pour expo-dev-client (avec SSL)
npm run android                                     # Build natif Android + lancement (avec SSL)
npm run android:clean                               # Build natif Android force-clean (avec SSL)
npm run web                                         # Lancer dans le navigateur
npm test                                            # Tests Jest en mode watch
npm test -- path/to/file.test.tsx                   # Un fichier de test précis
npm test -- --testNamePattern="nom du test"         # Tests filtrés par nom
npm run lint                                        # ESLint via Expo
```

Builds EAS (distribution APK Android) :

```bash
eas build --profile development   # Dev-client (à utiliser avec npm run start:dev-client)
eas build --profile previewV      # APK à distribution interne (variante V)
eas build --profile previewC      # APK à distribution interne (variante C)
eas build --profile production    # Build de production
```

## 🏗️ Architecture & Patterns

Pour une documentation complète de l'architecture, des patterns utilisés, de la structure des dossiers, et de la gestion d'état globale, consultez **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**.

**Points clés :**
- **Flux de données :** UI → Controller → Services → Serveur Domoticz
- **État global :** React Context API via `DomoticzContextProvider`
- **Routage :** Expo Router avec file-based routing
- **HTTP :** Centralisé dans `ClientHTTP.service.ts` avec Basic Auth
- **Patterns :** Controllers, Services, Models (avec TypeScript strict)

## ✅ Tests

L'application utilise **Jest** avec le preset `jest-expo` pour les tests unitaires et snapshot testing.

```bash
# Lancer les tests en mode watch
npm test

# Tester un fichier spécifique
npm test -- path/to/file.test.tsx

# Tests filtrés par nom
npm test -- --testNamePattern="mon pattern"

# Linter le code
npm run lint
```

**Objectifs de couverture :**
- Couverture cible : **≥ 80%** (app/ et components/)
- Controllers, Services et composants critiques testés
- Snapshot tests pour les composants UI

Pour plus de détails sur le setup Jest, les conventions de test, et les meilleures pratiques, consultez **[docs/TESTING.md](./docs/TESTING.md)**.

## Fonctionnalités

- Navigation par 5 onglets (`Favoris`, `Lumières`, `Volets`, `Températures`, `Maison`) avec header unifié (icône d'onglet + titre + badge de connexion)
- Badge de connexion unifié sur tous les onglets avec 4 états UI canoniques : `Connecté`, `Synchronisation`, `Déconnecté`, `Erreur`
- Écran **Favoris** orienté actions rapides : cartes 1 tap (action principale + bouton), slider conditionnel disponible en mode `previewC`, limité aux **8 favoris actifs** les plus utilisés
- Affichage et contrôle des lumières (on/off, variateur) avec labels métier "Allumé"/"Éteint" et état synthétique pour les groupes ("Éteintes" / "Allumées" / "Mixte" / niveau%)
- Gestion des volets/stores (ouverture/fermeture via slider et clic icône) avec labels "Ouvert"/"Fermé" ; confirmation modale pour les actions sur groupe de volets (nom contenant "Tous")
- Consultation des capteurs de température avec indicateurs "Déconnecté"/"Inconnu" pour les capteurs inactifs
- Contrôle des thermostats (point de consigne ajustable par paliers de ±0,5°C, affichage distinct **Mesure / Consigne**)
- Gestion des groupes d'équipements (indicateur "Mixte" pour niveaux incohérents)
- Écran **Maison** : paramètres interactifs (présence, phase) via chips segmentés + section "À propos" (version app, version serveur Domoticz, statut connexion)

### Composants UI principaux

| Composant | Fichier | Rôle |
|---|---|---|
| `DeviceComponent` | `app/components/device.component.tsx` | Orchestrateur : délègue à `ViewLightDevice` ou `ViewBlindDevice` selon le type |
| `ViewLightDevice` | `app/components/lightDevice.component.tsx` | Affichage et contrôle d'une lumière individuelle ou groupe (on/off, variateur) |
| `ViewBlindDevice` | `app/components/blindDevice.component.tsx` | Affichage et contrôle d'un volet individuel ou groupe (slider, résumé groupe) |
| `DeviceCard` | `app/components/deviceCard.component.tsx` | Carte générique réutilisée par `ViewLightDevice` et `ViewBlindDevice` |
| `FavoriteCard` | `app/components/favoriteCard.component.tsx` | Carte favori "action rapide" (1 tap) ; slider conditionnel en mode `previewC` |
| `PrimaryIconAction` | `app/components/primaryIconAction.component.tsx` | Bouton icône principal utilisé dans les cartes d'équipements et favoris |
| `DisconnectedState` | `app/components/disconnectedState.component.tsx` | Indicateur visuel "Déconnecté" pour les équipements inactifs |
| `TemperatureComponent`| `app/components/temperature.component.tsx` | Card compacte pour un capteur de température |
| `ThermostatComponent` | `app/components/thermostat.component.tsx` | Contrôle de consigne thermostat avec boutons ±0,5°C |
| `ParamListComponent` | `app/components/paramList.component.tsx` | Paramètres interactifs (présence, phase) via chips segmentés |

## 🤝 Contribution

Pour contribuer à ce projet :

1. **Consultez le guide complet :** [CONTRIBUTING.md](./CONTRIBUTING.md)
2. **Points clés :**
   - Fork le dépôt
   - Créez une branche `feature/` ou `fix/` explicite
   - Respectez les conventions TypeScript et Expo du projet
   - Lancez `npm test` et `npm run lint` avant de soumettre
   - Soumettez une Pull Request avec une description claire

**En savoir plus :**
- Git workflow (main/develop/feature)
- Setup local dev environment
- Code style & linting conventions
- Commit message format

Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour tous les détails.

## 📄 Licence

Ce projet est sous licence MIT. Consultez le fichier `LICENSE` pour plus d'informations.
