---
description: Spécificités projet [NOM_DU_PROJET] pour l'agent 🟢 QALvin (qa)
applyTo: "**"
---

# Spécificités projet — [NOM_DU_PROJET] (QA)

> Fichier auto-lu par 🟢 QALvin au démarrage.
> Contient specs projet `[NOM_DU_PROJET]` ([DESCRIPTION_COURTE_DU_PROJET], ex: frontend React/TypeScript).

## Workflow

1. Consulte table SQL `todos` pour tâches `*-qa` avec dépendances `done`.
2. Passe todo en `in_progress`.
3. Écris tests, exécute, vérifie couverture.
4. Passe en `done` si tests passent, `blocked` + description si échec bloquant.

## Stack de test

- **[FRAMEWORK_TEST]** + **[LIBRAIRIE_TEST_COMPOSANTS]** (`[PACKAGE_TEST_COMPOSANTS]@[VERSION]`, `[PACKAGE_USER_EVENTS]@[VERSION]`)
- **[LIBRAIRIE_ASSERTIONS_DOM]** pour assertions DOM (`[PACKAGE_ASSERTIONS_DOM]@[VERSION]`)
- Fichiers test : `*.test.[tsx|ts]` co-localisés avec fichier testé

## Commandes

```bash
# Tous les tests (mode watch)
[COMMANDE_TEST_WATCH]

# Tous les tests en CI (sans watch, avec coverage)
[COMMANDE_TEST_CI]

# Un seul fichier de test
[COMMANDE_TEST_FICHIER] [CHEMIN_EXEMPLE_TEST]

# Un seul test par nom
[COMMANDE_TEST_NOM_PATTERN] "[NOM_EXEMPLE_TEST]"
```

Rapport couverture généré dans `[CHEMIN_RAPPORT_COUVERTURE]` (lu par [OUTIL_QUALITE, ex: SonarCloud]).

## Ce qu'il faut tester

### Composants [FRAMEWORK_PRINCIPAL]

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { [NOM_CONTEXT] } from '[CHEMIN_CONTEXT_PROVIDER]';

// Toujours mocker le Context si le composant l'utilise
const mockContext = { [CLE_CONTEXTE]: ..., [SETTER_CONTEXTE]: jest.fn(), ... };

test('doit afficher le libellé de l\'opération', () => {
  render(
    <[NOM_CONTEXT].Provider value={mockContext}>
      <MonComposant ... />
    </[NOM_CONTEXT].Provider>
  );
  expect(screen.getByText('Libellé attendu')).toBeInTheDocument();
});
```

### Services

```typescript
// Mocker fetch pour [SERVICE_HTTP]
global.fetch = jest.fn(() => Promise.resolve({ status: 200, json: () => Promise.resolve(data) }));
```

## Cas à couvrir systématiquement

- **Cas nominal** : rendu correct avec données valides.
- **Cas vide / null** : comportement quand données absentes.
- **Cas d'erreur HTTP** : 403 ([ACTION_403, ex: logout]), 404, 500.
- **Interactions utilisateur** : clics, saisies (via `userEvent`).
- **Responsive** : si `[HOOK_RESPONSIVE]` utilisé, mocker `[THEME_PROVIDER]`.

## Ce que tu ne fais PAS

- Modifie pas fichiers production (`*.[tsx|ts]` hors `*.test.*`).
- Mets pas à jour docs (rôle 🟣 DOCly).
- Prends pas décisions architecture tests sans validation 🟠 ARCos.

## Règle d'index des plans (obligatoire)

- `.opencode/plans/README.md` est index **plans + statut global** uniquement (pas phases).
- Si phase QA livrée change statut global plan, synchronise `.opencode/plans/README.md` dans même changement.