---
description: "Conventions de tests de domoticz-mobile pour 🟢 QALvin : Jest, Testing Library, commandes, mocks, couverture et cas nominaux, erreurs et limites."
applyTo: "**"
---

# Conventions projet — domoticz-mobile (tests)

## Workflow

1. Consulter les todos `*-qa` dont les dépendances sont terminées et passer la tâche choisie à `in_progress`.
2. Écrire et exécuter des tests ciblés sur le code déjà livré et validé à Gate #2.
3. Vérifier couverture et validations ci-dessous ; documenter les preuves dans le handoff.
4. Passer le todo à `done` si les validations passent, ou `blocked` avec la cause si un blocage empêche la livraison.

## Stack et emplacement

- Jest `29.7.0` avec `jest-expo` et Testing Library React Native `^13.3.3`.
- `@testing-library/jest-native ^5.4.3` pour les assertions React Native ; `react-test-renderer 19.2.3` pour les snapshots.
- Setup global : `jest.setup.ts` (mocks AsyncStorage, expo-router, `@expo/vector-icons`).
- Fichiers `*.test.ts` / `*.test.tsx`, dans `__tests__/` ou co-localisés avec le module testé, selon le pattern existant.

## Commandes

```bash
npm test -- --watchAll=false
npm test -- --watchAll=false --coverage
npm test -- --watchAll=false app/services/__tests__/ClientHTTP.service.test.ts
npm test -- --watchAll=false --testNamePattern="doit appeler callDomoticz avec succès"
npm run typecheck
npm run validate:expo
```

La validation QA doit inclure tests, `npm run typecheck` et `npm run validate:expo`. Le rapport de couverture est généré dans `coverage/` et lu par SonarQube ; gate globale du projet : au moins 80 %. Viser au moins 80 % sur le code modifié.

## Mocks

- Mocker les dépendances externes (réseau, AsyncStorage, modules natifs, timers) avec les mécanismes Jest et les mocks établis dans `jest.setup.ts`.
- Injecter `DomoticzContext` avec un contexte mocké si le composant le consomme ; éviter les casts non typés quand un type de contexte peut être utilisé.
- Mocker `fetch` pour les tests du service HTTP ; préférer des réponses qui respectent le contrat Domoticz.
- Nettoyer les mocks et l'état partagé entre tests.

## Cas à couvrir

- **Nominal** : rendu ou résultat correct avec données valides.
- **Vide / null** : données absentes, vides ou partielles.
- **Erreurs** : erreurs réseau et HTTP 403 (déconnexion/réinitialisation), 404 et 500 ; vérifier le comportement attendu.
- **Interactions** : actions utilisateur, gestes et appels associés.
- **Responsive** : mocker `useWindowDimensions` / `Dimensions` quand utilisés.
- **Régression** : chaque comportement important doit être protégé par un test qui échoue si ce comportement est cassé.

## Ce que QALvin ne fait pas

- Ne modifie pas le code de production ni la documentation.
- Ne change pas la stratégie de test globale sans validation 🟠 ARCos et 👤.

## Règle d'index des plans

`.github/plans/README.md` contient uniquement les plans et leur statut global. Si une phase QA change ce statut, synchroniser cet index dans le même changement.
