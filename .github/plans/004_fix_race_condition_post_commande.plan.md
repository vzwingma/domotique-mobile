# AP-004 — Fix race condition : double refresh décalé post-commande

**Date :** 2026-06-01  
**Statut :** ⏳ Planifié  
**Auteur :** 🟠 ARCos

---

## 🎯 Objectif Global

Après une commande (volet, lumière, thermostat), l'application envoie la commande au serveur Domoticz puis déclenche immédiatement un `GET_DEVICES`. Domoticz (hub IoT) traite la commande de façon asynchrone (RF/Z-Wave/Zigbee) et n'a pas encore mis à jour son état interne au moment du premier refresh → l'UI affiche l'ancien état.

**Outcome attendu :** Après toute commande, l'UI reflète le nouvel état dans un délai ≤ 1,5 s sans intervention utilisateur.

**Cause racine :** L'infrastructure `scheduleSecondRefresh` existe déjà dans `refreshEquipementState()` des deux controllers (`devices.controller.tsx`, `thermostats.controller.tsx`) mais n'est **jamais activée** aux call sites de commande.

**Fix minimal :** Passer `{ scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 }` aux 3 appels de `refreshEquipementState()` concernés.

---

## Phase 1 — Implémentation (DEVon)

### Contexte
- `updateDeviceState()` et `updateDeviceLevel()` dans `devices.controller.tsx` appellent `refreshEquipementState(storeDevicesData)` sans options.
- `updateThermostatPoint()` dans `thermostats.controller.tsx` appelle `refreshEquipementState(setDomoticzThermostatData)` sans options.
- Le type `RefreshOptions` et la logique `scheduleSecondRefresh` sont déjà implémentés dans les deux controllers.

### Critères de Réussite
- ✅ Les 3 call sites passent `{ scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 }`
- ✅ Aucune autre logique modifiée (pas de refactoring hors scope)
- ✅ `npm run typecheck` passe sans erreur
- ✅ `npm test` passe sans régression

### Tâches

#### T1.1 — Activer double refresh dans `updateDeviceState()`
- **Agent :** DEVon
- **Fichier :** `app/controllers/devices.controller.tsx`
- **Implémenter :** Dans `.finally()` de `updateDeviceState()`, remplacer `refreshEquipementState(setDevicesData)` par `refreshEquipementState(setDevicesData, { scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 })`
- **Acceptation :** Call site modifié, typecheck OK

#### T1.2 — Activer double refresh dans `updateDeviceLevel()`
- **Agent :** DEVon
- **Fichier :** `app/controllers/devices.controller.tsx`
- **Implémenter :** Dans `.finally()` de `updateDeviceLevel()`, même modification que T1.1
- **Acceptation :** Call site modifié, typecheck OK

#### T1.3 — Activer double refresh dans `updateThermostatPoint()`
- **Agent :** DEVon
- **Fichier :** `app/controllers/thermostats.controller.tsx`
- **Implémenter :** Dans `.finally()` de `updateThermostatPoint()`, remplacer `refreshEquipementState(setDomoticzThermostatData)` par `refreshEquipementState(setDomoticzThermostatData, { scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 })`
- **Acceptation :** Call site modifié, typecheck OK

---

## Phase 2 — Tests (QUALvin)

### Contexte
Les tests existants de `devices.controller.test.ts` et `thermostats.controller.test.ts` couvrent `refreshEquipementState` mais ne vérifient pas le comportement du second refresh différé.

### Critères de Réussite
- ✅ Tests vérifient que `loadDomoticzDevices` / `loadDomoticzThermostats` est appelé 2 fois après une commande (immédiat + delayed)
- ✅ `jest.useFakeTimers()` utilisé pour contrôler le délai
- ✅ Pas de régression sur les tests existants
- ✅ Couverture `devices.controller` + `thermostats.controller` ≥ 90%

### Tâches

#### T2.1 — Tester double refresh dans `devices.controller`
- **Agent :** QUALvin
- **Fichier :** `app/controllers/__tests__/devices.controller.test.ts`
- **Couvrir :**
  - `updateDeviceState()` : après appel commande, `loadDomoticzDevices` appelé 1x immédiatement, puis 1x après 1000ms (via `jest.advanceTimersByTime`)
  - `updateDeviceLevel()` : même vérification
  - `refreshEquipementState()` avec `scheduleSecondRefresh: true` : second appel après le délai configuré
  - `refreshEquipementState()` sans options : toujours 1 seul appel (non-régression)
- **Acceptation :** 4 cas couverts, tous passants

#### T2.2 — Tester double refresh dans `thermostats.controller`
- **Agent :** QUALvin
- **Fichier :** `app/controllers/__tests__/thermostats.controller.test.ts`
- **Couvrir :**
  - `updateThermostatPoint()` : après appel, `loadDomoticzThermostats` appelé 1x immédiatement + 1x après 1000ms
  - `refreshEquipementState()` avec `scheduleSecondRefresh: true` : second appel déclenché par timer
  - Non-régression `refreshEquipementState()` sans options
- **Acceptation :** 3 cas couverts, tous passants

---

## Phase 3 — Documentation (DOCly)

### Tâches

#### T3.1 — Mise à jour CHANGELOG
- **Agent :** DOCly
- **Fichier :** `CHANGELOG.md`
- **Ajouter :** Entrée `Fixed` pour AP-004 — correction race condition affichage état post-commande (volet/lumière/thermostat) via double refresh décalé (1 s)
- **Acceptation :** Entrée en tête CHANGELOG, format Keep a Changelog respecté

---

## Phase 4 — FinOps (FINNops)

### Tâches

#### T4.1 — Rapport FinOps AP-004
- **Agent :** FINNops
- **Fichier :** `.github/plans/004_reports/FINNOPS_REPORT.md`
- **Couvrir :** Analyse coûts session, optimisations instructions, recommandations
- **Acceptation :** Rapport présent et structuré

---

## Résumé par Agent

| Agent | Tâches | Livrables |
|-------|--------|-----------|
| 🔵 DEVon | T1.1, T1.2, T1.3 | 3 call sites modifiés dans 2 fichiers |
| 🟢 QUALvin | T2.1, T2.2 | Tests double refresh dans 2 fichiers de test |
| 🟣 DOCly | T3.1 | Entrée CHANGELOG |
| 💰 FINNops | T4.1 | Rapport FinOps |

---

## Dépendances entre phases

```
Phase 1 (DEVon)
    ├──▶ Phase 2 (QUALvin)   [dépend de Phase 1]
    └──▶ Phase 3 (DOCly)     [peut démarrer en parallèle de Phase 2]
                              ↓
                         Phase 4 (FINNops) [après Phase 2 + 3]
```

---

## Critères de Succès Globaux

- ✅ Les 3 call sites de `refreshEquipementState()` passent les options double refresh
- ✅ `npm run typecheck` passe sans erreur
- ✅ `npm test -- --watchAll=false --coverage` passe sans régression
- ✅ Couverture controllers ≥ 90%
- ✅ CHANGELOG mis à jour
- ✅ Rapport FinOps produit

---

## Plan d'Exécution

1. ✅ Plan validé → lancer **Phase 1 (DEVon)**
2. Phase 1 terminée → lancer **Phase 2 (QUALvin)** + **Phase 3 (DOCly)** en parallèle
3. Phases 2 + 3 terminées → lancer **Phase 4 (FINNops)**
