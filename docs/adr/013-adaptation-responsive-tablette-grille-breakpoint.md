# ADR 013 — Adaptation responsive pour tablette (grille par breakpoint)

- **Statut** : Accepté
- **Date** : 2026-09-15
- **Décideurs** : Équipe domoticz-mobile
- **Portée** : `hooks/useResponsiveColumns.ts` (nouveau), `app/(tabs)/index.tsx`, `app/(tabs)/devices.tabs.tsx`, `app/(tabs)/temperatures.tab.tsx`, `app/components/thermostat.component.tsx`

## Contexte

L'application était conçue exclusivement pour un affichage mobile portrait (confirmé : aucune occurrence de `Dimensions`/`useWindowDimensions`/`isTablet`/`Platform.isPad` dans `app/` avant cette décision). Tous les composants de rangée (`DeviceCard`, `FavoriteCard`, `ViewDomoticzTemperature`, `Thermostat`) sont en largeur 100% et empilés verticalement dans un simple tableau `JSX.Element[]` (`app/(tabs)/devices.tabs.tsx`, `temperatures.tab.tsx`, `index.tsx`). Besoin exprimé : usage sur tablette Samsung Galaxy Tab S6 (10.5", 16:10, ~800-830dp portrait / ~1280-1300dp landscape), en conservant un rendu mobile inchangé.

## Décision

Introduction d'un hook `useResponsiveColumns()` basé sur `useWindowDimensions()` (API React Native native, aucune dépendance ajoutée), avec seuils alignés sur les classes de taille Material 3 : compact < 600dp (1 colonne, inchangé), medium 600-839dp (2 colonnes), expanded ≥ 840dp (3 colonnes). Les écrans liste (Favoris, Lumières/Volets, Températures) enveloppent leurs cartes dans une grille `flexWrap` pilotée par ce hook. Le cadran du Thermostat (`DIAL_SIZE`, jusqu'ici constante figée à 180 dans `thermostat.component.tsx`) devient paramétrable via un prop dérivé du même breakpoint.

## Alternatives considérées

### Option A — Layout maître-détail permanent (NavigationRail + panneau détail landscape)

- **Description** : refonte de la navigation vers un layout maître-détail permanent en landscape tablette.
- **Inconvénients** : impliquait une refonte de `app/(tabs)/_layout.tsx` (navigation actuellement un `switch` mono-écran avec `React.lazy`/`Suspense`), potentiellement un nouveau Context de sélection (soumis à validation selon les conventions du projet).
- **Risques** : effort et risque jugés disproportionnés par rapport au besoin exprimé.
- **Décision** : écartée pour cette itération. Piste conservée pour une itération ultérieure si un usage tablette plus poussé est souhaité.

### Option B — Aucun changement, redimensionnement natif RN

- **Description** : ne rien adapter, laisser les cartes en largeur 100% sur tablette.
- **Inconvénients** : cartes 100% de large sur ~800-1300dp produisent des lignes anormalement étirées, mauvaise UX.
- **Décision** : écartée.

### Option C — Grille responsive par breakpoint, sans nouveau Context (retenue ✅)

- **Description** : décrite ci-dessus (§ Décision).
- **Avantages** : zéro nouvelle dépendance, zéro nouveau Context, navigation et barre d'onglets bas inchangées ; composants design-sync (`DeviceCard`, `FavoriteCard`, `ViewDomoticzTemperature`) non modifiés dans leur logique interne.
- **Effort** : Faible à Moyen.

## Conséquences

### Positives

- Aucune nouvelle dépendance, aucun nouveau Context, navigation et barre d'onglets bas inchangées.
- `DeviceCard`, `FavoriteCard`, `ViewDomoticzTemperature` non modifiés dans leur logique interne (composants purs, largeur pilotée par le parent) — préserve l'alignement avec le design system synchronisé (`.design-sync/NOTES.md`).
- Rendu mobile (< 600dp) garanti identique à l'existant.

### Négatives / compromis

- Le composant `Thermostat` (hors périmètre design-sync) voit sa géométrie tactile paramétrée ; tests dédiés requis pour non-régression du drag/tap (couverts en Phase 4, cf. `app/components/__tests__/thermostat.component.test.ts`).
- Le mode maître-détail (Option A) reste une piste non close, à réévaluer si le besoin tablette évolue.

## Références

- Plan d'Action : [`.claude/plans/003_layout-tablette.plan.md`](../../.claude/plans/003_layout-tablette.plan.md)
- `hooks/useResponsiveColumns.ts`
- `app/components/thermostat.component.tsx`
- [docs/ARCHITECTURE.md § Responsive / Breakpoints](../ARCHITECTURE.md#-responsive--breakpoints)
