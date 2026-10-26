# Phase 2 : Navigation fusionnée + écrans 2 colonnes

**Responsable Agent :** DEVon (🔵 DEV)
**Date Début :** 2026-10-01
**Date Fin :** 2026-10-01
**Statut :** ✅ COMPLÉTÉE (vérification visuelle à faire par le développeur — Gate #2)

---

## 📝 Tâches

### T2.1 - Règles de groupes d'onglets

**Statut :** ✅ COMPLÉTÉE
**Fichier créé :** `app/services/TabGroups.service.ts` (fonctions pures, aucune dépendance React)
- `MERGED_TAB_GROUPS` : `[LUMIERES, VOLETS]`, `[TEMPERATURES, MAISON]` (ordre = colonnes gauche/droite)
- `getMergedTabGroup(tab)` → groupe ou `null` (Favoris)
- `isTabActive(activeTab, thisTab, isMergedLayout)` → hors layout fusionné : `activeTab === thisTab` strict
- `getTabTitle(tab, isMergedLayout)` → « Lumières & Volets » / « Températures & Maison », sinon libellé onglet

### T2.2 - Barre d'onglets : activation groupée

**Statut :** ✅ COMPLÉTÉE
**Fichier modifié :** `components/navigation/TabBarItem.tsx`
- Prop optionnelle `isActive?: boolean`, défaut `activeTab === thisTab` → pilote couleur + variante d'icône (outline/pleine)
- Rendu par défaut inchangé (snapshots existants verts)

### T2.3 - Composant écran 2 colonnes

**Statut :** ✅ COMPLÉTÉE
**Fichier créé :** `app/components/mergedTabs.component.tsx`
- `MergedTabs` : `row`, 2 colonnes `flex:1` (`minWidth:0`), gap 10, `alignItems:'flex-start'`, sous-titre par colonne (icône header de l'onglet + libellé), `testID` `merged-column-<onglet>`
- Aucune hauteur fixe → ascenseur unique porté par `ParallaxScrollView` (pull-to-refresh conservé)
- `getMergedColumnWidth(windowWidth, contentPadding)` = `(largeur − 2×padding − gap) / 2` (Tab S6 paysage 1280dp → 625dp → breakpoint `medium` → 2 colonnes de cartes, cadran 240)

### T2.4 - Écrans acceptant une largeur disponible

**Statut :** ✅ COMPLÉTÉE
**Fichiers modifiés :** `app/(tabs)/devices.tabs.tsx`, `app/(tabs)/temperatures.tab.tsx`
- Prop optionnelle `availableWidth?: number` → `useResponsiveColumns(availableWidth)` ; sans prop = comportement actuel
- `parametrages.tab.tsx` non modifié (pas de grille, sections `width:100%` s'adaptent à la colonne)

### T2.5 - Intégration `_layout.tsx`

**Statut :** ✅ COMPLÉTÉE
**Fichier modifié :** `app/(tabs)/_layout.tsx`
- `useTabletLayout()` + `useWindowDimensions()`
- `showPanel(tab, isMergedLayout, columnWidth)` : si layout fusionné et onglet groupé → `MergedTabs` (2 écrans lazy dans un même `Suspense`), sinon écran seul (inchangé)
- `renderTabScreen(tab, availableWidth?)` extrait (switch d'écrans, sans `Suspense`)
- Barre d'onglets : `TAB_BAR_ORDER.map(...)` avec `isActive={isTabActive(...)}` — ordre des 5 boutons inchangé
- Header : titre `getTabTitle(...)`, icône = 1er onglet du groupe en layout fusionné

---

## ✅ Vérifications

| Commande | Résultat |
|---|---|
| `npm run typecheck` | ✅ 0 erreur |
| `npm run lint` | ✅ 0 erreur / 0 warning |
| `npx jest --watchAll=false` | ✅ 42/42 suites, 940/940 tests (aucun test modifié) |
| Vérification visuelle web | ⏭️ Non faite (pas de `.env` dans le worktree ; choix développeur : vérification manuelle) |

## ⚠️ Notes / Décisions

- **Comportement téléphone** : `isMergedLayout` toujours `false` (plus petit côté < 600dp) → `isTabActive` = égalité stricte, `getTabTitle` = libellé, `showPanel` = écran seul, `availableWidth` non transmis → rendu strictement identique.
- **Clic sur l'autre bouton d'un groupe déjà affiché** (ex. Volets alors que Lumières+Volets visible) : déclenche le rafraîchissement `tab-switch` comme un clic sur l'onglet courant aujourd'hui (cooldown 5s conservé) — pas de changement d'écran visible.
- **Tablette en portrait** (ex. Web fenêtre haute, ou verrou ignoré) : layout non fusionné, comportement plan 003 (grilles 2 colonnes medium).
- `Suspense` enveloppe désormais aussi le cas `404` (inatteignable en pratique) — sans effet.

## 🧪 À couvrir en Phase 3 (QALvin)

- `TabGroups.service` (100 %), `mergedTabs.component` (rendu 2 colonnes, `getMergedColumnWidth`), `TabBarItem` (`isActive` surchargé), `devices`/`temperatures` avec `availableWidth` (dont `dialSize` 240 à 625dp)
- `(tabs)/_layout.tsx` non testé actuellement (hors scope plan 003) — test de layout fusionné optionnel

## ➡️ Suite

Gate #2 : vérification développeur (téléphone inchangé + tablette paysage), puis Phases 3 (QALvin) et 4 (DOCly) parallélisables.
