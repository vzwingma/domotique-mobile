# Phase 1 — Rapport de complétion
**Plan :** AP-004 — Fix race condition post-commande  
**Phase :** Phase 1 — Activation `scheduleSecondRefresh` aux call sites de commande  
**Date :** 2025-07-10  
**Agent :** 🔵 DEVon

---

## Statut global : ✅ COMPLÉTÉ

---

## Détail des tâches

| Tâche | Description | Statut |
|-------|-------------|--------|
| T1.1 | `devices.controller.tsx` — `updateDeviceState()` : ajout `{ scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 }` | ✅ |
| T1.2 | `devices.controller.tsx` — `updateDeviceLevel()` : ajout `{ scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 }` | ✅ |
| T1.3 | `thermostats.controller.tsx` — `updateThermostatPoint()` : ajout `{ scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 }` | ✅ |

---

## Fichiers modifiés

### `app/controllers/devices.controller.tsx`
- **Ligne 172** (`updateDeviceState`) :  
  `refreshEquipementState(setDevicesData)` → `refreshEquipementState(setDevicesData, { scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 })`
- **Ligne 145** (`updateDeviceLevel`) :  
  `refreshEquipementState(storeDevicesData)` → `refreshEquipementState(storeDevicesData, { scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 })`

### `app/controllers/thermostats.controller.tsx`
- **Ligne 103** (`updateThermostatPoint`) :  
  `refreshEquipementState(setDomoticzThermostatData)` → `refreshEquipementState(setDomoticzThermostatData, { scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 })`

---

## Vérifications qualité

### TypeScript typecheck
```
npm run typecheck → exit code 0 ✅
tsc --noEmit : aucune erreur
```

### Tests unitaires
```
npm test -- --watchAll=false → exit code 0 ✅
Test Suites : 39 passed, 39 total
Tests        : 860 passed, 860 total
```

> ⚠️ **Note :** Un warning `A worker process has failed to exit gracefully` est apparu — il s'agit d'un problème pré-existant lié aux `setTimeout` non nettoyés dans la suite de tests (détecté avant cette phase). Aucune régression introduite.

---

## Résumé des changements

Les 3 call sites de commande passent désormais `{ scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 }` à `refreshEquipementState()`. Cela active le second refresh différé de 1 seconde déjà implémenté dans l'infrastructure, permettant à Domoticz de mettre à jour son état interne avant le second appel de rafraîchissement de l'UI.

Aucune autre logique n'a été modifiée — périmètre strictement respecté.
