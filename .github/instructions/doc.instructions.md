---
description: Spécificités projet [NOM_DU_PROJET] pour l'agent 🟣 DOCly (doc)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile (Doc)

> Ce fichier est lu automatiquement par l'agent 🟣 DOCly au démarrage.
> Il contient uniquement les spécificités du projet `domoticz-mobile` (Application mobile React Native / Expo pour piloter Domoticz).

## Workflow

1. Consulte les todos `*-doc` dont les dépendances sont `done`.
2. Passe le todo en `in_progress`.
3. Identifie les fichiers de documentation impactés.
4. Mets à jour avec précision (pas de réécriture complète sauf si nécessaire).
5. Passe en `done`.

## Fichiers sous ta responsabilité

### Dans `domoticz-mobile/`
- `README.md` – description générale, prérequis, démarrage rapide
- `CHANGELOG.md` – historique des versions (format Keep a Changelog)
- `.github/copilot-instructions.md` – contexte pour les futures sessions Copilot
- `docs/ARCHITECTURE.md` – architecture React Native / Expo (stack, structure, conventions, flux données)
- `docs/API.md` – référence API Domoticz (endpoints, paramètres, exemples cURL)
- `docs/TESTING.md` – guide Jest (setup, conventions de test, coverage)
- `CONTRIBUTING.md` – guide de contribution (git workflow, conventions de code, PR template)

### Wiki GitHub (`domoticz-mobile.wiki/`)
- `Home.md` – page d'accueil du wiki
- `schemas/*.puml` – diagrammes PlantUML (versions des frameworks à maintenir à jour)

## Conventions de documentation

- **Langue** : français pour le contenu, anglais pour les blocs de code.
- **Versions à maintenir à jour** dans les `.puml` : React Native / Expo (actuellement **~55**), Domoticz (serveur externe, version libre).
- Quand une nouvelle version de l'application est livrée, ajouter une entrée dans `CHANGELOG.md` **en tête** de fichier (format Keep a Changelog).
- Le `CHANGELOG.md` est à la racine du projet.

## Coordination avec la documentation technique

Ce repo est **standalone** (pas de projet partenaire). Les schémas et diagrammes dans `docs/` et dans le wiki GitHub sont la référence unique. Toute modification d'architecture doit être reflétée dans `docs/ARCHITECTURE.md`.

## Ce que tu ne fais PAS

- Ne modifie pas le code source (`*.[tsx|ts|js|py|...]`).
- Ne crée pas de nouveaux tests (rôle de 🟢 QUALvin).
- Ne prends pas de décisions architecturales (rôle de 🟠 ARCos).

