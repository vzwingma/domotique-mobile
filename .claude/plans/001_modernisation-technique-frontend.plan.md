# Plan d'Action : Modernisation Technique Front-End

**Document :** `.claude/plans/001_modernisation-technique-frontend.plan.md`
**Date de création :** 2026-07-07
**Statut :** 🔄 En cours (Phase 1 complétée — Gate#0 en attente de validation développeur humain)
**Objectif Prioritaire :** MEDIUM

---

## 🎯 Objectif Global

Assainir le socle technique du front-end (config ESLint dupliquée, Node non figé), formaliser un processus de veille des montées de version majeures (Expo SDK, React, React Native) sans déclencher d'upgrade immédiat, et fiabiliser le pipeline de compilation/déploiement CI-CD (workflows GitHub Actions redondants, seuil de couverture non bloquant, déploiement EAS non scripté, keystore de production non documenté).

Objectifs mesurables : 0 config ESLint contradictoire, `.nvmrc`/`engines` alignés sur le Node CI, un seul workflow CI déclenché par push/PR, seuil de couverture cohérent avec sa politique documentée, scripts npm EAS fonctionnels, `docs/ARCHITECTURE.md` synchronisée avec le code réel.

---

## Phase 1 — Décisions architecturales (ADR)

### Contexte
- Double config ESLint coexistante (`eslint.config.js` flat minimal + `.eslintrc.js` legacy `extends: 'expo'` mort mais trompeur)
- Aucun processus documenté de revue des PR draft Renovate pour les majors Expo/React/RN
- `ci.yml` et `build-on-all.yml` exécutent la même logique prebuild+test+Sonar en double
- Seuil couverture 80% (`nyc --check-coverage`) en `continue-on-error: true` — pas réellement bloquant
- Aucun script npm/job CI pour `eas build`/`eas submit`
- `debug.keystore` réutilisé en local pour `release`, gestion réelle déléguée à EAS Credentials sans documentation

### Critères de Réussite
✅ 6 ADR rédigés (006 à 011), chacun avec ≥2 options comparées + recommandation motivée
✅ ADR-009 s'appuie sur une mesure factuelle de couverture actuelle (pas de recommandation non étayée)
✅ ADR-008 tranche fusion vs scoping des workflows CI (pas pré-décidé en amont)
✅ Chaque ADR suit le format `docs/adr/NNN-titre-court.md` existant (contexte/décision/alternatives/conséquences)
✅ Gate#0 validé par le développeur humain sur chaque ADR avant passage en Phase 2/3

### Tâches (Agent: ARCos (🟠 ARC))

#### T1.1 - Rédiger ADR-006 : unification config ESLint
- **Fichier :** `docs/adr/006-unification-config-eslint.md`
- **Couvrir/Implémenter :**
  - Analyse compatibilité flat de `eslint-config-expo` ~56.0.4 (vérifier export `/flat`)
  - Option A : garder flat minimal actuel, supprimer `.eslintrc.js`
  - Option B : intégrer `eslint-config-expo` dans le flat config, supprimer `.eslintrc.js`
- **Acceptation :** ADR avec recommandation motivée, statut Accepté après Gate#0

#### T1.2 - Rédiger ADR-007 : processus de veille majors Expo/React/RN
- **Fichier :** `docs/adr/007-processus-veille-majors-expo-react.md`
- **Couvrir/Implémenter :**
  - Option A : revue trimestrielle manuelle du Dependency Dashboard Renovate
  - Option B : Option A + alerte automatisée mensuelle
  - Cadence proposée + critères de déclenchement d'un upgrade SDK
- **Acceptation :** ADR ne déclenche aucun upgrade SDK, livre uniquement le processus

#### T1.3 - Rédiger ADR-008 : fusion/scoping des workflows CI dupliqués
- **Fichier :** `docs/adr/008-fusion-workflows-ci.md`
- **Couvrir/Implémenter :**
  - Option A : fusion complète en un workflow (structure `ci.yml` + scope large `build-on-all.yml`)
  - Option B : scoping non-chevauchant (`ci.yml` complet sur main/develop, `quick-check.yml` allégé pour branches feature)
- **Acceptation :** ADR tranche explicitement, décision non pré-imposée

#### T1.4 - Rédiger ADR-009 : seuil de couverture CI
- **Fichier :** `docs/adr/009-seuil-couverture-ci.md`
- **Couvrir/Implémenter :**
  - Mesurer la couverture actuelle réelle (`npm test -- --coverage` + `npx nyc report --check-coverage --lines 80 --functions 80 --branches 80`)
  - Option A : retirer `continue-on-error`/`|| true` pour bloquer réellement
  - Option B : documenter explicitement que le blocage réel est délégué au Quality Gate SonarCloud
- **Acceptation :** ADR appuyé sur donnée de couverture factuelle mesurée

#### T1.5 - Rédiger ADR-010 : stratégie de build/déploiement EAS
- **Fichier :** `docs/adr/010-strategie-build-deploiement-eas.md`
- **Couvrir/Implémenter :**
  - Option A : scripts npm locaux uniquement (`eas:build:preview`, `eas:build:production`, `eas:submit`)
  - Option B : Option A + build preview EAS automatisé en CI (push `develop`, via `EXPO_TOKEN` déjà présent)
  - Peser coût quota EAS vs fréquence de release
- **Acceptation :** ADR tranche, scripts npm a minima recommandés dans les deux cas

#### T1.6 - Rédiger ADR-011 : gestion du keystore de production via EAS Credentials
- **Fichier :** `docs/adr/011-gestion-keystore-production-eas-credentials.md`
- **Couvrir/Implémenter :**
  - Formaliser la décision de facto (EAS Credentials source de vérité)
  - Confirmer que `debug.keystore`/`android/` (gitignored) ne sont jamais utilisés en production
  - Aucune manipulation ni exposition de secret dans l'ADR
- **Acceptation :** ADR documente le processus opérationnel sans exposer de donnée sensible

---

## Phase 2 — Socle technique

### Contexte
- Dépend des décisions ADR-006 (ESLint) issues de la Phase 1
- `.nvmrc`/`engines` indépendants, peuvent démarrer immédiatement après Gate#1
- Vérification `renovate.json` dépend de la Phase 3 (fusion workflows)

### Critères de Réussite
✅ `npm run lint` s'exécute sans config contradictoire, une seule source de vérité ESLint
✅ `.nvmrc` et `engines` présents et alignés sur Node 24 (version CI)
✅ `renovate.json` → `requiredStatusChecks` cohérent avec le nom du workflow CI final
✅ Aucune régression sur les fichiers déjà lintés

### Tâches (Agent: DEVon (🔵 DEV))

#### T2.1 - Implémenter la décision ADR-006 (unification ESLint)
- **Fichier(s) :** `eslint.config.js`, `.eslintrc.js` (suppression), `package.json`
- **Couvrir / Implémenter :**
  - Appliquer l'option retenue dans l'ADR-006
  - Supprimer la config legacy morte
- **Acceptation :** `npm run lint` passe sans erreur, une seule config ESLint active

#### T2.2 - Figer Node dev/CI
- **Fichier(s) :** `.nvmrc` (nouveau), `package.json`
- **Couvrir / Implémenter :**
  - `.nvmrc` avec `24` (aligné CI)
  - `"engines": { "node": ">=24" }` dans `package.json`
- **Acceptation :** `nvm use` fonctionne, `npm install` sans warning engine

#### T2.3 - Vérifier/ajuster `renovate.json` post-fusion CI
- **Fichier(s) :** `renovate.json`
- **Couvrir / Implémenter :**
  - Aligner `requiredStatusChecks: ["CI Pipeline"]` sur le nom réel du workflow post-Phase 3
- **Acceptation :** Automerge Renovate non cassé (vérification manuelle du nom de check)
- **Dépend de :** T3.1 (Phase 3)

---

## Phase 3 — Compilation & déploiement CI/CD

### Contexte
- Dépend des décisions ADR-008, ADR-009, ADR-010 issues de la Phase 1
- T3.1 bloquant pour T3.2, T3.3 (option CI), T3.4 — à séquencer après

### Critères de Réussite
✅ Un seul workflow CI déclenché par push/PR (plus de double exécution)
✅ Politique de seuil de couverture cohérente avec sa documentation (bloquante ou explicitement non-bloquante)
✅ Scripts npm EAS fonctionnels (`eas:build:*`, `eas:submit`)
✅ Badge CI GitHub Actions visible dans le README
✅ Aucun secret exposé dans le repo

### Tâches (Agent: DEVon (🔵 DEV))

#### T3.1 - Dédupliquer `ci.yml` / `build-on-all.yml`
- **Fichier(s) :** `.github/workflows/ci.yml`, `.github/workflows/build-on-all.yml`
- **Couvrir / Implémenter :**
  - Appliquer l'option retenue dans l'ADR-008 (fusion ou scoping non-chevauchant)
- **Acceptation :** Une seule exécution CI par push/PR, pas de scan Sonar concurrent sur le même commit

#### T3.2 - Aligner le seuil de couverture sur la décision ADR-009
- **Fichier(s) :** `.github/workflows/ci.yml` (post-fusion)
- **Couvrir / Implémenter :**
  - Retirer `continue-on-error`/`|| true` si Option A, ou clarifier commentaires si Option B
- **Acceptation :** Comportement CI cohérent avec la politique documentée
- **Dépend de :** T3.1

#### T3.3 - Scripts npm EAS + job CI optionnel
- **Fichier(s) :** `package.json`, `eas.json`, `.github/workflows/ci.yml` (si option CI retenue)
- **Couvrir / Implémenter :**
  - Scripts `eas:build:preview`, `eas:build:production`, `eas:submit`
  - Job CI de build preview automatisé si ADR-010 Option B retenue
- **Acceptation :** Scripts exécutables localement, job CI déclenché correctement si applicable

#### T3.4 - Ajouter badge CI GitHub Actions au README
- **Fichier(s) :** `README.md`
- **Couvrir / Implémenter :**
  - Badge du workflow final (nom post-T3.1) à côté du badge SonarCloud existant
- **Acceptation :** Badge affiche un statut valide, lien fonctionnel
- **Dépend de :** T3.1

---

## Phase 4 — Validation QA

### Contexte
- Vérifie l'ensemble des changements des Phases 2 et 3 sur une PR de test
- Peut paralléliser certaines vérifications avec la Phase 5 (DOCly) une fois Gate#2 passé

### Critères de Réussite
✅ `npm run lint`, `npm test -- --coverage`, `npm run validate:expo`, `npx tsc --noEmit` passent tous
✅ Le workflow CI fusionné se déclenche une seule fois sur une PR de test
✅ Comportement du seuil de couverture conforme à l'ADR-009
✅ Scripts EAS vérifiés (dry-run ou revue syntaxique)
✅ Revue croisée doc/code effectuée avant validation Phase 5

### Tâches (Agent: QALvin (🟢 QUAL))

#### T4.1 - Vérifier la config ESLint unifiée
- **Fichier :** N/A (exécution)
- **Couvrir/Implémenter :** `npm run lint` sur le repo complet, vérifier CI job `lint`
- **Acceptation :** 0 erreur, 0 config contradictoire

#### T4.2 - Vérifier `.nvmrc`/`engines`
- **Fichier :** N/A (exécution)
- **Couvrir/Implémenter :** `nvm use` + `npm install` en local, vérifier CI toujours verte
- **Acceptation :** Installation sans warning engine

#### T4.3 - Vérifier le workflow CI fusionné
- **Fichier :** N/A (exécution sur PR de test)
- **Couvrir/Implémenter :** Déclenchement unique, tous les jobs attendus présents
- **Acceptation :** Une seule exécution CI par push/PR

#### T4.4 - Vérifier le comportement du seuil de couverture
- **Fichier :** N/A (exécution)
- **Couvrir/Implémenter :** Comportement pass/fail conforme à l'ADR-009
- **Acceptation :** Comportement CI cohérent, pas d'ambiguïté

#### T4.5 - Vérifier scripts EAS + job CI optionnel
- **Fichier :** N/A (exécution)
- **Couvrir/Implémenter :** Scripts npm EAS, déclenchement job CI si applicable
- **Acceptation :** Scripts fonctionnels, job CI déclenché correctement

#### T4.6 - Revue croisée `docs/ARCHITECTURE.md` vs code réel
- **Fichier :** `docs/ARCHITECTURE.md`
- **Couvrir/Implémenter :** Checklist de cohérence : chaque module cité existe, chaque flux décrit correspond au code
- **Acceptation :** 0 écart identifié entre doc et code

---

## Phase 5 — Documentation

### Contexte
- `docs/ARCHITECTURE.md` désynchronisée du code réel (architecture par-device obsolète vs découpage transverse post ADR-004/005)
- Nouveaux processus (veille versions, déploiement EAS, keystore) à documenter
- README à enrichir (badge CI, prérequis Node, section Build & Déploiement, politique couverture)

### Critères de Réussite
✅ `docs/ARCHITECTURE.md` reflète le découpage transverse réel du code
✅ `docs/PROCESS-VEILLE-VERSIONS.md` créé et référencé
✅ `docs/DEPLOIEMENT.md` (ou section README) créé et référencé
✅ README à jour (badge CI, prérequis `.nvmrc`, section Build & Déploiement, politique de couverture)
✅ Toutes les décisions ADR référencées dans la documentation correspondante

### Tâches (Agent: DOCly (🟣 DOC))

#### T5.1 - Resynchroniser `docs/ARCHITECTURE.md`
- **Fichier :** `docs/ARCHITECTURE.md`
- **Couvrir/Implémenter :** Relire ADR-004/005, auditer la structure réelle (`app/`, `components/`, `hooks/`, `model/`, `services/`), réécrire pour refléter le découpage transverse actuel
- **Acceptation :** Chaque module cité existe réellement, validé par T4.6

#### T5.2 - Documenter le processus de veille des versions
- **Fichier :** `docs/PROCESS-VEILLE-VERSIONS.md` (nouveau)
- **Couvrir/Implémenter :** Matérialiser le process de l'ADR-007 (cadence, grille de décision), référencer dans README/ARCHITECTURE.md
- **Acceptation :** Document autonome, référencé depuis au moins un autre doc

#### T5.3 - Documenter la procédure de déploiement et gestion du keystore
- **Fichier :** `docs/DEPLOIEMENT.md` (nouveau) ou section README
- **Couvrir/Implémenter :** Procédure build/déploiement EAS (ADR-010), procédure opérationnelle non-sensible EAS Credentials (ADR-011)
- **Acceptation :** Aucun secret exposé, procédure actionnable par un mainteneur

#### T5.4 - Mettre à jour `README.md`
- **Fichier :** `README.md`
- **Couvrir/Implémenter :** Badge CI GitHub Actions, section Prérequis (`.nvmrc`), section Build & Déploiement, politique de couverture (section Tests)
- **Acceptation :** README cohérent avec l'état final du repo

---

## 📊 Résumé des Tâches par Agent

### ARCos (🟠 ARC) Agent
- T1.1 à T1.6 : Rédaction des 6 ADR (006 à 011)
- **Livrable :** 6 ADR validés (Gate#0 par ADR)
- **Durée estimée :** 3-5 jours

### Devon (🔵 DEV) Agent
- T2.1 à T2.3 : Socle technique (ESLint, Node, Renovate)
- T3.1 à T3.4 : CI/CD (déduplication workflows, couverture, EAS, badge)
- **Livrable :** Socle assaini, pipeline CI/CD fiabilisé
- **Durée estimée :** 3-4 jours

### Qalvin (🟢 QUAL) Agent
- T4.1 à T4.6 : Validation croisée de l'ensemble des changements
- **Livrable :** Rapport de validation, 0 régression
- **Durée estimée :** 1-2 jours

### Docly (🟣 DOC) Agent
- T5.1 à T5.4 : Documentation (ARCHITECTURE.md, process veille, déploiement, README)
- **Livrable :** Documentation à jour et cohérente avec le code
- **Durée estimée :** 1-2 jours

---

## 📍 Dépendances entre Phases

```
Phase 1 (ADR) — ARCos
    ↓
Phase 2 (Socle technique) ← [ADR-006 ✅ pour T2.1 ; T2.3 dépend aussi de Phase 3]
    ↓
Phase 3 (CI/CD) ← [ADR-008, ADR-009, ADR-010 ✅]
    ↓
Phase 4 (QA) ← [Phases 2 et 3 doivent être ✅]
    ↓
Phase 5 (Documentation) ← [Phase 4 ✅, T5.1 peut démarrer dès Gate#1 en parallèle]
```

**Notes de parallélisation :**
- T2.2 (.nvmrc/engines) et T1.2/T1.6 (ADR-007/011, doc pure) peuvent démarrer dès Gate#1, indépendamment du reste
- T5.1 (resync ARCHITECTURE.md) indépendante, peut démarrer dès Gate#1
- Phase 4 et Phase 5 peuvent partiellement paralléliser après Gate#2 (règle standard du projet)

---

## ✅ Critères de Succès Globaux

1. **0 config ESLint contradictoire** (Phase 2)
2. **`.nvmrc`/`engines` alignés sur Node CI (24)** (Phase 2)
3. **1 seul workflow CI déclenché par push/PR** (Phase 3)
4. **Politique de couverture cohérente et documentée** (Phase 3)
5. **Scripts npm EAS fonctionnels** (Phase 3)
6. **6 ADR (006-011) acceptés** (Phase 1)
7. **`docs/ARCHITECTURE.md` synchronisée avec le code réel** (Phase 5)
8. **0 upgrade SDK Expo forcé** (hors périmètre de ce plan — processus de veille livré uniquement)

---

## 🚀 Plan d'Exécution

1. **Étape 1 :** Lancer Phase 1 (ARCos (🟠 ARC)) — rédaction des 6 ADR
2. **Étape 2 :** Gate#0 par ADR (validation développeur humain)
3. **Étape 3 :** Lancer Phase 2 (Devon (🔵 DEV)) dès ADR-006 accepté — T2.2 peut démarrer immédiatement
4. **Étape 4 :** Lancer Phase 3 (Devon (🔵 DEV)) dès ADR-008/009/010 acceptés
5. **Étape 5 :** Gate#2 (validation code) après Phases 2 et 3 complétées
6. **Étape 6 :** Lancer Phase 4 (Qalvin (🟢 QUAL))
7. **Étape 7 :** Gate#3 (validation tests/vérifications)
8. **Étape 8 :** Lancer Phase 5 (Docly (🟣 DOC)), T5.1 pouvant démarrer en amont dès Gate#1
9. **Étape 9 :** Gate#4 (validation doc + clôture initiative)

**Triggers pour démarrer une phase :**
- Tous les rapports de la phase précédente ✅ COMPLÉTÉE
- Tous les critères de réussite atteints
- Pas de bloqueurs signalés
- ADR concernés acceptés (Gate#0) avant toute implémentation liée

---

## Points de vigilance transverses

- **Renovate `requiredStatusChecks`** référence `"CI Pipeline"` par nom — toute modification en Phase 3 (T3.1) doit être répercutée dans `renovate.json` (T2.3), sinon automerge Renovate cassé silencieusement.
- Aucune tâche ne touche aux contraintes archi figées (Context unique, `callDomoticz()` exclusif, pas de lib UI externe, pas de lib state management).
- Phase 1 / T1.2 (ADR-007) reste un livrable de *processus* uniquement — pas d'upgrade SDK Expo dans ce plan.
- T1.4 (ADR-009) doit s'appuyer sur une mesure de couverture réelle avant recommandation.
