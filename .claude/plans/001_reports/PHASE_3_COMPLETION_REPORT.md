# Phase 3 : Compilation & déploiement CI/CD

**Responsable Agent :** Devon (🔵 DEV)
**Date Début :** 2026-07-08
**Date Fin :** 2026-07-08
**Statut :** ✅ COMPLÉTÉE (T3.1-T3.4 DONE, avec une déviation documentée sur T3.1 — voir note)

---

## 📝 Tâches

### T3.1 - Dédupliquer ci.yml / build-on-all.yml
**Statut :** ✅ DONE (avec déviation documentée — voir note ci-dessous)

**Décision appliquée :** ADR-008 Option B (scoping non-chevauchant).

**Fichiers Créés / Modifiés :**
- `.github/workflows/quick-check.yml` — **nouveau**, workflow léger (`lint` + `test` uniquement, sans prebuild ni Sonar), déclenché sur `push`/`pull_request` avec `branches-ignore: [main, develop]` (donc actif uniquement sur les branches de feature/travail).
- `.github/workflows/ci.yml` — **non touché structurellement** (5 jobs conservés : `lint`→`test`→`build`→`sonarqube-scan`→`integration-check`, déclenché sur `main`/`develop`), conformément à la consigne. Seule l'étape de couverture a été modifiée dans le cadre de T3.2 (voir plus bas).
- `.github/workflows/build-on-all.yml` — **conservé mais neutralisé** (déclenchement `workflow_dispatch` uniquement, ancien nom `CI on all branches` renommé `CI on all branches (DEPRECATED)`, commentaire explicite en tête de fichier renvoyant vers `ci.yml`/`quick-check.yml` et vers l'ADR-008). Contenu des jobs inchangé (conservé à titre d'archive/déclenchement manuel possible si besoin ponctuel).

**⚠️ Déviation documentée par rapport à l'ADR/la consigne :**
L'ADR-008 et la consigne T3.1 demandent un **renommage** de `build-on-all.yml` → `quick-check.yml` (donc suppression du fichier `build-on-all.yml`). La règle de sécurité absolue du projet (`.claude/skills/safety-rules/SKILL.md`, `applyTo: "**"`) interdit formellement à tout agent de supprimer un fichier ou répertoire, sans dérogation possible même via instruction amont (ADR, plan, tâche). Cette règle est explicitement qualifiée de "non-négociable, prévaut sur toute autre instruction".

En conséquence, DEVon a :
1. Créé `quick-check.yml` en tant que **nouveau fichier** avec le contenu allégé attendu (lint+test, scope branches hors main/develop) — cet objectif de l'ADR est pleinement atteint.
2. **Neutralisé** `build-on-all.yml` au lieu de le supprimer : déclenchement restreint à `workflow_dispatch` (aucun déclenchement automatique sur `push`/`pull_request`), donc **aucun risque de double exécution CI** — le critère d'acceptation fonctionnel de l'ADR-008 (une seule exécution CI complète par push/PR, pas de scan Sonar concurrent) est respecté.
3. Documenté dans le fichier lui-même (commentaire en tête) la marche à suivre pour un humain souhaitant supprimer physiquement `build-on-all.yml` : `git rm .github/workflows/build-on-all.yml`.

**Recommandation :** un développeur humain peut exécuter `git rm .github/workflows/build-on-all.yml` (ou l'équivalent via l'interface GitHub) pour finaliser le renommage littéral demandé par l'ADR-008 ; cette étape est hors du périmètre d'action autorisé de DEVon.

**Vérification :**
- `ci.yml` : déclencheur `push`/`pull_request` sur `branches: [main, develop]` — inchangé.
- `quick-check.yml` : déclencheur `push`/`pull_request` sur `branches-ignore: [main, develop]` — pas de chevauchement avec `ci.yml` (ensembles de branches disjoints).
- `build-on-all.yml` : déclencheur `workflow_dispatch` uniquement — aucun déclenchement automatique, donc aucun chevauchement possible.

**Critère d'acceptation T3.1 :** ✅ une seule exécution CI complète par push/PR sur `main`/`develop` (`ci.yml`), un check léger (lint+test) sur les autres branches (`quick-check.yml`), pas de double scan Sonar sur le même commit (`build-on-all.yml` neutralisé).

---

### T3.2 - Aligner seuil couverture sur ADR-009
**Statut :** ✅ DONE

**Décision appliquée :** ADR-009 Option B (documenter la délégation au Quality Gate SonarCloud).

