# Domoticz Mobile
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=vzwingma_domotique-mobile&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=vzwingma_domotique-mobile)

Ce projet est une application mobile pour gérer les équipements Domoticz. L'application utilise React Native et Expo pour fournir une interface utilisateur intuitive et réactive.

## Prérequis

Avant de commencer, assurez-vous d'avoir les éléments suivants installés sur votre machine :

- Node.js (version 14 ou supérieure)
- npm (version 6 ou supérieure) ou yarn (version 1.22 ou supérieure)
- Expo CLI (peut être installé globalement via npm ou yarn)

## Installation

1. Clonez le dépôt :

    ```bash
    git clone https://github.com/votre-utilisateur/domoticz-mobile.git
    cd domoticz-mobile
    ```

2. Installez les dépendances :

    ```bash
    npm install
    ```

    ou

    ```bash
    yarn install
    ```

## Démarrage

Pour démarrer l'application en mode développement, utilisez la commande suivante :

```bash
npx expo start
```

Cela ouvrira une fenêtre de navigateur avec l'interface Expo, où vous pourrez choisir de lancer l'application sur un émulateur ou un appareil physique.

## Structure du Projet

- `components/` : Contient les composants React utilisés dans l'application.
- `constants/` : Contient les constantes utilisées dans l'application, comme les couleurs et les types Domoticz.
- `models/` : Contient les modèles de données utilisés dans l'application.
- `services/` : Contient les services (appels vers Domoticz) de l'application.
- `navigation/` : Contient les configurations de navigation pour l'application.

## Fonctionnalités

- Gestion des équipements Domoticz : Affiche et contrôle les équipements Domoticz comme les lumières et les volets.
- Navigation par onglets : Utilise une navigation par onglets pour une expérience utilisateur fluide.

## Utilisation

Une fois l'application démarrée en mode développement, vous pouvez la visualiser sur votre appareil en utilisant l'application Expo Go. Scannez simplement le code QR affiché dans votre terminal ou dans l'interface web Expo DevTools.

## Configuration

Avant de pouvoir utiliser l'application, vous devez configurer les paramètres de connexion à votre serveur Domoticz. Ouvrez le fichier `config.js` situé dans le répertoire `src/config` et modifiez les valeurs appropriées.

## Fonctionnalités

Cette application mobile vous permet de :

- Afficher et contrôler les équipements Domoticz.
- Gérer les scènes et les groupes d'équipements.
- Recevoir des notifications en temps réel pour les événements Domoticz.
- Personnaliser l'interface utilisateur selon vos préférences.

## Contribution

Si vous souhaitez contribuer à ce projet, vous pouvez suivre les étapes suivantes :

1. Forker le dépôt.
2. Créer une branche pour vos modifications.
3. Effectuer vos modifications et les tester.
4. Soumettre une demande de fusion (pull request) avec une description claire des modifications apportées.

## Licence

Ce projet est sous licence MIT. Veuillez consulter le fichier `LICENSE` pour plus d'informations.
