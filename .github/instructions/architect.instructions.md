---
description: Spécificités projet [NOM_DU_PROJET] pour l'agent ARCos (architect)
applyTo: "**"
---

# Spécificités projet — [NOM_DU_PROJET]

> Ce fichier est lu automatiquement par l'agent 🟠 ARCos au démarrage.
> Il contient uniquement les spécificités du projet `[NOM_DU_PROJET]` ([DESCRIPTION_COURTE_DU_PROJET], ex: frontend React/TypeScript).

## Conventions architecturales

- **Couches** : `[COUCHE_UI]/` (UI) → `[COUCHE_ETAT]/` (état global) → `[COUCHE_HTTP]/` (HTTP) → `[COUCHE_UTILS]/` (constantes, helpers).
- **État global** : uniquement via `[PROVIDER_ETAT_GLOBAL]`. Ne pas créer de nouveau Context sans validation.
- **HTTP** : toujours via `[SERVICE_HTTP]`. Ne pas utiliser `fetch` directement dans un composant.
- **Routing** : `[STRATEGIE_ROUTING]`. Les nouvelles routes s'ajoutent dans `[FICHIER_ROUTES]`.
- **Pas de bibliothèque de state management externe** sans décision architecturale explicite.
- **UI** : `[LIBRAIRIE_UI]` uniquement. Ne pas introduire d'autre bibliothèque UI.

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

## Interactions avec l'agent partenaire ([NOM_PROJET_PARTENAIRE])

- Les contrats d'API (URL, paramètres, codes retour) sont définis en coordination avec l'Architecte [ROLE_PARTENAIRE, ex: backend].
- Les URLs des µServices sont configurées dans `[FICHIER_CONSTANTES_TECHNIQUES]` et les fichiers `.env.*`.
- Tout nouveau endpoint [PARTENAIRE] doit être reflété dans `[SERVICE_HTTP]` avant que l'agent Dev puisse l'utiliser.

## Agents du projet

| Icône | Nom      | Fichier agent          | Rôle                          |
|-------|----------|------------------------|-------------------------------|
| 🔵    | DEVon    | `Devon.agent.md`         | Implémentation [STACK_PRINCIPALE] |
| 🟢    | QUALvin  | `Qalvin.agent.md`          | Tests unitaires ([FRAMEWORK_TEST]) |
| 🟣    | DOCly    | `Docly.agent.md`         | Documentation (README, Wiki)  |

