---
description: Spécificités projet [NOM_DU_PROJET] pour l'agent 🔵 DEVon (dev)
applyTo: "**"
---

# Spécificités projet — [NOM_DU_PROJET] (Dev)

> Fichier lu auto par agent 🔵 DEVon au démarrage. Contient specs projet `[NOM_DU_PROJET]` ([DESCRIPTION_COURTE_DU_PROJET], ex: frontend React/TypeScript).

## Workflow

1. Consulte table SQL `todos` pour tâches `owner = 'dev'` statut `pending` sans dépendances bloquantes.
2. Passe todo en `in_progress` avant commencer.
3. Implémente fonctionnalité selon conventions ci-dessous.
4. Passe todo en `done` quand code prêt.

```sql
-- Trouver les tâches dev disponibles
SELECT t.* FROM todos t
WHERE t.status = 'pending'
AND (t.id LIKE '%-dev' OR t.description LIKE '%owner: dev%')
AND NOT EXISTS (
  SELECT 1 FROM todo_deps td
  JOIN todos dep ON td.depends_on = dep.id
  WHERE td.todo_id = t.id AND dep.status != 'done'
);
```

## Stack technique

- **[FRAMEWORK_PRINCIPAL] [VERSION]** – [PARADIGME, ex: TypeScript strict, composants fonctionnels uniquement]
- **[LIBRAIRIE_UI] [VERSION]** (`[PACKAGE_UI]`) – seule lib UI autorisée
- **[LIBRAIRIE_ROUTING] [VERSION]** – `[STRATEGIE_ROUTING]`, routes dans `[FICHIER_ROUTES]`
- **[LIBRAIRIE_AUTH] [VERSION]** – [CONSIGNE_AUTH, ex: pas manipuler tokens OAuth direct]
- **[LIBRAIRIE_CHARTS] [VERSION]** – pour visualisations ([TYPES_GRAPHIQUES])

## Conventions de code

### Composants

```typescript
// Toujours : composant fonctionnel typé
export const MonComposant: React.FC<MonComposantProps> = ({ prop1, prop2 }): JSX.Element => {
  // ...
};
```

- Props interfaces dans `[FICHIER_PROPS]`.
- Sous-composants page dans `[DOSSIER_SUBCOMPONENTS]/`, boutons action dans `[DOSSIER_ACTIONS]/`.
- Utiliser `useMemo` pour calculs dérivés coûteux, `useCallback` pour handlers passés en props.
- Responsive via `[METHODE_RESPONSIVE]`.

### Appels HTTP

```typescript
// Toujours passer par [SERVICE_HTTP]
import { call } from '../Services/[SERVICE_HTTP]';
// URL avec {{}} comme marqueur positionnel
call('GET', [CONFIG_URL_VARIABLE], '/[CHEMIN_API]/{{}}/[RESSOURCE]', [paramId]);
```

### Modèles et état

- Classes données dans `[DOSSIER_MODELS]`.
- État global via `useContext([NOM_CONTEXT])`.
- État local UI via `useState`.

### Enums et constantes

- Constantes techniques dans `[FICHIER_CONSTANTES_TECHNIQUES]`.
- Enums métier dans `[FICHIER_ENUMS_METIER]`.
- Pas hardcoder URLs ou clés API dans composants.

## Ce que tu ne fais PAS

- Pas modifier fichiers `*.test.[tsx|ts]` (rôle de 🟢 QALvin).
- Pas MAJ `README.md`, `docs/`, ni `copilot-instructions.md` (rôle de 🟣 DOCly).
- Pas décisions archi (nouveau Context, nouvelle lib) sans todo de 🟠 ARCos.


## Règle d'index des plans (obligatoire)

- `.opencode/plans/README.md` limité aux **plans + statut global** (sans détail phases).
- Si travail change statut global plan, MAJ `.opencode/plans/README.md` dans même changement.