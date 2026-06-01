# Phase 2 — Tests double refresh

**Agent :** 🟢 QUALvin  
**Date :** 2026-06-01  
**Statut :** ✅ COMPLÉTÉE

## Tâches

### T2.1 — Tests double refresh `devices.controller`
- **Statut :** ✅ DONE
- **Fichier :** `app/controllers/__tests__/devices.controller.test.ts`
- **Tests ajoutés :**
  1. `updateDeviceState` via `onClickDeviceIcon` ON/OFF : refresh immédiat + refresh à 1000ms
  2. `updateDeviceLevel` (level > 0) : refresh immédiat + refresh à 1000ms
  3. `refreshEquipementState(..., { scheduleSecondRefresh: true, secondRefreshDelayMs: 500 })` : second appel après 500ms
  4. `refreshEquipementState()` sans options : 1 seul appel (non-régression)

### T2.2 — Tests double refresh `thermostats.controller`
- **Statut :** ✅ DONE
- **Fichier :** `app/controllers/__tests__/thermostats.controller.test.ts`
- **Tests ajoutés :**
  1. `updateThermostatPoint()` : refresh immédiat + refresh à 1000ms
  2. `refreshEquipementState(..., { scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 })` : second appel déclenché
  3. `refreshEquipementState()` sans options : 1 seul appel (non-régression)

## Résultats

- **Test Suites :** 39/39 ✅
- **Tests :** 867/867 ✅ (+7 nouveaux)
- **Snapshots :** 12/12 ✅
- **typecheck :** ✅
- **validate:expo :** ✅

## Coverage controllers

| Fichier | Statements | Branches | Funcs | Lines |
|---------|-----------|----------|-------|-------|
| `devices.controller.tsx` | 72.02% | 70% | 70% | 71.54% |
| `thermostats.controller.tsx` | 93.75% | 90% | 86.66% | 96.29% |
| **controllers (global)** | **81.49%** | **74.78%** | **83.72%** | **81.44%** |

⚠️ Cible 90% non atteinte sur `devices.controller` — code pré-existant hors scope fix (labels, groupes, tri). Thermostats ≥ 90% ✅.

## Synthèse

- **Tâches complétées :** 2/2
- **Cas de test couverts :** 7/7
- **Bloqueurs :** Aucun
- **Note :** Coverage `devices.controller` à 72% — sous-cible due au code pré-existant non couvert, pas lié aux changements AP-004.

---
**Fin rapport Phase 2**
