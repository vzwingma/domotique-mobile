# ADR 014 — Tablette verrouillée en paysage et onglets fusionnés sur 2 colonnes

- **Statut** : Accepté
- **Date** : 2026-10-01
- **Décideurs** : Équipe domoticz-mobile
- **Portée** : `expo-screen-orientation` (nouvelle dépendance native), `app/services/OrientationLock.service.ts` (nouveau), `app/services/TabGroups.service.ts` (nouveau), `hooks/useTabletLayout.ts` (nouveau), `app/components/mergedTabs.component.tsx` (nouveau), `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `components/navigation/TabBarItem.tsx`, `hooks/useResponsiveColumns.ts`, `app/(tabs)/devices.tabs.tsx`, `app/(tabs)/temperatures.tab.tsx`
- **Complète** : [ADR-013](./013-adaptation-responsive-tablette-grille-breakpoint.md) (grille responsive par breakpoint)

## Contexte

L'ADR-013 a introduit une grille responsive (1/2/3 colonnes) sans toucher à la navigation. À l'usage sur Samsung Galaxy Tab S6, le développeur souhaite :
- une tablette **en paysage** (l'app est déclarée `"orientation": "portrait"` dans `app.json`, pour tous les appareils) ;
- les onglets **Lumières + Volets** et **Températures + Maison** fusionnés, chaque paire affichée côte à côte sur 2 colonnes, avec un ascenseur vertical si besoin ;
- les boutons d'un même groupe actifs/inactifs **ensemble** dans la barre d'onglets ;
- Favoris inchangé ;
- un rendu **téléphone strictement inchangé** (orientation, navigation, écrans).

L'orientation Expo (`app.json` → manifeste Android `screenOrientation`) est globale : elle ne distingue pas téléphone et tablette.

## Décision

1. **Verrou d'orientation à l'exécution, tablette uniquement** via `expo-screen-orientation` (bibliothèque Expo officielle, version alignée SDK 56). `app.json` conserve `"orientation": "portrait"` (protège le téléphone dès le lancement natif). Au montage de `RootLayout`, `lockOrientationForDevice()` appelle `lockAsync(OrientationLock.LANDSCAPE)` si l'écran est une tablette ; aucun appel sur téléphone ni sur Web (API non supportée hors plein écran). Les erreurs sont loguées, jamais propagées.
2. **Détection tablette** par le plus petit côté d'écran ≥ 600dp (convention Android `sw600dp`, indépendante de l'orientation) — `isTabletScreen(width, height)`.
3. **Layout fusionné** (`useTabletLayout().isMergedLayout`) = tablette **et** fenêtre en paysage (`width > height`). En portrait (verrou refusé, Web fenêtre haute), comportement ADR-013.
4. **Groupes d'onglets** déclarés dans `TabGroups.service.ts` (`[Lumières, Volets]`, `[Températures, Maison]`), fonctions pures : groupe d'un onglet, état actif d'un bouton, titre de header (« Lumières & Volets »). La barre d'onglets conserve ses **5 boutons** ; `TabBarItems` reçoit une prop optionnelle `isActive`.
5. **Écran fusionné** `MergedTabs` : 2 colonnes `flex:1` réutilisant les écrans existants sans modification de leur logique. Chaque colonne calcule sa grille sur sa **demi-largeur** (`useResponsiveColumns(availableWidth)` ; Tab S6 paysage → ~625dp → `medium` → 2 cartes par ligne, cadran Thermostat 240).
6. **Défilement unique de page** (`ParallaxScrollView` existant, pull-to-refresh conservé) — aucune hauteur fixe dans les colonnes.

## Alternatives considérées

### Orientation

| Option | Description | Décision |
|---|---|---|
| **A — Verrou paysage tablette (retenue ✅)** | `expo-screen-orientation`, tablette → `LANDSCAPE`, téléphone non verrouillé (orientation manifeste conservée) | Conforme au besoin, téléphone protégé dès le lancement natif |
| B — Rotation libre tablette | Même lib ; tablette libre (portrait = ADR-013, paysage = fusionné) | Écartée : besoin explicite « paysage » ; reste trivialement atteignable (retirer l'appel `lockAsync`) |
| C — Sans dépendance | Fusion déclenchée seulement si l'écran est déjà en paysage | Écartée : manifeste `portrait` → la Tab S6 (Android 12) resterait en portrait, fonctionnalité inatteignable |
| D — `app.json` `"orientation": "default"` | Rotation libre pour tous | Écartée : le téléphone pivoterait aussi (contrainte « téléphone inchangé » violée) |

### Défilement

| Option | Décision |
|---|---|
| **Ascenseur unique de page (retenue ✅)** | Simple, conserve header parallax et pull-to-refresh |
| Ascenseur par colonne | Écartée : header parallax et pull-to-refresh à revoir, complexité accrue pour un gain limité |

### Navigation

Réduire la barre à 3 boutons en paysage a été écarté : le besoin demande explicitement que les boutons existants soient sélectionnés ensemble ; conserver les 5 boutons garde une barre identique au téléphone.

## Conséquences

### Positives

- Téléphone : aucun appel de verrou, `isMergedLayout` toujours `false` → navigation, titres, grilles strictement identiques (tests existants verts sans modification).
- Écrans existants réutilisés tels quels (seule une prop optionnelle `availableWidth`) ; composants design-sync non modifiés.
- Logique de groupes isolée dans un service pur, testé à 100 %.
- Zéro nouveau Context.

### Négatives / compromis

- **Nouvelle dépendance native** : les APK / dev-clients existants doivent être reconstruits (EAS / `npm run android`) ; Expo Go embarque déjà le module. Jest (preset `react-native`) nécessite un mock global (`jest.setup.ts`).
- **Rotation visible au lancement sur tablette** : l'activité démarre en portrait (manifeste) puis bascule en paysage au montage JS.
- Android 16+ (API 36) ignore les restrictions d'orientation sur grands écrans pour les apps ciblant SDK 36 : sur une future tablette Android 16, l'utilisateur pourra pivoter librement ; le layout s'adapte (fusionné en paysage, ADR-013 en portrait). Sans impact sur la Tab S6 (Android 12).
- Sur tablette, toucher le second bouton d'un groupe déjà affiché déclenche un rafraîchissement (même comportement qu'un appui sur l'onglet courant, cooldown 5 s), sans changement d'écran.

## Références

- Plan d'Action : [`.claude/plans/004_tablette-paysage-onglets-fusionnes.plan.md`](../../.claude/plans/004_tablette-paysage-onglets-fusionnes.plan.md)
- [ADR-013](./013-adaptation-responsive-tablette-grille-breakpoint.md)
- [docs/ARCHITECTURE.md § Responsive / Breakpoints](../ARCHITECTURE.md#-responsive--breakpoints)
- [docs/DEPLOIEMENT.md](../DEPLOIEMENT.md)