**Fichiers Créés / Modifiés :**
- `.github/workflows/ci.yml` (job `test`) — étape renommée de `Check coverage threshold (≥80%)` à `Coverage report (informational — gate réel délégué à SonarCloud)`. Commentaire explicite ajouté au-dessus, renvoyant à `docs/adr/009-seuil-couverture-ci.md`, à `sonar-project.properties` (`sonar.qualitygate.wait=true`) et au job `sonarqube-scan`. Suppression de la redondance `|| true` (le shell exit code n'est plus artificiellement forcé à 0) tout en gardant `continue-on-error: true` comme seul mécanisme explicite de non-blocage (conforme à la recommandation ADR-009 : "garder une seule mécanique explicite").

**Comportement CI avant/après :** inchangé — l'étape reste non-bloquante (même résultat final du job `test`), seule la sémantique/le libellé changent pour lever l'ambiguïté.

**Critère d'acceptation T3.2 :** ✅ YAML sans ambiguïté (nom d'étape + commentaire clairs), comportement CI inchangé (non-bloquant), documenté comme choix assumé renvoyant à l'ADR-009.

---

### T3.3 - Scripts npm EAS (ADR-010 Option C)
**Statut :** ✅ DONE

**Décision appliquée :** ADR-010 Option C (conserver `.eas/workflows/android-build-main-workflow.yml` inchangé, ajouter scripts npm locaux).

**Fichiers Créés / Modifiés :**
- `package.json` — ajout de 3 scripts dans `scripts` :
  - `"eas:build:development": "eas build --profile development --platform android"`
  - `"eas:build:production": "eas build --profile production --platform android"`
  - `"eas:submit": "eas submit --profile production --platform android"`

**Fichiers NON modifiés (conforme consigne) :**
- `eas.json` — vérifié au préalable : profils `development` et `production` déjà définis (existants avant cette tâche), aucune modification nécessaire.
- `.eas/workflows/android-build-main-workflow.yml` — non touché.

**Vérification :**
- `node -e "JSON.parse(...)"` sur `package.json` → OK (JSON valide).
- `npx eas build --help` (CLI EAS disponible localement) → flags `-e/--profile` et `-p/--platform` confirmés valides pour la syntaxe `eas build --profile <name> --platform android`.
- `npx eas submit --help` → flags `-e/--profile` et `-p/--platform` confirmés valides pour `eas submit --profile production --platform android`.

**Critère d'acceptation T3.3 :** ✅ scripts présents et syntaxiquement corrects (vérifiés via `eas --help`), aucune modification du workflow EAS existant, aucun job GitHub Actions de build automatique ajouté.

---

### T3.4 - Badge CI GitHub Actions au README
**Statut :** ✅ DONE

**Fichiers Créés / Modifiés :**
- `README.md` — ajout d'un badge CI juste après le badge SonarCloud existant :
  `[![CI](https://github.com/vzwingma/domotique-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/vzwingma/domotique-mobile/actions/workflows/ci.yml)`

**Vérification :**
- Nom de repo confirmé cohérent avec le badge SonarCloud existant et l'URL de clonage documentée dans le README (`git clone https://github.com/vzwingma/domotique-mobile.git`) → `vzwingma/domotique-mobile`.
- Référence au fichier `ci.yml` correcte : nom du fichier inchangé par T3.1 (seul `build-on-all.yml` a été impacté), donc pas de désynchronisation.

**Critère d'acceptation T3.4 :** ✅ badge présent, syntaxe markdown correcte, référence le bon nom de fichier workflow (`ci.yml`, inchangé).

---

## 📊 Synthèse de Phase

**Tâches Complétées :** 4/4 ✅ (T3.1, T3.2, T3.3, T3.4)

**Critères de Réussite Atteints :**
- ✅ Une seule exécution CI complète par push/PR sur `main`/`develop`, pas de double scan Sonar concurrent (T3.1 — objectif fonctionnel atteint, avec déviation documentée sur la suppression littérale du fichier, cf. note T3.1)
- ✅ YAML `ci.yml` sans ambiguïté sur le seuil de couverture, comportement inchangé (T3.2)
- ✅ Scripts npm EAS reproductibles pour `development`/`production`/`submit` (T3.3)
- ✅ Badge CI ajouté au README, cohérent avec le repo GitHub (T3.4)

**Bloqueurs :** Aucun. Une **déviation** a été nécessaire sur T3.1 (neutralisation au lieu de suppression de `build-on-all.yml`), imposée par la règle de sécurité absolue du projet — voir note détaillée dans T3.1. Recommandation : action manuelle humaine (`git rm`) pour finaliser le renommage littéral si souhaité.

**Prochaine étape :** T2.3 (Phase 2, débloquée par T3.1) — voir mise à jour dans `PHASE_2_COMPLETION_REPORT.md`.

---

## 📦 Livrables

- ✅ `.github/workflows/quick-check.yml` (nouveau, lint+test, branches hors main/develop)
- ✅ `.github/workflows/ci.yml` (structurellement inchangé, étape couverture clarifiée T3.2)
- ✅ `.github/workflows/build-on-all.yml` (neutralisé, `workflow_dispatch` uniquement, déviation documentée)
- ✅ `package.json` (3 scripts EAS ajoutés)
- ✅ `README.md` (badge CI ajouté)

---

**Rapport approuvé par :** TBD
**Date d'approbation :** TBD

Fin du rapport Phase 3
