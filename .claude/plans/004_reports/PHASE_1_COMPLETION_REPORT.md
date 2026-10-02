# Phase 1 : Socle — orientation + détection tablette

**Responsable Agent :** DEVon (🔵 DEV)
**Date Début :** 2026-10-01
**Date Fin :** 2026-10-01
**Statut :** ✅ COMPLÉTÉE

---

## 📝 Tâches

### T1.1 - Ajouter la dépendance `expo-screen-orientation`

**Statut :** ✅ COMPLÉTÉE

**Fichiers Modifiés :**
- `package.json` — `"expo-screen-orientation": "~56.0.5"` (via `npx expo install`, version alignée SDK 56)
- `package-lock.json`

**Résultats :** `npm run validate:expo` → 20/20 checks OK. `app.json` non modifié (`"orientation": "portrait"` conservé, aucun plugin requis pour Android).

---

### T1.2 - Service de verrou d'orientation

**Statut :** ✅ COMPLÉTÉE

**Fichiers Modifiés / Créés :**
- `app/services/OrientationLock.service.ts` (créé)
  - `TABLET_MIN_SMALLEST_WIDTH = 600`
  - `isTabletScreen(width, height)` — `min(width, height) >= 600`
  - `lockOrientationForDevice()` — Web → no-op ; téléphone (`Dimensions.get('screen')`) → no-op ; tablette → `lockAsync(OrientationLock.LANDSCAPE)` ; erreur → `Logger.warn`, jamais propagée
- `app/_layout.tsx` (modifié) — appel unique dans un `useEffect([])` de `RootLayout`

---

### T1.3 - Hook `useTabletLayout` + extension `useResponsiveColumns`

**Statut :** ✅ COMPLÉTÉE

**Fichiers Modifiés / Créés :**
- `hooks/useTabletLayout.ts` (créé) — `{ isTablet, isMergedLayout }` ; `isMergedLayout = isTablet && width > height` (fenêtre)
- `hooks/useResponsiveColumns.ts` (modifié) — paramètre optionnel `availableWidth?: number`, prioritaire sur la largeur fenêtre ; sans argument = comportement identique

---

## ✅ Vérifications

| Commande | Résultat |
|---|---|
| `npm run typecheck` | ✅ 0 erreur |
| `npm run lint` | ✅ 0 erreur |
| `npx jest --watchAll=false` | ✅ 42/42 suites, 940/940 tests (aucun test modifié) |
| `npm run validate:expo` | ✅ 20/20 |

## ⚠️ Notes / Décisions

- **Mock Jest global ajouté** dans `jest.setup.ts` pour `expo-screen-orientation` : le preset Jest du projet est `react-native` (pas `jest-expo`), les modules natifs Expo n'y sont pas résolus → `app/__tests__/root-layout.test.tsx` échouait (`Cannot read properties of undefined (reading 'EventEmitter')`). Même pattern que le mock `expo-constants` existant ; aucun fichier `*.test.*` modifié. QALvin pourra surcharger ce mock localement en Phase 3 (T3.1).
- **Splash tablette** : l'activité démarre en portrait (manifeste) puis bascule en paysage au montage JS — brève rotation visible au lancement, acceptée en Gate #1.
- **Rebuild natif requis** (nouvelle dépendance native) : un build EAS / `npm run android` est nécessaire, Expo Go non représentatif pour la tablette.
- Aucun impact runtime téléphone : aucun appel `lockAsync`, hooks non encore consommés par les écrans (Phase 2).

## ➡️ Suite

Phase 2 (navigation fusionnée + écrans 2 colonnes) — DEVon, dépendances satisfaites.
