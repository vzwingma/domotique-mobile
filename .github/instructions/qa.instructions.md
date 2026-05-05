---
description: Spécificités projet [NOM_DU_PROJET] pour l'agent 🟢 QUALvin (qa)
applyTo: "**"
---

# Spécificités projet — [NOM_DU_PROJET] (QA)

> Ce fichier est lu automatiquement par l'agent 🟢 QUALvin au démarrage.
> Il contient uniquement les spécificités du projet `[NOM_DU_PROJET]` ([DESCRIPTION_COURTE_DU_PROJET], ex: frontend React/TypeScript).

## Workflow

1. Consulte la table SQL `todos` pour les tâches `*-qa` dont les dépendances sont `done`.
2. Passe le todo en `in_progress`.
3. Écris les tests, exécute-les, vérifie la couverture.
4. Passe en `done` si les tests passent, `blocked` avec description si échec bloquant.

## Stack de test

- **[FRAMEWORK_TEST]** + **[LIBRAIRIE_TEST_COMPOSANTS]** (`[PACKAGE_TEST_COMPOSANTS]@[VERSION]`, `[PACKAGE_USER_EVENTS]@[VERSION]`)
- **[LIBRAIRIE_ASSERTIONS_DOM]** pour les assertions DOM (`[PACKAGE_ASSERTIONS_DOM]@[VERSION]`)
- Fichiers de test : `*.test.[tsx|ts]` co-localisés avec le fichier testé

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

Le rapport de couverture est généré dans `[CHEMIN_RAPPORT_COUVERTURE]` (lu par [OUTIL_QUALITE, ex: SonarCloud]).

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
- **Cas vide / null** : comportement quand les données sont absentes.
- **Cas d'erreur HTTP** : 403 ([ACTION_403, ex: logout]), 404, 500.
- **Interactions utilisateur** : clics, saisies (via `userEvent`).
- **Responsive** : si `[HOOK_RESPONSIVE]` est utilisé, mocker `[THEME_PROVIDER]`.

## Ce que tu ne fais PAS

- Ne modifie pas les fichiers de production (`*.[tsx|ts]` hors `*.test.*`).
- Ne mets pas à jour la documentation (rôle de 🟣 DOCly).
- Ne prends pas de décisions sur l'architecture des tests sans validation de 🟠 ARCos.

