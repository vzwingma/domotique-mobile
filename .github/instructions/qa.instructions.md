---
description: "Conventions de test du projet domoticz-mobile pour 🟢 QALvin : framework, commandes, emplacement des tests, mocks, seuil de couverture, cas à couvrir. Prioritaire sur le générique."
applyTo: "**"
---

# Conventions projet — domoticz-mobile (tests)

> Projet : `domoticz-mobile` — application mobile React Native / Expo (Android + Web) pour piloter un serveur Domoticz.

## Stack de test

- **Jest 29** (preset `react-native`, `jest.config.js`, alias `@/`) + `@testing-library/react-native ^13.3`,
  `@testing-library/jest-native ^5.4` (assertions), `react-test-renderer` (snapshots)
- Setup global : `jest.setup.ts` (mocks AsyncStorage, expo-router, `@expo/vector-icons`)
- Fichiers de test : `*.test.ts(x)` dans des dossiers `__tests__/` co-localisés avec le module testé
  (`app/**/__tests__/`, `components/__tests__/`, `hooks/__tests__/`)

## Commandes

```bash
npm test -- --watchAll=false                                    # tous les tests (`npm test` seul = watch)
npm test -- --watchAll=false --coverage                         # mode CI avec couverture
npm test -- --watchAll=false app/services/__tests__/ClientHTTP.service.test.ts   # un fichier
npm test -- --watchAll=false --testNamePattern="<nom du test>"  # un test par nom
npm run typecheck && npm run validate:expo                       # validations QA obligatoires en plus des tests
```

Rapport de couverture : `coverage/` (lu par SonarQube via `sonar-project.properties` ; contrôle CI 80 % informatif, ADR-009).
**Seuil de couverture** : global ≥ 80 % ; cibles par couche : controllers 100 %, services ≥ 90 %,
composants ≥ 70 %, modèles ≥ 85 %.

## Mocks

- Réseau : `global.fetch = jest.fn(...)` pour `ClientHTTP.service`, ou `jest.mock` de
  `@/app/services/ClientHTTP.service` dans les controllers ; dimensions (`useWindowDimensions` / `Dimensions`)
  mockées pour les cas responsive
- État partagé injecté : envelopper le composant dans `<DomoticzContext.Provider value={mockContext}>`

## Cas à couvrir systématiquement

- **Nominal** : comportement correct avec données valides
- **Vide / null** : données absentes ou partielles
- **Erreurs** : HTTP 403 (déconnexion / réinitialisation du contexte), 404, 500 et comportement attendu
- **Interactions** : `fireEvent` (press, slider) et appels `callDomoticz` attendus
- **Responsive** : téléphone (< 600dp) inchangé, tablette paysage 2 colonnes
- **Régression** : casser volontairement le code doit faire échouer au moins un test

## Ce que QALvin ne fait PAS

- Modifier le code de production (hors fichiers de test).
- Mettre à jour la documentation (rôle 🟣 DOCly).
- Changer la stratégie de test globale sans validation 🟠 ARCos + 👤.
