---
description: Spécificités projet domoticz-mobile pour l'agent ARCos (architect)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile

> Ce fichier est lu automatiquement par l'agent 🟠 ARCos au démarrage.
> Il contient uniquement les spécificités du projet `domoticz-mobile` (Application mobile React Native / Expo pour piloter Domoticz).

## Conventions architecturales

- **Couches** : `app/(tabs)/` + `app/components/` (UI) → `app/services/DomoticzContextProvider` (état global) → `app/services/ClientHTTP.service.ts` (HTTP) → `app/enums/` (constantes, helpers).
- **État global** : uniquement via `DomoticzContextProvider` (React Context API). Ne pas créer de nouveau Context sans validation.
- **HTTP** : toujours via `callDomoticz()` dans `ClientHTTP.service.ts`. Ne pas utiliser `fetch` directement dans un composant ou controller.
- **Routing** : Expo Router, file-based routing. Les nouvelles routes s'ajoutent dans `app/(tabs)/_layout.tsx`.
- **Pas de bibliothèque de state management externe** sans décision architecturale explicite.
- **UI** : Composants React Native natifs uniquement. Ne pas introduire de bibliothèque UI externe sans validation.

## Protocole de handoff SQL

Quand une tâche est prête à être réalisée, insère les todos dans la table SQL avec ce format :

```sql
INSERT INTO todos (id, title, description, status) VALUES
  ('feat-xxx-dev', 'Titre dev',  'Description précise : fichiers à créer/modifier, interfaces à respecter', 'pending'),
  ('feat-xxx-qa',  'Titre QA',   'Tests à écrire : cas nominaux, cas d''erreur, composants à tester',       'pending'),
  ('feat-xxx-doc', 'Titre Doc',  'Documentation à mettre à jour : README, Wiki, copilot-instructions.md',   'pending');

INSERT INTO todo_deps (todo_id, depends_on) VALUES
  ('feat-xxx-qa',  'feat-xxx-dev'),
  ('feat-xxx-doc', 'feat-xxx-dev');
```

Convention de nommage des IDs : `feat-<nom>-dev` / `feat-<nom>-qa` / `feat-<nom>-doc`.

## Interactions avec le backend Domoticz

- Les contrats d'API Domoticz (URL, paramètres, codes retour) sont documentés dans `docs/API.md`.
- Les URLs des endpoints sont configurées dans `app/enums/APIconstants.ts` (enum `SERVICES_URL`) et les fichiers `.env`.
- Tout nouvel endpoint doit être ajouté dans `APIconstants.ts` avant que l'agent DEVon puisse l'utiliser.

## Agents du projet

| Icône | Nom      | Fichier agent        | Rôle                                            |
|-------|----------|----------------------|-------------------------------------------------|
| 🔵    | DEVon    | `Devon.agent.md`     | Implémentation React Native / Expo / TypeScript |
| 🟢    | QUALvin  | `Qalvin.agent.md`    | Tests unitaires (Jest 29 + Testing Library)     |
| 🟣    | DOCly    | `Docly.agent.md`     | Documentation (README, Wiki, CHANGELOG)         |
| 💰    | FINNops  | `FinnOps.agent.md`   | Analyse coûts IA + optimisation sessions        |

## Règle d'index des plans (obligatoire)

- Le fichier `.github/plans/README.md` est un **index synthétique** : il doit contenir uniquement la liste des plans et leur **statut global**.
- Ne pas y afficher les statuts de phases.
- Toute création de plan ou changement de statut global doit inclure, dans le même changement, la mise à jour de `.github/plans/README.md`.

