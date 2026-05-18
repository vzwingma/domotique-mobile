# Plan d'Action : Remédiation SonarCloud (Maintenability + Reliability)

**Document :** `.github/plans/003_sonarcloud_remediation.plan.md`  
**Date de création :** 2026-05-07  
**Statut :** ✅ Complété  
**Objectif Prioritaire :** HIGH

---

## 🎯 Objectif Global

Résorber les nouvelles violations SonarCloud signalées sur le new code de la PR/branche en échec, en traitant d'abord la fiabilité (Reliability), puis la maintenabilité (Maintainability), avec une traçabilité complète des décisions et des corrections.

Le plan vise un résultat reproductible : scan SonarCloud sans nouvelles violations ciblées, et qualité conservée via validations TypeScript, Expo et tests unitaires.

---

## 📋 Phase 1 : Baseline Sonar et triage des violations

### Contexte
- La demande initiale cible **12 violations Maintenability** et **3 Reliability**.
- La requête publique SonarCloud sans filtre PR retourne actuellement **20 issues avec impact Maintenability** et **3 avec impact Reliability**.
- Le delta suggère un écart de périmètre (new code global vs PR/branche ciblée).

### Critères de Réussite
✅ Inventaire Reliability complet (rule, fichier, ligne, effort).  
✅ Backlog de remédiation priorisé par risque (Reliability > Maintainability).  
✅ Stratégie de lotissement définie pour exécution DEV/QA/DOC.

### Tâches (Agent: 🟠 ARCos)

#### T1.1 - Établir la baseline Sonar exploitable
- **Fichier(s) :** SonarCloud API (issues search), `.github/plans/003_reports/PHASE_1_COMPLETION_REPORT.md`
- **Couvrir / Implémenter :**
  - Capturer les issues Reliability et Maintainability du new code.
  - Documenter les divergences de périmètre (15 attendu vs 23 observé sans filtre PR).
- **Acceptation :** baseline publiée et exploitable pour les phases de correction.

#### T1.2 - Prioriser les lots de correction
- **Fichier(s) :** `.github/plans/003_sonarcloud_remediation.plan.md`
- **Couvrir / Implémenter :**
  - Lot R (Reliability): correction immédiate des 3 issues.
  - Lot M1/M2 (Maintainability): quick wins puis refactors localisés.
- **Acceptation :** ordre d'exécution clair avec dépendances.

---

## 📋 Phase 2 : Correction des violations Reliability

### Contexte
- Les 3 violations Reliability partagent la règle `typescript:S7773` (usage Number globals legacy).
- Ces corrections sont à faible risque fonctionnel mais à impact qualité immédiat.

### Critères de Réussite
✅ 0 violation Reliability restante dans le périmètre ciblé.  
✅ Aucun comportement métier modifié involontairement.  
✅ Tests ciblés et validations qualité passants.

### Tâches (Agent: 🔵 DEVon + 🟢 QUALvin)

#### T2.1 - Corriger `S7773` sur services/modèles
- **Fichier(s) :** `app/services/Validator.service.ts`, `app/models/domoticzThermostat.model.ts`
- **Couvrir / Implémenter :**
  - `parseFloat` -> `Number.parseFloat`
  - `isNaN` -> `Number.isNaN`
- **Acceptation :** toutes les issues Reliability associées sont closes.

#### T2.2 - Valider non-régression QA sur chemins corrigés
- **Fichier(s) :** tests unitaires impactés (`app/services/__tests__/*`, `app/models/__tests__/*`)
- **Couvrir / Implémenter :**
  - Cas nominal et cas d'entrée invalide sur parsing numérique.
  - Exécution des validations QA projet (tests, Expo doctor, typecheck strict).
- **Acceptation :** validations QA vertes sur le périmètre corrigé.

---

## 📋 Phase 3 : Correction des violations Maintainability

### Contexte
- Les violations Maintainability sont majoritairement des code smells TypeScript.
- Le lot doit être optimisé pour corriger d'abord les règles récurrentes à faible coût.

### Critères de Réussite
✅ Violations Maintainability du périmètre PR/branche ramenées à 0 (objectif cible) ou réduites avec reste documenté.  
✅ Refactors localisés, sans contournement typage (`any`/casts aveugles).  
✅ Lisibilité et maintenabilité améliorées sur les fichiers touchés.

### Tâches (Agent: 🔵 DEVon + 🟢 QUALvin)

#### T3.1 - Traiter quick wins de code smells
- **Fichier(s) :** fichiers signalés par Sonar (services/models principalement)
- **Couvrir / Implémenter :**
  - imports inutilisés, assertions redondantes, simplifications triviales.
- **Acceptation :** lot quick wins clos sans régression.

#### T3.2 - Traiter refactors de lisibilité/complexité
- **Fichier(s) :** ex. `app/services/FavoritesManager.service.ts`
- **Couvrir / Implémenter :**
  - extraction de ternaires imbriqués, clarification des branches.
- **Acceptation :** règles de maintenabilité concernées closes.

#### T3.3 - Vérification QA de stabilisation
- **Fichier(s) :** tests impactés
- **Couvrir / Implémenter :**
  - compléter les tests sur zones modifiées.
  - exécuter les validations QA obligatoires.
- **Acceptation :** aucun échec bloquant introduit.

---

## 📋 Phase 4 : Documentation, preuves et clôture

### Contexte
- Les corrections doivent rester auditables et réutilisables pour les prochaines PRs.

### Critères de Réussite
✅ Rapports de phase AP-003 complets.  
✅ Index des plans à jour.  
✅ Décision de clôture GO/NOGO tracée.

### Tâches (Agent: 🟣 DOCly + 🟠 ARCos)

#### T4.1 - Rédiger rapports de phase et synthèse remédiation
- **Fichier(s) :** `.github/plans/003_reports/PHASE_*_COMPLETION_REPORT.md`
- **Acceptation :** résultats et preuves consolidés par phase.

#### T4.2 - Mettre à jour l'index des plans
- **Fichier(s) :** `.github/plans/README.md`
- **Acceptation :** AP-003 visible avec statut courant.

#### T4.3 - Validation finale
- **Fichier(s) :** `.github/plans/003_sonarcloud_remediation.plan.md`
- **Acceptation :** synthèse de clôture validée 👤.

---

## 📊 Résumé des Tâches par Agent

### 🟠 ARCos
- T1.1, T1.2, T4.3
- **Livrable :** baseline triée, orchestration et clôture.

### 🔵 DEVon
- T2.1, T3.1, T3.2
- **Livrable :** correctifs code Sonar.

### 🟢 QUALvin
- T2.2, T3.3
- **Livrable :** validations QA et tests de non-régression.

### 🟣 DOCly
- T4.1, T4.2
- **Livrable :** documentation AP-003 à jour.

---

## 📍 Dépendances entre Phases

```text
Phase 1 (Baseline/triage)
    ↓
Phase 2 (Reliability) ← [Phase 1 doit être ✅]
    ↓
Phase 3 (Maintainability) ← [Phase 2 doit être ✅]
    ↓
Phase 4 (Doc + clôture) ← [Phase 3 doit être ✅]
```

---

## ✅ Critères de Succès Globaux

1. ✅ Les 3 violations Reliability sont corrigées.
2. ✅ Les violations Maintainability du périmètre traité sont remédiées dans les fichiers ciblés.
3. ✅ Les validations qualité projet passent sur le code corrigé (hors lint baseline déjà en défaut de configuration ESLint).
4. ✅ AP-003 est entièrement tracé (plan + rapports + index).

