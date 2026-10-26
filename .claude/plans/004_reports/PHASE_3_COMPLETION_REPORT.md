# Phase 3 : Tests

**Responsable Agent :** QALvin (🟢 QUAL)
**Date Début :** 2026-10-01
**Date Fin :** 2026-10-01
**Statut :** ✅ COMPLÉTÉE

---

## 📝 Tâches

### T3.1 - `OrientationLock.service`

**Statut :** ✅ COMPLÉTÉE — `app/services/__tests__/OrientationLock.service.test.ts` (créé, 16 tests)
- `isTabletScreen` : seuil 600 sur le plus petit côté, portrait/paysage, limites 599/600
- `lockOrientationForDevice` : tablette portrait/paysage → `LANDSCAPE` ; téléphone → aucun appel ; Web (1920×1080) → aucun appel ; échec `lockAsync` → `Logger.warn`, promesse résolue ; succès → `Logger.debug`
- `Platform`/`Dimensions` pilotés par Proxy sur le module react-native réel

### T3.2 - `TabGroups.service`

**Statut :** ✅ COMPLÉTÉE — `app/services/__tests__/TabGroups.service.test.ts` (créé, 25 tests)
- Groupes, Favoris/onglet inconnu → `null`
- `isTabActive` : matrice complète 5×5 hors layout fusionné (égalité stricte) et en layout fusionné (activation groupée)
- `getTabTitle` : libellé simple / « Lumières & Volets » / « Températures & Maison » / Favoris inchangé

### T3.3 - `useTabletLayout` + `useResponsiveColumns(availableWidth)`

**Statut :** ✅ COMPLÉTÉE
- `hooks/__tests__/useTabletLayout.test.ts` (créé, 9 tests) : téléphone portrait/paysage, Tab S6 portrait/paysage, carré 600×600, seuil 601×600, fenêtre large mais basse, rotation sans reload
- `hooks/__tests__/useResponsiveColumns.test.ts` (+4 tests) : `availableWidth` prioritaire, < 600, valeur `0` (définie), `undefined` → fenêtre

### T3.4 - Composants et écrans

**Statut :** ✅ COMPLÉTÉE
- `app/components/__tests__/mergedTabs.component.test.tsx` (créé, 4 tests) : 2 colonnes ordonnées, titres + contenus, `row`/`flex:1` sans hauteur fixe, `getMergedColumnWidth` (1280 → 625)
- `components/__tests__/TabBarItem.test.tsx` (+3 tests) : `isActive` forcé `true`/`false`, défaut
- `app/(tabs)/__tests__/devices.tabs.test.tsx` (+3 tests) / `temperatures.tab.test.tsx` (+2 tests) : `availableWidth` 625 → 50 % (+ cadran 240), 545 → 100 % (+ cadran 180), sans prop → fenêtre
- **`app/(tabs)/__tests__/_layout.test.tsx` (créé, 11 tests)** — fichier jusqu'ici non testé (0 %) : téléphone (Favoris par défaut, 1 écran par onglet, 1 bouton actif, titres simples), tablette paysage (Lumières|Volets et Températures|Maison depuis chacun des 2 boutons, boutons du groupe actifs, titre fusionné, largeur 625 transmise), Favoris inchangé, erreur de chargement

---

## ✅ Vérifications

| Commande | Résultat |
|---|---|
| `npx jest --watchAll=false --coverage` | ✅ 47/47 suites, 1020/1020 tests (940 → 1020) |
| `npm run lint` | ✅ 0 erreur / 0 warning |
| `npm run typecheck` | ✅ 0 erreur |

### Couverture

| Fichier | Lignes | Branches |
|---|---|---|
| `app/services/OrientationLock.service.ts` | 100 % | 100 % |
| `app/services/TabGroups.service.ts` | 100 % | 100 % |
| `hooks/useTabletLayout.ts` | 100 % | 100 % |
| `hooks/useResponsiveColumns.ts` | 100 % | 100 % |
| `app/components/mergedTabs.component.tsx` | 100 % | 100 % |
| `app/(tabs)/devices.tabs.tsx` | 100 % | 100 % |
| `app/(tabs)/temperatures.tab.tsx` | 100 % | 80 % |
| `app/(tabs)/_layout.tsx` | 0 % → 86,6 % | 0 % → 76,5 % |
| **Global** | 77,8 % → **82,8 %** | 76,7 % → **79,8 %** |

Lignes non couvertes restantes de `(tabs)/_layout.tsx` : préexistantes (retour foreground `AppState`, garde cooldown, callback Profiler, cas `404`).

## ⚠️ Notes / Décisions

- **`React.lazy` mocké dans `_layout.test.tsx`** : `babel-preset-expo` conserve les `import()` dynamiques (lazy-loading Metro, T4.3 plan 001), non exécutables par Jest sans `--experimental-vm-modules`. Le mock extrait le chemin de l'`import('...')` et résout le module mocké via `require` — portée limitée à ce fichier, aucune modification de `babel.config.js` / `jest.config.js`.
- Mock global `expo-screen-orientation` dans `jest.setup.ts` (ajouté Phase 1) conservé ; `OrientationLock.service.test.ts` s'appuie dessus (`lockAsync` jest.fn).
- Aucun test existant modifié hors ajouts de blocs `describe` dédiés.
