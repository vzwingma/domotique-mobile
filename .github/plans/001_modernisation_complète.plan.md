# Plan d'Action : Modernisation Complète de domoticz-mobile

**Document:** `.github/plans/001_modernisation_complète.plan.md`  
**Date de création:** 2026-04-24  
**Statut:** À valider / En cours  

---

## 🎯 Objectif Global

Moderniser l'application **domoticz-mobile** de façon exhaustive et progressive, en améliorant :
1. **Phase 1 :** Couverture de test (tests unitaires manquants)
2. **Phase 2 :** Dépendances à jour (Expo, React Native, TypeScript, Jest)
3. **Phase 3 :** Architecture & Services (refactoring du code métier)
4. **Phase 4 :** Performance & Optimisations (caching, lazy-load, memoization)
5. **Phase 5 :** CI/CD & Infrastructure (workflows optimisés, SonarQube intégré)
6. **Phase 6 :** Documentation & Guides (README, architecture, contribution)

---

## 📋 Phase 1 : Couverture de Test (Test-QA Agent)

### Contexte
- Application manque de tests unitaires pour certains composants critiques
- Controllers, Services et Composants UI doivent avoir une couverture ≥80%
- Framework : Jest + react-test-renderer + Testing Library

### Critères de Réussite
✅ Couverture globale ≥ 80% (app/ et components/)  
✅ Tous les controllers testés  
✅ Tous les services testés  
✅ Composants critiques testés (Device, Thermostat, FavoriteCard, etc.)  
✅ Pas d'augmentation de la taille des bundles

### Tâches (test-qa agent)

#### T1.1 - Tests des Services
- **Fichier :** `app/services/__tests__/ClientHTTP.service.test.ts`
- **Couvrir :**
  - `callDomoticz()` — succès, erreur réseau, SSL
  - Gestion du `traceId` UUID
  - Diagnostic SSL
  - Parsing de réponse (OK / ERR)
- **Acceptation :** ≥90% couverture du service

#### T1.2 - Tests de DataUtils.service
- **Fichier :** `app/services/__tests__/DataUtils.service.test.ts`
- **Couvrir :**
  - `sortEquipements()`, `sortFavorites()`
  - `getDeviceType()` avec tous les types
  - `evaluateGroupLevelConsistency()`
  - Gestion AsyncStorage (getFavoritesFromStorage, saveFavoritesToStorage)
- **Acceptation :** ≥90% couverture

#### T1.3 - Tests de DomoticzContextProvider
- **Fichier :** `app/services/__tests__/DomoticzContextProvider.test.tsx`
- **Couvrir :**
  - Provider initialization
  - Context value structure
  - State updates (devices, temperatures, etc.)
- **Acceptation :** ≥85% couverture

#### T1.4 - Tests des Controllers
- **Fichiers :**
  - `app/controllers/__tests__/devices.controller.test.ts` → refactoriser/compléter
  - `app/controllers/__tests__/temperatures.controller.test.ts` → refactoriser/compléter
  - `app/controllers/__tests__/thermostats.controller.test.ts` → compléter
  - `app/controllers/__tests__/index.controller.test.ts` → NOUVEAU
  - `app/controllers/__tests__/parameters.controller.test.ts` → NOUVEAU
- **Couvrir :** Tous les appels API, gestion d'erreur, mise à jour du contexte
- **Acceptation :** ≥90% couverture par controller

#### T1.5 - Tests des Composants UI Critiques
- **Fichiers :**
  - `app/components/__tests__/device.component.test.tsx` → compléter
  - `app/components/__tests__/lightDevice.component.test.tsx` → NOUVEAU
  - `app/components/__tests__/blindDevice.component.test.tsx` → NOUVEAU
  - `app/components/__tests__/thermostat.component.test.tsx` → compléter
  - `app/components/__tests__/temperature.component.test.tsx` → compléter
  - `app/components/__tests__/favoriteCard.component.test.tsx` → compléter
  - `app/components/__tests__/deviceCard.component.test.tsx` → compléter
  - `app/components/__tests__/paramList.component.test.tsx` → compléter
  - `app/components/__tests__/primaryIconAction.component.test.tsx` → compléter
  - `app/components/__tests__/disconnectedState.component.test.tsx` → compléter
