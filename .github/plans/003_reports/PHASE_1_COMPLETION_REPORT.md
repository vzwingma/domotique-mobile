# Phase 1 : Baseline Sonar et triage des violations

**Responsable Agent :** solution-architect (🟠 ARCos)  
**Date Début :** 2026-05-07  
**Date Fin :** 2026-05-07  
**Statut :** ✅ COMPLÉTÉE

## Tâches

### T1.1 - Établir la baseline Sonar exploitable

**Statut :** ✅ DONE

**Sources exploitées :**
- `https://sonarcloud.io/api/issues/search?componentKeys=vzwingma_domotique-mobile&inNewCodePeriod=true&impactSoftwareQualities=RELIABILITY&ps=100`
- `https://sonarcloud.io/api/issues/search?componentKeys=vzwingma_domotique-mobile&inNewCodePeriod=true&impactSoftwareQualities=MAINTAINABILITY&ps=100`

**Résultats :**
- Reliability (impact) : **3** issues ouvertes
- Maintainability (impact) : **20** issues ouvertes
- Écart avec la demande initiale : **12 Maintenability + 3 Reliability**

**Analyse d'écart :**
- Le périmètre visé par la demande correspond à la PR/branche en échec.
- Les requêtes SonarCloud publiques utilisées ici reflètent un new-code agrégé (sans filtre explicite PR), ce qui peut expliquer l'écart de comptage.

### T1.2 - Prioriser les lots de correction

**Statut :** ✅ DONE

**Lots définis :**
1. **Lot R (priorité P0)** : 3 issues Reliability (règle `typescript:S7773`)
2. **Lot M1 (priorité P1)** : quick wins Maintenability (imports/assertions/typage redondant)
3. **Lot M2 (priorité P2)** : refactors lisibilité/complexité (ex: ternaires imbriqués)

**Backlog exécutable :**
- `sonar-reliability-fixes-dev`
- `sonar-reliability-tests-qa`
- `sonar-maintainability-fixes-dev`
- `sonar-maintainability-tests-qa`
- `sonar-remediation-doc-doc`
- `sonar-final-validation-arc`

## Baseline détaillée — Reliability (3)

| Rule | Fichier | Ligne | Message | Effort |
|---|---|---:|---|---|
| `typescript:S7773` | `app/services/Validator.service.ts` | 236 | Prefer `Number.parseFloat` over `parseFloat`. | 2min |
| `typescript:S7773` | `app/services/Validator.service.ts` | 239 | Prefer `Number.isNaN` over `isNaN`. | 2min |
| `typescript:S7773` | `app/models/domoticzThermostat.model.ts` | 139 | Prefer `Number.parseFloat` over `parseFloat`. | 2min |

## Synthèse

- **Tâches Complétées :** 2/2 ✅
- **Critères de Réussite Atteints :** 3/3 ✅
- **Bloqueurs :** Aucun
- **Suite recommandée :** démarrer immédiatement le lot Reliability (Phase 2)

---

**Fin du rapport Phase 1**
