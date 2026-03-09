# Domoticz Mobile

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=vzwingma_domotique-mobile&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=vzwingma_domotique-mobile)

Application mobile pour piloter les équipements [Domoticz](https://www.domoticz.com/). Développée avec React Native et Expo, elle cible principalement Android et le web.

## Prérequis

- Node.js (version 21 ou supérieure)
- npm (version 6 ou supérieure)
- Expo CLI

## Installation

```bash
git clone https://github.com/vzwingma/domoticz-mobile.git
cd domoticz-mobile
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
EXPO_PUBLIC_DOMOTICZ_URL=http://votre-serveur-domoticz:8080
EXPO_PUBLIC_DOMOTICZ_AUTH=<identifiants en Base64 : login:password>
```

## Démarrage

```bash
npm start          # Serveur de développement Expo
npm run android    # Lancer sur émulateur/appareil Android
npm run web        # Lancer sur le web
```

Une fois démarré, scannez le QR code avec l'application Expo Go sur votre appareil.

## Commandes utiles

```bash
npm test                                            # Tests Jest (mode watch)
npm test -- path/to/file.test.tsx                   # Un fichier de test précis
npm test -- --testNamePattern="nom du test"         # Tests par nom
npm run lint                                        # ESLint via Expo
```

Builds EAS (distribution APK Android) :

```bash
eas build --profile development
eas build --profile preview      # APK à distribution interne
eas build --profile production
```

## Structure du projet

```
app/
  (tabs)/       # Écrans principaux : accueil, lumières, volets, températures, paramètres
  components/   # Composants de niveau écran
  controllers/  # Pont entre l'UI et les services (chargement des données)
  services/     # Client HTTP, fournisseur de contexte
  models/       # Modèles de données TypeScript (classes)
  enums/        # Constantes, enums, couleurs, endpoints API

components/     # Composants UI génériques partagés
hooks/          # Hooks React personnalisés
assets/         # Polices, icônes, images
```

## Fonctionnalités

- Affichage et contrôle des lumières (on/off, variateur)
- Gestion des volets/stores (ouverture, fermeture, arrêt, niveau)
- Consultation des capteurs de température
- Contrôle des thermostats (point de consigne)
- Gestion des groupes d'équipements
- Paramètres de l'application

## Contribution

1. Forker le dépôt
2. Créer une branche pour vos modifications
3. Effectuer vos modifications et les tester (`npm test`, `npm run lint`)
4. Soumettre une pull request avec une description claire des changements

## Licence

Ce projet est sous licence MIT. Consultez le fichier `LICENSE` pour plus d'informations.
