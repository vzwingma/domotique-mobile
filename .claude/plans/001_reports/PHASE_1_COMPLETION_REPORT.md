# Phase 1 : Décisions architecturales (ADR)

**Responsable Agent :** ARCos (🟠 ARC)
**Date Début :** 2026-07-07
**Date Fin :** 2026-07-07
**Statut :** ✅ COMPLÉTÉE (en attente de Gate#0 — validation développeur humain par ADR)

---

## 📝 Tâches

### T1.1 - Rédiger ADR-006 (unification ESLint)
**Statut :** ✅ DONE

**Fichiers Créés / Modifiés :**
- `docs/adr/006-unification-config-eslint.md` — nouveau

**Résultats :**
- Analyse compatibilité flat de `eslint-config-expo` ~56.0.4 : ✅ confirmée (`package.json` du paquet expose `flat.js`/`flat/`)
- ≥2 options comparées : ✅ (garder flat minimal vs intégrer `eslint-config-expo/flat`)
- Recommandation motivée : ✅ Option B — intégrer `eslint-config-expo/flat`, supprimer `.eslintrc.js`

**Notes :**
`.eslintrc.js` confirmé comme code mort (ESLint 9 + `eslint.config.js` présent ⇒ format flat exclusif, `.eslintrc.js` jamais lu). Risque signalé pour T2.1 : l'intégration du preset `expo` peut révéler de nouvelles violations de lint à corriger (effort à cadrer côté DEVon).

---

### T1.2 - Rédiger ADR-007 (processus veille versions)
**Statut :** ✅ DONE

**Fichiers Créés / Modifiés :**
- `docs/adr/007-processus-veille-majors-expo-react.md` — nouveau

**Résultats :**
- ≥2 options comparées : ✅ (revue trimestrielle seule vs + alerte mensuelle automatisée)
- Recommandation motivée : ✅ Option B — revue trimestrielle + alerte automatisée mensuelle
- Aucun upgrade SDK déclenché : ✅ Livrable strictement limité au processus

**Notes :**
Processus s'appuie sur le dispositif Renovate déjà actif (`dependencyDashboard`, PR draft majors). Critères de déclenchement d'un upgrade hors cadence trimestrielle documentés (faille sécurité critique, fin de support SDK, blocage fonctionnel avéré).

---

### T1.3 - Rédiger ADR-008 (fusion workflows CI)
**Statut :** ✅ DONE

**Fichiers Créés / Modifiés :**
- `docs/adr/008-fusion-workflows-ci.md` — nouveau

**Résultats :**
- ≥2 options comparées : ✅ (fusion complète vs scoping non-chevauchant)
- Décision tranchée explicitement (pas de neutralité) : ✅ Option B — scoping non-chevauchant (`ci.yml` conservé complet sur main/develop, `build-on-all.yml` allégé en `quick-check.yml` lint+test pour branches feature)

**Notes :**
Confirmé par lecture des deux workflows : double exécution effective sur push `main`/`develop` (les deux déclenchent prebuild + test + scan SonarCloud sur le même commit). `renovate.json` référence déjà `"CI Pipeline"` (= `ci.yml`), ce qui conforte le choix de conserver `ci.yml` comme pipeline de référence.

---

### T1.4 - Rédiger ADR-009 (seuil de couverture CI)
**Statut :** ✅ DONE

**Fichiers Créés / Modifiés :**
- `docs/adr/009-seuil-couverture-ci.md` — nouveau

**Résultats :**
- Mesure de couverture réelle effectuée (`npm test -- --watchAll=false --coverage`) : ✅
  - Statements 69.58 % / Branches 71.53 % / Functions 70.00 % / Lines 70.27 % (global, 869 tests, 40 suites, tous passants)
  - Détail par couche : `app/controllers` 81.44 % (cible 100 %, non atteint), `app/services` 84.89 % (cible ≥90 %, non atteint), `app/components` 46.85 % (cible ≥70 %, fortement non atteint), `app/models` 100 % (cible ≥85 %, atteint)
- ≥2 options comparées : ✅ (retirer `continue-on-error`/`|| true` vs documenter délégation SonarCloud)
- Recommandation motivée : ✅ Option B — documenter la délégation au Quality Gate SonarCloud, clarifier le YAML (retirer l'intitulé trompeur "≥80%")

**Notes :**
Recommandation directement conditionnée à la mesure : retirer l'échappatoire (Option A) casserait immédiatement la CI (couverture globale ~70 % < 80 % requis), sans plan de rattrapage cadré dans ce plan. Décision documentée comme non disruptive.

---

### T1.5 - Rédiger ADR-010 (stratégie build/déploiement EAS)
**Statut :** ✅ DONE

**Fichiers Créés / Modifiés :**
- `docs/adr/010-strategie-build-deploiement-eas.md` — nouveau

**Résultats :**
- ≥2 options comparées : ✅ (3 options après correction — cf. Note de correction ci-dessous)
- Décision tranchée : ✅ Option C — conserver le workflow EAS existant (`.eas/workflows/android-build-main-workflow.yml`, builds `previewV`/`previewC` automatiques sur push `main`) + scripts npm locaux (`eas:build:development`, `eas:build:production`, `eas:submit`) pour les cas non couverts
- Scripts npm recommandés : ✅

**Notes :**
Arbitrage motivé par le coût/risque d'étendre l'automatisation en CI (builds cloud, risque de déclenchement accidentel d'un submit production) face à une cadence de release faible (équipe réduite / app perso). `EXPO_TOKEN` déjà présent dans les workflows GitHub Actions existants confirmé (mécanisme distinct des EAS Workflows, non concerné par la décision retenue).

**Correction post-Gate#0 (2026-07-07) :**
Le développeur a signalé lors de la revue Gate#0 une erreur factuelle : l'ADR-010 initial affirmait qu'aucune automatisation de build n'existait, alors que `.eas/workflows/android-build-main-workflow.yml` (EAS Workflow natif, distinct de GitHub Actions) déclenche déjà des builds `previewV` puis `previewC` automatiques sur chaque push vers `main`. L'ADR-010 a été corrigé en conséquence : contexte mis à jour pour refléter l'automatisation preview existante, options réévaluées (Option A initiale devenue Option C, recentrée sur les cas non couverts par le workflow EAS — `development`/`production`/`submit`), recommandation ajustée sans contradiction. Statut de la tâche T1.5 reste ✅ DONE ; vérification effectuée qu'aucun autre fichier n'existe dans `.eas/workflows/` (un seul fichier présent, aucun autre manqué en Phase 1).

---

### T1.6 - Rédiger ADR-011 (gestion keystore production EAS Credentials)
**Statut :** ✅ DONE

**Fichiers Créés / Modifiés :**
- `docs/adr/011-gestion-keystore-production-eas-credentials.md` — nouveau

**Résultats :**
- Décision de facto formalisée : ✅ EAS Credentials source de vérité pour le keystore de production
- Confirmation `debug.keystore`/`android/` jamais utilisés en distribution réelle : ✅ (vérifié dans `android/app/build.gradle` généré — commentaire natif RN avertissant explicitement sur ce point ; `android/` entièrement gitignored)
- Aucune manipulation/exposition de secret dans l'ADR : ✅

**Notes :**
Pas de tableau d'options concurrentes (conforme à la nature de la tâche — formalisation d'un état de fait), remplacé par une section "Processus opérationnel (non-sensible)" décrivant l'usage de `eas credentials` sans jamais afficher de valeur sensible.

---

## 📊 Synthèse de Phase

**Tâches Complétées :** 6/6 ✅

**Critères de Réussite Atteints :**
- ✅ 6 ADR rédigés (006 à 011), chacun avec ≥2 options comparées + recommandation motivée (T1.6 formalise une décision de facto sans options concurrentes, conformément à sa nature propre — cf. note ci-dessus)
- ✅ ADR-009 s'appuie sur une mesure factuelle de couverture actuelle (Statements 69.58 % / Branches 71.53 % / Functions 70.00 % / Lines 70.27 %)
- ✅ ADR-008 tranche explicitement fusion vs scoping (Option B retenue, pas de neutralité)
- ✅ Chaque ADR suit le format `docs/adr/NNN-titre-court.md` existant (Statut/Date/Décideurs/Portée, Contexte, Décision, Alternatives, Conséquences, Mise en œuvre, Références)
- ⏳ Gate#0 par ADR : **en attente de validation développeur humain** — statut de chaque ADR fixé à "Proposé" dans l'attente

**Bloqueurs :** Aucun ❌

**Prochaine Phase :** Phase 2 peut démarrer dès Gate#0 validé sur ADR-006 (T2.1 en dépend directement) ; T2.2 (.nvmrc/engines) peut démarrer immédiatement sans attendre Gate#0, comme prévu dans les notes de parallélisation du plan.

---

## 📦 Livrables

✅ 6 ADR rédigés dans `docs/adr/` :
- `docs/adr/006-unification-config-eslint.md`
- `docs/adr/007-processus-veille-majors-expo-react.md`
- `docs/adr/008-fusion-workflows-ci.md`
- `docs/adr/009-seuil-couverture-ci.md`
- `docs/adr/010-strategie-build-deploiement-eas.md`
- `docs/adr/011-gestion-keystore-production-eas-credentials.md`

---

**Rapport approuvé par :** TBD (en attente Gate#0)
**Date d'approbation :** TBD

Fin du rapport Phase 1
