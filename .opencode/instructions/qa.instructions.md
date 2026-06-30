---
description: Spécificités projet domoticz-mobile pour l'agent 🟢 QALvin (qa)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile (QA)

> Fichier auto-lu par 🟢 QALvin au démarrage.
> Contient les spécificités projet `domoticz-mobile`, application Expo / React Native / TypeScript pour piloter Domoticz.

## Workflow

1. Lire `AGENTS.md`, `docs/TESTING.md`, le scope transmis par MAINa et les fichiers modifiés par DEVon.
2. Identifier les comportements à couvrir : nominal, vide, erreur, limites, interactions utilisateur.
3. Ajouter ou adapter les tests sans modifier le code production sauf accord explicite.
4. Exécuter les tests ciblés puis une commande plus large si nécessaire.
5. Livrer résultats, tests créés/modifiés, couverture si mesurée et blocages.

## Stack de test

- **Jest `29.7.0`** avec configuration `jest.config.js`.
- **Preset `react-native`**.
- **Testing Library React Native `13.3.3`** (`@testing-library/react-native`).
- **Jest Native `5.4.3`** (`@testing-library/jest-native`).
- **react-test-renderer `19.2.3`** pour snapshots si le pattern existe.
- Setup global dans `jest.setup.ts`.

## Localisation des tests

- Tests de composants : `app/components/__tests__/` ou `components/__tests__/`.
- Tests de controllers : `app/controllers/__tests__/`.
- Tests de services : `app/services/__tests__/`.
- Tests de modèles : `app/models/__tests__/`.
- Tests de hooks : `hooks/__tests__/`.
- Nommer les fichiers `*.test.ts` ou `*.test.tsx`.

## Commandes

```bash
# Tous les tests en mode watch
npm test

# Tests avec coverage
npm test -- --coverage

# Un seul fichier de test
npm test -- app/services/__tests__/ClientHTTP.service.test.ts

# Un seul test par nom
npm test -- --testNamePattern="nom du test"

# Gates complémentaires
npm run lint
npm run typecheck
npm run validate:expo
```

Le coverage est collecté sur `app/**/*.{ts,tsx}`, `components/**/*.{ts,tsx}` et `hooks/**/*.{ts,tsx}` selon `jest.config.js`.

## Ce qu'il faut tester

### Composants React Native

```typescript
import { render, screen } from '@testing-library/react-native';

test('affiche le libellé attendu', () => {
  render(<MonComposant label="Maison" />);
  expect(screen.getByText('Maison')).toBeTruthy();
});
```

- Rendu nominal.
- États vide, chargement, déconnecté, erreur.
- Interactions utilisateur via `fireEvent` ou `userEvent` si disponible dans le fichier.
- Accessibilité et textes visibles quand pertinent.
- Snapshots seulement si le dépôt les utilise déjà pour ce composant ou un équivalent.

### Controllers et services

```typescript
jest.spyOn(global, 'fetch').mockResolvedValueOnce({
  ok: true,
  json: async () => ({ status: 'OK', result: [] }),
} as Response);
```

- Mocker `fetch`, AsyncStorage, modules Expo, timers et contexte selon le besoin.
- Couvrir réponses Domoticz réussies, erreurs réseau, données absentes, statuts inattendus.
- Tester la transformation des modèles et le tri/filtrage dans `DataUtils.service.ts`.

## Cas à couvrir systématiquement

- Cas nominal avec données valides.
- Données vides, nulles ou partielles.
- Erreur HTTP/réseau et timeout quand le code le gère.
- Interactions utilisateur : clics, saisies, sliders si applicable.
- État global/context : valeurs initiales, mise à jour et erreurs.
- Environnements Android/Web quand un comportement diverge.

## Ce que tu ne fais PAS

- Ne pas modifier les fichiers production hors tests sans accord explicite.
- Ne pas mettre à jour la documentation sauf demande explicite.
- Ne pas baisser la couverture ou supprimer des assertions sans justification.
- Ne pas changer la stratégie de test globale sans validation ARCos.
