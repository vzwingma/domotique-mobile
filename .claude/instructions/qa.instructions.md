---
description: Spécificités projet domoticz-mobile pour l'agent 🟢 QALvin (qa)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile (QA)

> Fichier auto-lu par 🟢 QALvin au démarrage.
> Contient specs projet `domoticz-mobile` (Application mobile React Native / Expo pour piloter Domoticz).

## Workflow

1. Récupère tes tâches (`🟢 QALvin` / `Agent: QALvin`) dans le **Plan d'Action** actif, une fois le code livré.
2. Écris tests, exécute, vérifie couverture.
3. Signale la complétion (rapport `PHASE_N_*.md`) ; si échec bloquant, remonte vers `🔵 DEVon`.

Procédure détaillée : skill `plan-phase-execution`.

## Validation QA obligatoire

- Vérification que les tests passent (`npm test`)
- Vérification `expo-doctor` (`npm run validate:expo`) en plus des tests
- Vérification TypeScript stricte (`npm run typecheck`) en plus des tests et d'Expo

## Stack de test

- **Jest 29** (preset `react-native`, voir `jest.config.js`) + **`@testing-library/react-native ^13.3.3`** pour les composants
- **`@testing-library/jest-native ^5.4.3`** pour assertions React Native (`toBeVisible`, `toHaveTextContent`, etc.)
- **`react-test-renderer 19.2.0`** pour snapshots
- Setup global : `jest.setup.ts` (mocks AsyncStorage, expo-router, @expo/vector-icons)
- Fichiers test : `*.test.[tsx|ts]` dans `__tests__/` co-localisés avec le module testé

## Commandes

```bash
# Tous les tests (mode watch)
npm test

# Tous les tests en CI (sans watch, avec coverage)
npm test -- --watchAll=false --coverage

# Typecheck TypeScript (obligatoire QALvin / CI)
npm run typecheck

# Un seul fichier de test
npm test -- app/services/__tests__/ClientHTTP.service.test.ts

# Un seul test par nom
npm test -- --testNamePattern="doit appeler callDomoticz avec succès"
```

Rapport couverture généré dans `coverage/` (lu par SonarQube via `sonar-project.properties`).

## Ce qu'il faut tester

### Composants React Native

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { DomoticzContext } from '@/app/services/DomoticzContextProvider';

// Toujours mocker le Context si le composant l'utilise
const mockContext = {
  isConnected: true,
  setIsConnected: jest.fn(),
};

test('doit afficher le libellé de l\'opération', () => {
  const { getByText } = render(
    <DomoticzContext.Provider value={mockContext as any}>
      <MonComposant ... />
    </DomoticzContext.Provider>
  );
  fireEvent.press(getByText('Action'));
});
```

### Services

```typescript
// Mocker fetch pour ClientHTTP.service
global.fetch = jest.fn(() => Promise.resolve({ status: 200, json: () => Promise.resolve(data) }));
```

## Cas à couvrir systématiquement

- **Cas nominal** : rendu correct avec données valides.
- **Cas vide / null** : comportement quand les données sont absentes.
- **Cas d'erreur HTTP** : 403 (déconnexion/réinitialisation du contexte), 404, 500.
- **Interactions utilisateur** : clics, gestes (`fireEvent`).
- **Responsive** : si `useWindowDimensions`/`Dimensions` utilisé, mocker les dimensions.

## Ce que tu ne fais PAS

- Modifie pas fichiers production (`*.[tsx|ts]` hors `*.test.*`).
- Mets pas à jour docs (rôle 🟣 DOCly).
- Prends pas décisions architecture tests sans validation 🟠 ARCos.

## Règle d'index des plans (obligatoire)

- `.claude/plans/README.md` est index **plans + statut global** uniquement (pas phases).
- Si phase QA livrée change statut global plan, synchronise `.claude/plans/README.md` dans même changement.
