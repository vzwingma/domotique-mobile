# Plan d'Action : Tablette en paysage — onglets fusionnés sur 2 colonnes

**Document :** `.claude/plans/004_tablette-paysage-onglets-fusionnes.plan.md`
**Date de création :** 2026-10-01
**Statut :** ✅ Complété (2026-10-01)
**Objectif Prioritaire :** MEDIUM

---

## 🎯 Objectif Global

Suite du plan 003 (grille responsive, validée). Sur tablette (référence Samsung Galaxy Tab S6, ~1280×800dp en paysage), l'application doit s'afficher **verrouillée en paysage**, et les onglets sont regroupés deux à deux :
- **Favoris** : inchangé (grille 3 colonnes existante en expanded).
- **Lumières + Volets** : un seul écran, 2 colonnes côte à côte (Lumières | Volets), ascenseur vertical unique (page).
- **Températures + Maison** : même principe (Températures | Maison).
- Barre d'onglets bas : 5 boutons conservés ; les boutons d'un même groupe sont actifs/inactifs **ensemble**.

Décisions Gate #0 (développeur, 2026-10-01) :
- **Orientation** : verrou runtime via `expo-screen-orientation` (lib Expo officielle) — tablette → `LANDSCAPE`, téléphone → inchangé (`app.json` reste `"orientation": "portrait"`, aucun appel de verrou côté téléphone). Nouvelle dépendance native ⇒ rebuild EAS + ADR-014.
- **Défilement** : ascenseur unique de page (`ParallaxScrollView` existant, pull-to-refresh conservé) — pas de scroll par colonne.

Contraintes non négociables :
- Rendu téléphone (`min(largeur, hauteur) < 600dp`) **strictement identique** à l'existant (navigation, titres, grilles, orientation).
- Web : pas de verrou d'orientation (API non supportée hors plein écran) ; layout fusionné si la fenêtre satisfait la règle tablette paysage.
- Composants synchronisés design system (`DeviceCard`, `FavoriteCard`, `ViewDomoticzTemperature`, `.design-sync/NOTES.md`) non modifiés.
- Zéro nouveau Context.

### Règles de détection

