---
description: Spécificités projet [NOM_DU_PROJET] pour l'agent ARCos (architect)
applyTo: "**"
---

# Spécificités projet — [NOM_DU_PROJET]

> Fichier auto-lu par agent 🟠 ARCos au démarrage.
> Contient spécificités projet `[NOM_DU_PROJET]` ([DESCRIPTION_COURTE_DU_PROJET], ex: frontend React/TypeScript).

## Lecture du document d'architecture

**Au démarrage**, lis `docs/ARCHITECTURE.md` si existe dans projet courant :
- Comprendre stack technique, couches applicatives, composants clés
- Assurer cohérence décisions planification avec architecture existante
- Si absent, suggérer à 🟣 DOCly création au terme initiative

## Conventions architecturales

- **Couches** : `[COUCHE_UI]/` (UI) → `[COUCHE_ETAT]/` (état global) → `[COUCHE_HTTP]/` (HTTP) → `[COUCHE_UTILS]/` (constantes, helpers).
- **État global** : uniquement via `[PROVIDER_ETAT_GLOBAL]`. Pas créer nouveau Context sans validation.
- **HTTP** : toujours via `[SERVICE_HTTP]`. Pas utiliser `fetch` direct dans composant.
- **Routing** : `[STRATEGIE_ROUTING]`. Nouvelles routes s'ajoutent dans `[FICHIER_ROUTES]`.
- **Pas bibliothèque state management externe** sans décision architecturale explicite.
- **UI** : `[LIBRAIRIE_UI]` uniquement. Pas introduire autre bibliothèque UI.

## Documentation des décisions architecturales (ADR)

Chaque décision architecturale majeure doit produire fichier ADR dans `docs/adr/` :

- **Nommage** : `docs/adr/NNN-titre-court.md` (ex: `docs/adr/001-choix-framework-ui.md`)
- **Contenu minimal** : contexte, décision prise, alternatives considérées, conséquences
- **Quand créer ADR** : nouveau framework, changement pattern architectural, décision sécurité, choix structure majeur
- Déléguer création ADR à 🟣 DOCly après validation décision

## Protocole de handoff SQL

Quand tâche prête à être réalisée, insère todos dans table SQL avec ce format :

```sql
INSERT INTO todos (id, title, description, status) VALUES
  ('feat-xxx-dev', 'Titre dev',  'Description précise : fichiers à créer/modifier, interfaces à respecter', 'pending'),
  ('feat-xxx-qa',  'Titre QA',   'Tests à écrire : cas nominaux, cas d''erreur, composants à tester',       'pending'),
  ('feat-xxx-doc', 'Titre Doc',  'Documentation à mettre à jour : README, docs/ARCHITECTURE.md, docs/adr/, copilot-instructions.md', 'pending');

INSERT INTO todo_deps (todo_id, depends_on) VALUES
  ('feat-xxx-qa',  'feat-xxx-dev'),
  ('feat-xxx-doc', 'feat-xxx-dev');
```

Convention nommage IDs : `feat-<nom>-dev` / `feat-<nom>-qa` / `feat-<nom>-doc`.

## Interactions avec l'agent partenaire ([NOM_PROJET_PARTENAIRE])

- Contrats API (URL, paramètres, codes retour) définis en coordination avec Architecte [ROLE_PARTENAIRE, ex: backend].
- URLs µServices configurées dans `[FICHIER_CONSTANTES_TECHNIQUES]` et fichiers `.env.*`.
- Tout nouveau endpoint [PARTENAIRE] doit être reflété dans `[SERVICE_HTTP]` avant que agent Dev puisse utiliser.

## Agents du projet

| Icône | Nom      | Fichier agent          | Rôle                          |
|-------|----------|------------------------|-------------------------------|
| 🔵    | DEVon    | `Devon.agent.md`         | Implémentation [STACK_PRINCIPALE] |
| 🟢    | QALvin  | `Qalvin.agent.md`          | Tests unitaires ([FRAMEWORK_TEST]) |
| 🟣    | DOCly    | `Docly.agent.md`         | Documentation (README, /docs) |


## Règle d'index des plans (obligatoire)

- Fichier `.opencode/plans/README.md` est **index synthétique** : doit contenir uniquement liste plans et leur **statut global**.
- Pas afficher statuts phases.
- Toute création plan ou changement statut global doit inclure, dans même changement, mise à jour `.opencode/plans/README.md`.