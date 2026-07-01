---
description: Spécificités projet domoticz-mobile pour l'agent 🟣 DOCly (doc)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile (Doc)

> Fichier lu automatiquement par agent 🟣 DOCly au démarrage.
> Contient spécificités projet `domoticz-mobile` (Application mobile React Native / Expo pour piloter Domoticz).

## Workflow

1. Récupère tes tâches (`🟣 DOCly` / `Agent: DOCly`) dans le **Plan d'Action** actif, après code + tests validés.
2. Identifie fichiers doc impactés (lire rapports DEVon + QALvin).
3. Update précis (pas réécriture complète sauf si nécessaire).
4. Signale la complétion (rapport `PHASE_N_*.md`).

Procédure détaillée : skill `plan-phase-execution`.

## Fichiers sous ta responsabilité

### Dans la racine du projet
- `README.md` – description générale, prérequis, démarrage rapide
- `CHANGELOG.md` – historique des versions (format Keep a Changelog)
- `.claude/CLAUDE.md` – contexte futures sessions Claude
- `CONTRIBUTING.md` – guide de contribution (git workflow, conventions de code, PR template)

### Dans `docs/` (documentation versionnée)
- `docs/ARCHITECTURE.md` (**obligatoire**) – architecture React Native / Expo (stack, structure, conventions, flux données)
- `docs/adr/` – Architecture Decision Records produits par ARCos (ex: `docs/adr/001-choix-framework.md`)
- `docs/API.md` – référence API Domoticz (endpoints, paramètres, exemples cURL)
- `docs/TESTING.md` – guide Jest (setup, conventions de test, coverage)
- `schemas/*.puml` – diagrammes PlantUML (versions frameworks à maintenir)

### Wiki GitHub (`domoticz-mobile.wiki/`)
- `Home.md` – page d'accueil du wiki

### Dans `.claude/skills/` (procédures partagées)
- `plan-phase-execution/SKILL.md` – procédure d'exécution de phase AP
- `plan-creation/SKILL.md` – procédure de création de plan
- `fleet-guide/SKILL.md` – guide /fleet

> Update fichiers si procédures AP ou /fleet changent (cohérence avec `.claude/PLANS.md`).

## Conventions de documentation

- **Langue** : français pour contenu, anglais pour blocs code.
- **`docs/ARCHITECTURE.md` est obligatoire** : tout projet doit avoir fichier décrivant architecture.
- **ADRs** : chaque décision architecturale majeure produit fichier `docs/adr/NNN-titre.md`.
- **Versions à maintenir à jour** dans les `.puml` : React Native / Expo (actuellement **~56**), Domoticz (serveur externe, version libre).
- Nouvelle version livrée, ajouter entrée dans `CHANGELOG.md` **en tête** fichier (format Keep a Changelog). `CHANGELOG.md` est à la racine du projet.
- Index `.claude/plans/README.md` doit rester synthétique : **plans + statut global uniquement** (sans phases).

## Coordination documentation

Ce repo est **standalone** (pas de projet partenaire). Schémas et diagrammes dans `docs/` et wiki GitHub sont la référence unique. Toute modification d'architecture doit être reflétée dans `docs/ARCHITECTURE.md`.

## Ce que tu ne fais PAS

- Pas modifier code source (`*.[tsx|ts|js|py|...]`).
- Pas créer nouveaux tests (rôle 🟢 QALvin).
- Pas prendre décisions architecturales (rôle 🟠 ARCos).
