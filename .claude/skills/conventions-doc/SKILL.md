---
name: conventions-doc
description: "Conventions documentaires du projet domoticz-mobile pour 🟣 DOCly : fichiers sous sa responsabilité, langue, ADR, changelog, diagrammes. Prioritaire sur le générique."
user-invocable: false
---

# Conventions projet — domoticz-mobile (documentation)

> Projet : `domoticz-mobile` — application mobile React Native / Expo (Android + Web) pour piloter un serveur Domoticz.

## Fichiers sous la responsabilité de DOCly

### Racine
- `README.md` — présentation, prérequis, démarrage rapide
- `CHANGELOG.md` — historique des versions (Keep a Changelog), nouvelle version ajoutée **en tête**
- `CONTRIBUTING.md` — git workflow, conventions de code, PR
- `AGENTS.md` — instructions agents génériques (versions de stack à garder alignées)
- `.claude/CLAUDE.md` — contexte des futures sessions (sections projet uniquement)

### `docs/`
- `docs/ARCHITECTURE.md` (**obligatoire**) — stack, structure, couches, flux de données, § Responsive
- `docs/adr/` — ADR rédigés sur contenu 🟠 ARCos (skill `adr-writing`)
- `docs/API.md` — référence API Domoticz (endpoints, paramètres, exemples cURL)
- `docs/TESTING.md` — guide Jest (setup, conventions, couverture)
- `docs/DEPLOIEMENT.md`, `docs/PROCESS-VEILLE-VERSIONS.md` — build/déploiement EAS, veille des versions
- Wiki GitHub (`domoticz-mobile.wiki/`, `Home.md`) — hors dépôt

### `.claude/skills/` (procédures partagées)
Mettre à jour si les procédures changent (cohérence avec `.claude/PLANS.md`) :
`plan-creation`, `plan-phase-execution`, `parallel-guide`, `adr-writing`.

## Conventions

- **Langue** : français pour le texte, anglais pour les blocs de code.
- **`docs/ARCHITECTURE.md` obligatoire** dans tout projet.
- **ADR** : un fichier `docs/adr/NNN-titre.md` par décision majeure (numérotation continue, dernier : 014).
- **Index des plans** `.claude/plans/README.md` : plans + statut global uniquement.
- **Versions à maintenir** dans la doc : Expo SDK ~56, React Native 0.85, React 19.2 (Domoticz : serveur
  externe, version libre). Ne pas dupliquer de version hors fichiers nécessaires (Renovate / ADR-012).
- **Terminologie UI** : « Allumé/Éteint », « Ouvert/Fermé », « Déconnecté », « Mixte » — jamais « On/Off ».
- Dépôt **standalone** (pas de projet partenaire) : `docs/` + wiki = référence unique ; toute modification
  d'architecture se reflète dans `docs/ARCHITECTURE.md`.

## Ce que DOCly ne fait PAS

- Modifier le code source ou les tests.
- Prendre des décisions d'architecture (rôle 🟠 ARCos).
