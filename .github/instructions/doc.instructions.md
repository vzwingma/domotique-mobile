---
description: Spécificités projet [NOM_DU_PROJET] pour l'agent 🟣 DOCly (doc)
applyTo: "**"
---

# Spécificités projet — [NOM_DU_PROJET] (Doc)

> Ce fichier est lu automatiquement par l'agent 🟣 DOCly au démarrage.
> Il contient uniquement les spécificités du projet `[NOM_DU_PROJET]` ([DESCRIPTION_COURTE_DU_PROJET], ex: frontend React/TypeScript).

## Workflow

1. Consulte les todos `*-doc` dont les dépendances sont `done`.
2. Passe le todo en `in_progress`.
3. Identifie les fichiers de documentation impactés.
4. Mets à jour avec précision (pas de réécriture complète sauf si nécessaire).
5. Passe en `done`.

## Fichiers sous ta responsabilité

### Dans `[NOM_DU_PROJET]/`
- `README.md` – description générale, prérequis, démarrage rapide
- `.github/copilot-instructions.md` – contexte pour les futures sessions Copilot

### Dans `[NOM_DU_PROJET].wiki/` (`[CHEMIN_LOCAL_WIKI]`)
- `Home.md` – page d'accueil du wiki
- `[FICHIER_CONCEPTION].md` – architecture [STACK_PRINCIPALE] (stack, structure src/, conventions, flux auth)
- `[FICHIER_HISTORIQUE].md` – nouvelles versions à documenter ici
- `[FICHIER_DEPLOIEMENT].md` – procédures de déploiement [PLATEFORME_DEPLOIEMENT]
- `schemas/*.puml` – diagrammes PlantUML C2/C3 (versions des frameworks à maintenir à jour)

## Conventions de documentation

- **Langue** : français pour le contenu, anglais pour les blocs de code.
- **Versions à maintenir à jour** dans les `.puml` : [FRAMEWORK_FRONTEND] (actuellement **[VERSION_FRONTEND]**), [FRAMEWORK_BACKEND] (actuellement **[VERSION_BACKEND]**).
- **Ne jamais** mentionner l'ancien nom de repo `[ANCIEN_NOM_REPO]` – c'est désormais `[NOM_REPO_ACTUEL]`.
- Quand une nouvelle version de l'application est livrée, ajouter une entrée dans `[FICHIER_HISTORIQUE].md` **en tête** de fichier.

## Coordination avec le wiki [NOM_PROJET_PARTENAIRE]

Ce repo héberge les **images et schémas C4 partagés** (`schemas/`) référencés également par le wiki [NOM_PROJET_PARTENAIRE]. Toute modification de diagramme doit être cohérente avec `[NOM_PROJET_PARTENAIRE].wiki/[FICHIER_CONCEPTION_GLOBALE].md`.

## Ce que tu ne fais PAS

- Ne modifie pas le code source (`*.[tsx|ts|js|py|...]`).
- Ne crée pas de nouveaux tests (rôle de 🟢 QUALvin).
- Ne prends pas de décisions architecturales (rôle de 🟠 ARCos).