| Notion | Règle | Source |
|---|---|---|
| Tablette | `min(screen.width, screen.height) ≥ 600dp` (convention Android sw600dp, indépendante de l'orientation) | `Dimensions.get('screen')` |
| Layout fusionné | tablette **et** `window.width > window.height` | `useWindowDimensions()` |
| Grille d'une colonne fusionnée | `useResponsiveColumns(largeurDisponible)` avec largeur ≈ demi-écran (~620dp → `medium` → 2 colonnes, cadran 240) | hook existant étendu |

---

## 🎯 Phase 1 — Socle : orientation + détection tablette

### Contexte
- `app.json` impose `"orientation": "portrait"` pour tous les appareils ; aucune distinction téléphone/tablette n'existe (`hooks/useResponsiveColumns.ts` ne raisonne que sur la largeur fenêtre).
- `setRequestedOrientation` (runtime) surcharge l'orientation du manifeste Android : garder `portrait` dans `app.json` protège le téléphone, seul la tablette est re-verrouillée en paysage au démarrage.

### Critères de Réussite
- ✅ `expo-screen-orientation` installé via `npx expo install` (version alignée SDK 56), `npm run validate:expo` vert
- ✅ Tablette Android verrouillée paysage au démarrage ; téléphone : aucun appel `lockAsync`
- ✅ Web : aucun appel `lockAsync`
- ✅ Hook `useTabletLayout()` exposant `{ isTablet, isMergedLayout }`
- ✅ `useResponsiveColumns(availableWidth?)` rétro-compatible (sans argument = comportement actuel)

### Tâches (Agent: DEVon (🔵 DEV))

#### T1.1 - Ajouter la dépendance `expo-screen-orientation`
- **Agent :** DEVon
- **Fichier(s) :** `package.json`, `package-lock.json`
- **Implémenter :** `npx expo install expo-screen-orientation`
- **Acceptation :** `npm run validate:expo` OK

#### T1.2 - Service de verrou d'orientation
- **Agent :** DEVon
- **Fichier(s) :** `app/services/OrientationLock.service.ts` (créé), `app/_layout.tsx` (modifié)
- **Implémenter :**
  - `isTabletScreen(width, height): boolean` (pure, seuil 600)
  - `lockOrientationForDevice(): Promise<void>` — si `Platform.OS !== 'web'` et tablette (`Dimensions.get('screen')`) → `ScreenOrientation.lockAsync(OrientationLock.LANDSCAPE)` ; erreurs loguées via `Logger`, jamais propagées
  - Appel unique au montage de `RootLayout`
- **Acceptation :** compile, lint OK

#### T1.3 - Hook `useTabletLayout` + extension `useResponsiveColumns`
- **Agent :** DEVon
- **Fichier(s) :** `hooks/useTabletLayout.ts` (créé), `hooks/useResponsiveColumns.ts` (modifié)
- **Implémenter :**
  - `useTabletLayout(): { isTablet, isMergedLayout }` basé sur `useWindowDimensions()` + `isTabletScreen`
  - `useResponsiveColumns(availableWidth?: number)` : largeur fournie prioritaire sur largeur fenêtre
- **Acceptation :** appels existants sans argument inchangés

---

## 🎯 Phase 2 — Navigation fusionnée + écrans 2 colonnes

### Contexte
- `app/(tabs)/_layout.tsx` : un état `tab` unique, `showPanel(tab)` rend un écran, 5 `TabBarItems` comparent `activeTab === thisTab`.
- Titre/icône header dérivés de `tab` (`getHeaderIcon`, `tab.toString()`).

### Critères de Réussite
- ✅ En layout fusionné : clic Lumières **ou** Volets → écran 2 colonnes Lumières | Volets, les 2 boutons actifs ; idem Températures | Maison
- ✅ Favoris inchangé
- ✅ Titre header fusionné : « Lumières & Volets » / « Températures & Maison »
- ✅ Hors layout fusionné : comportement actuel strict (5 écrans distincts)
- ✅ Chaque colonne affiche sa grille calculée sur sa demi-largeur

### Tâches (Agent: DEVon (🔵 DEV))

#### T2.1 - Règles de groupes d'onglets
- **Agent :** DEVon
- **Fichier(s) :** `app/services/TabGroups.service.ts` (créé)
- **Implémenter :** fonctions pures
  - `getMergedTabGroup(tab)` → `[Tabs, Tabs] | null` (`[LUMIERES, VOLETS]`, `[TEMPERATURES, MAISON]`)
  - `isTabActive(activeTab, thisTab, isMergedLayout)`
  - `getTabTitle(tab, isMergedLayout)`
- **Acceptation :** aucune dépendance React

#### T2.2 - Barre d'onglets : activation groupée
- **Agent :** DEVon
- **Fichier(s) :** `components/navigation/TabBarItem.tsx`
- **Implémenter :** prop optionnelle `isActive?: boolean` (défaut `activeTab === thisTab`) pilotant couleur + icône
- **Acceptation :** rendu par défaut inchangé (snapshots existants verts)

#### T2.3 - Composant écran 2 colonnes
- **Agent :** DEVon
- **Fichier(s) :** `app/components/mergedTabs.component.tsx` (créé)
- **Implémenter :** `row`, 2 colonnes `flex:1`, gap 10, `alignItems:'flex-start'`, sous-titre par colonne (icône + libellé onglet) ; contenu fourni par le layout
- **Acceptation :** aucune hauteur fixe (ascenseur = page)

#### T2.4 - Écrans acceptant une largeur disponible
- **Agent :** DEVon
- **Fichier(s) :** `app/(tabs)/devices.tabs.tsx`, `app/(tabs)/temperatures.tab.tsx`
- **Implémenter :** prop optionnelle `availableWidth?: number` transmise à `useResponsiveColumns`
- **Acceptation :** sans prop = comportement actuel

#### T2.5 - Intégration `_layout.tsx`
- **Agent :** DEVon
- **Fichier(s) :** `app/(tabs)/_layout.tsx`
- **Implémenter :** `useTabletLayout()`, `showPanel(tab, isMergedLayout, columnWidth)`, `isActive` groupé sur `TabBarItems`, titre via `getTabTitle`, icône header = 1er onglet du groupe
- **Acceptation :** typecheck + lint OK ; vérif visuelle web (fenêtre ≥ 600dp de haut, paysage) + téléphone (375×812) inchangé

---

## 🎯 Phase 3 — Tests

### Contexte
- Tests existants : `hooks/__tests__/useResponsiveColumns.test.ts`, `components/__tests__/TabBarItem.test.tsx`, `app/(tabs)/__tests__/*.test.tsx`. Pas de test de `(tabs)/_layout.tsx`.

### Critères de Réussite
- ✅ Tous tests existants verts (non-régression téléphone)
- ✅ Services créés ≥ 90 % couverture, hooks ≥ 85 %, composants ≥ 70 %
- ✅ Seuil CI global (ADR-009) respecté

### Tâches (Agent: QALvin (🟢 QUAL))

#### T3.1 - `OrientationLock.service` : tablette/téléphone/web, échec `lockAsync` non propagé
#### T3.2 - `TabGroups.service` : groupes, activation, titres (fusionné / non fusionné, Favoris)
#### T3.3 - `useTabletLayout` + `useResponsiveColumns(availableWidth)` : seuils 600, portrait/paysage
#### T3.4 - `TabBarItem` (`isActive`), `mergedTabs.component`, `devices`/`temperatures` avec `availableWidth`
- **Fichier(s) :** `app/services/__tests__/`, `hooks/__tests__/`, `components/__tests__/`, `app/components/__tests__/`, `app/(tabs)/__tests__/`
- **Acceptation :** `npm test -- --watchAll=false --coverage` vert

---

## 🎯 Phase 4 — Documentation

### Critères de Réussite
- ✅ ADR-014 créé (verrou orientation tablette + onglets fusionnés, alternatives : rotation libre, sans dépendance, scroll par colonne)
- ✅ `docs/ARCHITECTURE.md` § Responsive mis à jour (règle tablette, layout fusionné, groupes)
- ✅ Index plans à jour, plan clôturé

### Tâches (Agent: DOCly (🟣 DOC))

#### T4.1 - `docs/adr/014-tablette-paysage-onglets-fusionnes.md`
#### T4.2 - `docs/ARCHITECTURE.md` (§ Responsive, arborescence, écrans)
#### T4.3 - `docs/DEPLOIEMENT.md` : note rebuild natif requis (nouvelle dépendance native)

---

## 📊 Résumé des Tâches par Agent

| Agent | Tâches | Livrables |
|---|---|---|
| DEVon (🔵) | T1.1-T1.3, T2.1-T2.5 | Dépendance, 2 services, 1 hook, 1 composant, 4 fichiers modifiés |
| QALvin (🟢) | T3.1-T3.4 | Tests unitaires + couverture |
| DOCly (🟣) | T4.1-T4.3 | ADR-014, ARCHITECTURE, DEPLOIEMENT |

---

## 📍 Dépendances entre Phases

```
Phase 1 (socle) ──► Phase 2 (navigation fusionnée) ──► Gate #2 ──┬─► Phase 3 (tests)
                                                                └─► Phase 4 (doc)   (parallélisable)
```

---

## ✅ Critères de Succès Globaux

1. Tablette Android verrouillée paysage, onglets fusionnés conformes à l'attendu
2. Téléphone : rendu + orientation strictement identiques (tests existants verts sans modification)
3. `npm run typecheck`, `npm run lint`, `npm run validate:expo` verts
4. Couverture cible respectée, gate CI OK
5. ADR-014 + docs à jour

---

## 🚀 Plan d'Exécution

1. Gate #1 : validation de ce plan
2. Phases 1+2 (DEVon) → rapports `004_reports/PHASE_1/2_COMPLETION_REPORT.md` → Gate #2 (validation visuelle web + build tablette)
3. Phases 3+4 en parallèle → Gate #3/#4 → clôture
