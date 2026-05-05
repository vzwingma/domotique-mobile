---
description: Spécificités projet [NOM_DU_PROJET] pour l'agent 🔵 DEVon (dev)
applyTo: "**"
---

# Spécificités projet — [NOM_DU_PROJET] (Dev)

> Ce fichier est lu automatiquement par l'agent 🔵 DEVon au démarrage.
> Il contient uniquement les spécificités du projet `[NOM_DU_PROJET]` ([DESCRIPTION_COURTE_DU_PROJET], ex: frontend React/TypeScript).

## Workflow

1. Consulte la table SQL `todos` pour trouver les tâches `owner = 'dev'` dont le statut est `pending` et sans dépendances bloquantes.
2. Passe le todo en `in_progress` avant de commencer.
3. Implémente la fonctionnalité en respectant les conventions ci-dessous.
4. Passe le todo en `done` une fois le code prêt.

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
- **[LIBRAIRIE_UI] [VERSION]** (`[PACKAGE_UI]`) – seule bibliothèque UI autorisée
- **[LIBRAIRIE_ROUTING] [VERSION]** – `[STRATEGIE_ROUTING]`, routes dans `[FICHIER_ROUTES]`
- **[LIBRAIRIE_AUTH] [VERSION]** – [CONSIGNE_AUTH, ex: ne pas manipuler les tokens OAuth directement]
- **[LIBRAIRIE_CHARTS] [VERSION]** – pour les visualisations ([TYPES_GRAPHIQUES])

## Conventions de code

### Composants

```typescript
// Toujours : composant fonctionnel typé
export const MonComposant: React.FC<MonComposantProps> = ({ prop1, prop2 }): JSX.Element => {
  // ...
};
```

- Props interfaces dans `[FICHIER_PROPS]`.
- Sous-composants d'une page dans `[DOSSIER_SUBCOMPONENTS]/`, boutons d'action dans `[DOSSIER_ACTIONS]/`.
- Utiliser `useMemo` pour les calculs dérivés coûteux, `useCallback` pour les handlers passés en props.
- Responsive via `[METHODE_RESPONSIVE]`.

### Appels HTTP

```typescript
// Toujours passer par [SERVICE_HTTP]
import { call } from '../Services/[SERVICE_HTTP]';
// URL avec {{}} comme marqueur positionnel
call('GET', [CONFIG_URL_VARIABLE], '/[CHEMIN_API]/{{}}/[RESSOURCE]', [paramId]);
```

### Modèles et état

- Les classes de données vont dans `[DOSSIER_MODELS]`.
- L'état global via `useContext([NOM_CONTEXT])`.
- L'état local UI via `useState`.

### Enums et constantes

- Constantes techniques dans `[FICHIER_CONSTANTES_TECHNIQUES]`.
- Enums métier dans `[FICHIER_ENUMS_METIER]`.
- Ne pas hardcoder les URLs ou les clés API dans les composants.

## Ce que tu ne fais PAS

- Ne modifie pas les fichiers `*.test.[tsx|ts]` (rôle de 🟢 QUALvin).
- Ne mets pas à jour `README.md`, les wikis, ni `copilot-instructions.md` (rôle de 🟣 DOCly).
- Ne prends pas de décisions architecturales (nouveau Context, nouvelle lib) sans todo venant de 🟠 ARCos.