- **Couvrir :** Props validation, render, interactions (swipe, tap, long-press)
- **Acceptation :** ≥80% couverture par composant

#### T1.6 - Tests des Onglets/Screens
- **Fichiers :**
  - `app/(tabs)/__tests__/index.test.tsx` → Favoris
  - `app/(tabs)/__tests__/devices.tabs.test.tsx` → Lumières/Volets
  - `app/(tabs)/__tests__/temperatures.tab.test.tsx` → Températures
  - `app/(tabs)/__tests__/parametrages.tab.test.tsx` → Maison
- **Couvrir :** Navigation, rendu initial, refetch
- **Acceptation :** ≥75% couverture par onglet

#### T1.7 - Rapport de Couverture
- **Action :** Générer un rapport de couverture consolidé
- **Output :** `coverage/` avec détail par fichier
- **Acceptation :** Rapport lisible, couverture globale ≥80%

---

## 📋 Phase 2 : Mise à Jour des Dépendances (Developer Agent)

### Contexte
- Renovate a détecté 15+ mises à jour majeures en attente
- TypeScript 5.9 → 6.x, Jest 29 → 30, React Native 0.83 → 0.85+
- Expo ~55.0.15 (version stable, peut rester)
- @testing-library/jest-native est deprecated

### Critères de Réussite
✅ Toutes les dépendances à jour (sauf Expo/RN qui peuvent rester à v55)  
✅ Tests passent après chaque mise à jour majeure  
✅ Pas de breaking changes non gérés  
✅ renovate.json valide (Issue #72)

### Tâches (developer agent)

#### T2.1 - Corriger renovate.json
- **Fichier :** `renovate.json`
- **Issue :** #72 — Syntax error dans la config
- **Action :** Valider et corriger le JSON
- **Acceptation :** `renovate.json` valide, pas d'erreur parsing

#### T2.2 - Mettre à jour TypeScript
- **Ancien :** `~5.9.2` → **Nouveau :** `~6.0.0`
- **Tester :** `npm run lint`, build
- **Acceptation :** Lint passe, pas d'erreurs type

#### T2.3 - Mettre à jour Jest & dépendances de test
- **Ancien :** `jest ^29.7.0` → **Nouveau :** `^30.0.0`
- **Ancien :** `@types/jest 29.5.14` → **Nouveau :** `30.0.0`
- **Ancien :** `@testing-library/jest-native ^5.4.3` → Chercher alternative ou supprimer si non utilisé
- **Tester :** `npm test`
- **Acceptation :** Tous les tests passent

#### T2.4 - Mettre à jour React Native & dépendances (mineur)
- **Ancien :** `react-native ^0.83.4` → **Nouveau :** `^0.85.0`
- **Dépendances :**
  - `react-native-reanimated 4.2.1` → `4.3.0`
  - `react-native-safe-area-context 5.6.2` → `5.7.0`
  - `react-native-screens ~4.23.0` → `~4.24.0`
  - `react-native-worklets 0.7.2` → `0.8.1`
  - `react-native-get-random-values ~1.11.0` → `~2.0.0`
- **Tester :** `npm run android`, `npm run web`
- **Acceptation :** Build réussit, pas de crash au démarrage

#### T2.5 - Mettre à jour AsyncStorage
- **Ancien :** `@react-native-async-storage/async-storage 2.2.0` → **Nouveau :** `3.0.2`
- **Breaking change :** Vérifier API
- **Tester :** Favoris persistants, sauvegarde paramètres
- **Acceptation :** AsyncStorage fonctionne, persistance OK

#### T2.6 - Mettre à jour uuid
- **Ancien :** `uuid ^13.0.0` → **Nouveau :** `^14.0.0`
- **Impact :** Utilisé dans ClientHTTP.service.ts pour traceId
- **Tester :** Console logs traceId visibles
- **Acceptation :** UUID généré correctement

#### T2.7 - Vérifier compatibilité Expo & Actions GitHub
- **Vérifier :** Expo v55 compatible avec React 19.2.0 et RN 0.85
- **GH Actions :** `actions/checkout v6`, `actions/setup-node v6`, `expo/expo-github-action v8` → v8+
- **Acceptation :** Builds EAS réussissent

#### T2.8 - Valider l'ensemble
- **Actions :** `npm install && npm test && npm run lint && npm run web`
- **Acceptation :** Aucune erreur, tous les tests passent

#### T2.9 - Validez avec Expo Doctor (NEW)
- **Action :** Exécuter `npx expo-doctor` pour vérifier l'installation Expo
- **Vérifier :** Tous les checks passent (18/18 minimum)
- **Acceptation :** Expo ecosystem validation OK

---

## 📋 Phase 3 : Architecture & Services (Developer Agent)

### Contexte
- Code métier fonctionnel mais peut bénéficier de refactoring
- Séparation des responsabilités : Controllers → Services → Models
- Typage strict activé, mais certains `any` subsistent
- Pas d'erreur handling cohérent (toast vs in-UI vs log)

### Critères de Réussite
✅ Pas de `any` en TypeScript (sauf justifiés et commentés)  
✅ Gestion d'erreur uniforme (toast + log)  
✅ Modèles bien typés (classes, `readonly`)  
✅ Services purs, sans side-effects  
✅ Controllers chainables (.then().catch())

### Tâches (developer agent)

#### T3.1 - Audit de typage
- **Action :** Identifier tous les `any` dans le codebase
- **Output :** Rapport avec locations
- **Acceptation :** Rapport généré, < 10 `any` non-justifiés

#### T3.2 - Refactoriser gestion d'erreur
- **Contexte :** Actuellement mélange toast/logs/rien
- **Cible :** Pattern unifié :
  1. Log console détaillé (traceId + error)
  2. Toast utilisateur (EN FRANÇAIS) si erreur critique
  3. Context avec `status: "error"`
- **Fichiers :** ClientHTTP.service.ts, tous les controllers
- **Acceptation :** Gestion cohérente partout

#### T3.3 - Améliorer les modèles de données
- **Vérifier :** DomoticzDevice, DomoticzTemperature, DomoticzThermostat
- **Action :** Ajouter `readonly` où possible, améliorer getters
- **Acceptation :** Modèles immuables, getters cohérents

#### T3.4 - Créer service de validation
- **Nouvelle :** `app/services/Validator.service.ts`
- **Responsabilité :** Valider réponses Domoticz, structures de données
- **Acceptation :** Service utilisable, tests ≥80%

#### T3.5 - Refactoriser DataUtils.service
- **Action :** Scinder en sous-services si trop gros
- **Option :** `FavoritesManager.service.ts`, `DeviceGrouping.service.ts`
- **Acceptation :** Services spécialisés, responsabilités claires

---

## 📋 Phase 4 : Performance & Optimisations (Developer Agent)

### Contexte
- App fonctionne mais peut être optimisée
- Pas de caching explicite
- Images potentiellement non optimisées
- Re-renders potentiels inefficaces

### Critères de Réussite
✅ Temps initial de chargement < 3s  
✅ Re-fetch des données < 1s  
✅ Memoization des composants critique  
✅ Caching des requêtes API (30s par défaut)

### Tâches (developer agent)

#### T4.1 - Ajouter caching HTTP
- **Fichier :** `app/services/ClientHTTP.service.ts`
- **Implémentation :** Cache simple (Map + TTL)
- **Strategy :** Cache GET requests pendant 30s sauf refresh manuel
- **Acceptation :** 2e fetch retourne cached, icône refresh bypass cache

#### T4.2 - Memoizer composants lourds
- **Cibles :**
  - DeviceCard
  - FavoriteCard
  - DeviceComponent
  - ThermostatComponent
- **Utiliser :** React.memo + useMemo
- **Acceptation :** Composants ne re-render que si props changent

#### T4.3 - Optimiser listes (FlatList/SectionList)
- **Cibles :** Tous les onglets affichant listes longues
- **Action :** keyExtractor, removeClippedSubviews, maxToRenderPerBatch
- **Acceptation :** Scroll fluide même avec 100+ appareils

#### T4.4 - Lazy-load des images & icônes
- **Cibles :** Adaptive icons, splash
- **Strategy :** Charger au besoin, pas en batch
- **Acceptation :** Bundle size ≤ 5% plus léger

#### T4.5 - Profiler performance
- **Outil :** React Profiler ou Expo DevTools
- **Metric :** Render time par composant
- **Output :** Rapport avec TOP 5 composants lents
- **Acceptation :** Rapport généré

---

## 📋 Phase 5 : CI/CD & Infrastructure (Solution-Architect Agent)

### Contexte
- Builds EAS en place mais workflows basiques
- SonarQube connecté (token visible en config)
- Peu de checks avant merge
- Renovate active mais pas d'auto-merge

### Critères de Réussite
✅ Workflow CI robuste (lint, test, build)  
✅ SonarQube intégré et rapports utiles  
✅ Auto-merge des dépendances mineures (Renovate)  
✅ Code quality gates (coverage ≥80%)

### Tâches (solution-architect agent)

#### T5.1 - Auditer workflows GitHub Actions existants
- **Fichiers :** `.github/workflows/*.yml`
- **Vérifier :**
  - Versions Node, Expo
  - Secrets (SonarQube token masqué ?)
  - Durée des builds
  - Skip conditions (ex: documentation-only)
- **Output :** Audit report
- **Acceptation :** Rapport généré

#### T5.2 - Créer workflow CI principal
- **Nom :** `ci.yml`
- **Trigger :** push, pull_request vers main + develop
- **Étapes :**
  1. Setup Node + dependencies
  2. Lint (ESLint)
  3. Type check (tsc)
  4. Tests (Jest avec coverage)
  5. Build Web + APK (Expo)
  6. SonarQube scan
  7. Upload coverage
- **Acceptation :** Workflow s'exécute, tous les checks passent

#### T5.3 - Configurer SonarQube qualité
- **Fichier :** `sonar-project.properties`
- **Paramètres :**
  - `sonar.coverage.exclusions` = node_modules, __tests__
  - `sonar.javascript.lcov.reportPaths` = coverage/lcov.info
  - Quality gate: coverage ≥80%
- **Acceptation :** SonarQube scan réussi, rapports visibles

#### T5.4 - Configurer Renovate auto-merge
- **Fichier :** `renovate.json`
- **Strategy :**
  - Auto-merge des patches (typescript, jest, utils)
  - Draft PR pour majeures (RN, Expo)
  - Require all checks passing
- **Acceptation :** PRs mineures auto-mergées

#### T5.5 - Protection de branches
- **Branche :** `main` + `develop`
- **Rules :**
  - Require PR review (au moins 1)
  - Require status checks (CI ✅, SonarQube ✅)
  - Dismiss stale PR approvals
- **Acceptation :** Branches protégées

#### T5.6 - Optimiser builds EAS
- **Action :** Configurer cache dans EAS
- **Cibles :** gradle, npm cache
- **Acceptation :** Build time < 10min

---

## 📋 Phase 6 : Documentation & Guides (Doc-Manager Agent)

### Contexte
- README bon mais peut être plus complet
- Pas de guide architecture formalisé
- Processus contribution basique
- Pas de changelogs

### Critères de Réussite
✅ README clair et complet  
✅ Architecture documentée  
✅ Guide contribution détaillé  
✅ API Domoticz référencée  
✅ Changelogs à jour

### Tâches (doc-manager agent)

#### T6.1 - Mettre à jour README.md
- **Sections :**
  - Prérequis → vérifier versions (Node 21+, npm 6+)
  - Installation → plus détaillée
  - Variables d'env → compléter exemples
  - SSL → clarifier (toujours obligatoire sur prod ?)
  - Architecture → pointer vers docs/
  - Tests → npm test + couverture target
  - Contribution → pointer vers CONTRIBUTING.md
- **Acceptation :** README complet, claire

#### T6.2 - Créer docs/ARCHITECTURE.md
- **Contenu :**
  - Diagramme flux de données
  - Structure dossiers (détaillée)
  - Patterns utilisés (Context, Controllers, Services)
  - DomoticzContextProvider deep-dive
  - Models & enums
  - Gestion d'état (global vs local)
- **Acceptation :** 500+ lignes, diagrammes inclus

#### T6.3 - Mettre à jour CONTRIBUTING.md
- **Sections :**
  - Git workflow (main/develop/feature)
  - Setup local dev
  - Running tests
  - Code style + linting
  - PR template
  - Labels & issues
  - Commit message format
- **Acceptation :** Guide clair, détaillé

#### T6.4 - Créer docs/API.md
- **Contenu :**
  - Endpoints Domoticz utilisés (list)
  - Format requêtes (URL, params, Basic Auth)
  - Gestion erreurs (OK / ERR)
  - Exemple de flow complet
  - Diagnostic SSL
- **Acceptation :** 300+ lignes, exemples cURL

#### T6.5 - Créer CHANGELOG.md
- **Format :** Keep a Changelog v1.0.0
- **Sections :** v3.0.0 (current), v2.x, v1.x
- **Contenu :** Features, bugs fixes, breaking changes
- **Acceptation :** Format standard, à jour jusqu'à v3.0.0

#### T6.6 - Créer docs/TESTING.md
- **Contenu :**
  - Setup Jest
  - Writing unit tests (controllers, services, components)
  - Snapshot testing guidelines
  - Mock Domoticz API
  - Coverage reports
  - Best practices
- **Acceptation :** Guide complet, exemples concrets

---

## 🎯 Résumé des Tâches par Agent

### test-qa Agent
- T1.1 à T1.7 : Tests unitaires + rapport couverture
- **Livrable :** Tests ≥80% couverture, `coverage/` report
- **Durée estimée :** 2-3 sprints

### developer Agent
- T2.1 à T2.8 : Mise à jour dépendances
- T3.1 à T3.5 : Refactoring architecture
- T4.1 à T4.5 : Optimisations performance
- **Livrable :** Code modernisé, tous les tests passent
- **Durée estimée :** 3-4 sprints

### solution-architect Agent
- T5.1 à T5.6 : CI/CD & Infrastructure
- **Livrable :** Workflows robustes, SonarQube intégré, auto-merge Renovate
- **Durée estimée :** 1-2 sprints

### doc-manager Agent
- T6.1 à T6.6 : Documentation exhaustive
- **Livrable :** README, Architecture, API, Contributing, Changelog, Testing guides
- **Durée estimée :** 1 sprint

---

## 📊 Dépendances entre Phases

```
Phase 1 (Tests)          
    ↓
Phase 2 (Dépendances) ←─ Phase 1 (Tests doivent passer après updates)
    ↓
Phase 3 (Architecture) ←─ Phase 2 (Dépendances à jour)
    ↓
Phase 4 (Performance)  ←─ Phase 3 (Code refactorisé)
    ↓
Phase 5 (CI/CD)        ←─ Phase 1, 2, 3, 4 (Tous les checks en place)
    ↓
Phase 6 (Docs)         ←─ Phases 1-5 (Documenter final state)
```

---

## ✅ Critères de Succès Globaux

1. **Couverture de test ≥80%** (Phase 1)
2. **0 dépendances dépréciées** (Phase 2)
3. **0 `any` non-justifiés en TypeScript** (Phase 3)
4. **Bundle size stable ou ↓** (Phase 4)
5. **CI/CD robuste + auto-merge** (Phase 5)
6. **Documentation exhaustive & à jour** (Phase 6)

---

## 🚀 Plan d'Exécution

1. **Démarrer Phase 1 :** test-qa agent en parallèle
2. **Démarrer Phase 2 :** developer agent (après Phase 1 ✅)
3. **Démarrer Phases 3-4 :** developer agent (parallèle ou séquentiel)
4. **Démarrer Phase 5 :** solution-architect agent (après Phases 1-3 ✅)
5. **Démarrer Phase 6 :** doc-manager agent (final, en parallèle de Phases 4-5)

---

**Fin du plan d'action**
