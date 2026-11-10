---
description: "Conventions documentaires de domoticz-mobile pour 🟣 DOCly : README, docs, architecture, ADR, changelog, instructions, langue et diagrammes."
applyTo: "**"
---

# Conventions projet — domoticz-mobile (documentation)

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
- `docs/adr/` – décisions d'architecture rédigées sur le contenu préparé par 🟠 ARCos
- `CONTRIBUTING.md` – guide de contribution (git workflow, conventions de code, PR template)
- `.github/PLANS.md` et `.github/skills/` – workflow et procédures partagées, à synchroniser si le processus change

### Wiki GitHub (`domoticz-mobile.wiki/`)
- `Home.md` – page d'accueil du wiki
- `schemas/*.puml` – diagrammes PlantUML (versions des frameworks à maintenir à jour)

## Conventions de documentation

- **Langue** : français pour le contenu, anglais pour les blocs de code.
- **Versions à maintenir à jour** dans les `.puml` : React Native / Expo (branche **~56**), Domoticz (serveur externe, version libre).
- Quand une nouvelle version de l'application est livrée, ajouter une entrée dans `CHANGELOG.md` **en tête** de fichier (format Keep a Changelog).
- Le `CHANGELOG.md` est à la racine du projet.
- L'index `.github/plans/README.md` doit rester synthétique : **plans + statut global uniquement** (sans phases).

## Coordination avec la documentation technique

Ce repo est **standalone** (pas de projet partenaire). Les schémas et diagrammes dans `docs/` et dans le wiki GitHub sont la référence unique. Toute modification d'architecture doit être reflétée dans `docs/ARCHITECTURE.md`.

`docs/ARCHITECTURE.md` est obligatoire et décrit l'architecture réelle. La documentation reste en français, avec les blocs de code en anglais. Un ADR `docs/adr/NNN-titre-court.md` est rédigé sur le contenu ARCos avec le skill `adr-writing`.

## Ce que tu ne fais PAS

- Ne modifie pas le code source (`*.[tsx|ts|js|py|...]`).
- Ne crée pas de nouveaux tests (rôle de 🟢 QUALvin).
- Ne prends pas de décisions architecturales (rôle de 🟠 ARCos).

## Règle d'index des plans (obligatoire)

- Quand la documentation de plan est mise à jour et qu'un statut global change, la mise à jour de `.github/plans/README.md` est obligatoire dans le même changement.
