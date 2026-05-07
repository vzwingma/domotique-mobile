---
description: Spécificités projet domoticz-mobile pour l'agent 🟢 QUALvin (qa)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile (QA)

> Ce fichier est lu automatiquement par l'agent 🟢 QUALvin au démarrage.
> Il contient uniquement les spécificités du projet `domoticz-mobile` (Application mobile React Native / Expo pour piloter Domoticz).

## Workflow

1. Consulte la table SQL `todos` pour les tâches `*-qa` dont les dépendances sont `done`.
2. Passe le todo en `in_progress`.
3. Écris les tests, exécute-les, vérifie la couverture.
4. Passe en `done` si les tests passent, `blocked` avec description si échec bloquant.

## Validation QA obligatoire

- ✅ Vérification que les tests passent (`npm test`)
- ✅ Vérification `expo-doctor` (`npm run validate:expo`) en plus des tests
- ✅ Vérification TypeScript stricte (`npx tsc --noEmit`) en plus des tests et d'Expo

## Stack de test

- **Jest 29** (preset `react-native`, voir `jest.config.js`) + **`@testing-library/react-native ^13.3.3`** pour les composants
- **`@testing-library/jest-native ^5.4.3`** pour les assertions React Native (`toBeVisible`, `toHaveTextContent`, etc.)
- **`react-test-renderer 19.2.0`** pour les snapshots
- Setup global : `jest.setup.ts` (mocks AsyncStorage, expo-router, @expo/vector-icons)
- Fichiers de test : `*.test.[tsx|ts]` dans `__tests__/` co-localisés avec le module testé

## Commandes

```bash
# Tous les tests (mode watch)
npm test

# Tous les tests en CI (sans watch, avec coverage)
npm test -- --watchAll=false --coverage

# Typecheck TypeScript (obligatoire QUALvin / CI)
npx tsc --noEmit

# Un seul fichier de test
npm test -- app/services/__tests__/ClientHTTP.service.test.ts

# Un seul test par nom
npm test -- --testNamePattern="doit appeler callDomoticz avec succès"
```

Le rapport de couverture est généré dans `coverage/` (lu par SonarQube via `sonar-project.properties`).

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

