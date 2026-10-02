# Plan d'Action : Mise en page adaptée tablette (Galaxy Tab S6) — grille responsive par breakpoint

**Document :** `.claude/plans/003_layout-tablette.plan.md`
**Date de création :** 2026-09-15
**Statut :** ⏳ Planifié
**Objectif Prioritaire :** MEDIUM

---

## 🎯 Objectif Global

Adapter l'affichage de domoticz-mobile aux tablettes (référence : Samsung Galaxy Tab S6, 10.5", portrait ~800-830dp / landscape ~1280-1300dp) sans dégrader le rendu mobile existant. Introduire une grille responsive par breakpoint (1/2/3 colonnes selon largeur : compact <600dp, medium 600-839dp, expanded ≥840dp) sur les 3 écrans liste (Favoris, Lumières/Volets, Températures), et rendre paramétrable la taille du cadran `Thermostat` (actuellement figée en dur à 180) pour qu'il s'agrandisse aux breakpoints medium/expanded.

Contraintes non négociables (validées Gate #0 — Option C hybride, cf. rapport ARCos) :
- Zéro nouvelle dépendance (API `useWindowDimensions()` native RN uniquement)
- Zéro nouveau Context
- Navigation et barre d'onglets bas inchangées (hors périmètre)
- `DeviceCard`, `FavoriteCard`, `ViewDomoticzTemperature` : composants synchronisés design system (`.design-sync/NOTES.md`) — logique interne non modifiée, seul le conteneur/grille qui les enveloppe évolue
- Rendu mobile (<600dp) strictement identique à l'existant

Ce plan fait suite à la consultation ARCos (Gate #0) : 3 options comparées, **Option C — hybride** retenue par le développeur. Rapport ARCos complet conservé en référence dans l'historique de conversation ; contenu ADR prêt à l'emploi fourni par ARCos (cf. Phase 5 / T5.2).

---

## 🎯 Phase 1 — Hook breakpoint partagé

### Contexte
- Aucune notion de colonne/largeur adaptative dans le code actuel : tous les composants de rangée sont `width:100%` de leur parent (`app/components/deviceCard.component.tsx:71`, `app/components/favoriteCard.component.tsx:112`, `app/components/thermostat.component.tsx:231`).
- Aucune occurrence de `Dimensions`/`useWindowDimensions`/`isTablet` dans `app/` avant ce plan.
- Phase fondatrice : toutes les phases suivantes consomment ce hook.

### Critères de Réussite
✅ Hook exploitable par les 3 écrans liste sans duplication de logique de seuils
✅ Fonctionne Android (rotation d'écran) et Web (resize live de fenêtre)
✅ Seuils conformes aux classes Material 3 : compact <600dp (1 colonne), medium 600-839dp (2 colonnes), expanded ≥840dp (3 colonnes)
✅ Aucune nouvelle dépendance ajoutée (`package.json` inchangé)
✅ Rendu <600dp strictement identique à l'existant (1 colonne = comportement actuel)

### Tâches (Agent: DEVon (🔵 DEV))

#### T1.1 - Créer le hook `useResponsiveColumns`
- **Fichier(s) :** `hooks/useResponsiveColumns.ts` (nouveau)
- **Couvrir / Implémenter :**
  - Basé sur `useWindowDimensions()` (API RN native)
  - Seuils : `<600` → 1 colonne (`compact`), `600-839` → 2 colonnes (`medium`), `>=840` → 3 colonnes (`expanded`)
  - Retour : `{ columns: number, breakpoint: 'compact' | 'medium' | 'expanded' }`
  - Réagit aux changements de largeur (rotation Android, resize Web) sans reload
- **Acceptation :**
  - ✓ Aucune dépendance ajoutée
  - ✓ Typage strict TypeScript (pas de `any`)
  - ✓ Réutilisable identiquement par T2.1, T2.2, T2.3, T3.1

---

## 🎯 Phase 2 — Grilles écrans liste (Favoris, Lumières/Volets, Températures)

### Contexte
- Les écrans liste actuels font uniquement `push()` dans un tableau `JSX.Element[]` sans `FlatList` ni grille : `app/(tabs)/devices.tabs.tsx:31-40`, `app/(tabs)/temperatures.tab.tsx:21-32`, `app/(tabs)/index.tsx:77-105`.
- Conteneur commun : `ParallaxScrollView` → `styles.content` (`flex:1, padding:10, gap:10`, `components/ParallaxScrollView.tsx:87-92`) puis `tabStyles.titleContainer` (`app/(tabs)/_layout.tsx:162-164`).
- `DeviceCard`, `FavoriteCard`, `ViewDomoticzTemperature` : ne pas modifier leur logique interne (composants synced design system) — uniquement le conteneur qui les enveloppe (`flexDirection:'row', flexWrap:'wrap', gap`, `width: cellWidth` par carte).
- Dépend de Phase 1 (hook `useResponsiveColumns`).
- 3 tâches indépendantes entre elles → parallélisables.

### Critères de Réussite
✅ Portrait tablette (~800dp) : 2 colonnes sur les 3 écrans, aucune carte étirée anormalement
✅ Landscape tablette (~1280dp) : 3 colonnes sur les 3 écrans
✅ Mobile compact (<600dp) : 1 colonne, rendu identique à l'existant (non-régression visuelle)
✅ `FavoriteCard`, `DeviceCard`, `ViewDomoticzTemperature` non modifiés dans leur logique interne (diff limité aux fichiers écrans + éventuels styles de grille)
✅ Message "Seuls les 7 favoris..." (`index.tsx:94-102`) reste `width:'100%'`, hors grille

### Tâches (Agent: DEVon (🔵 DEV))

#### T2.1 - Grille écran Favoris
- **Fichier(s) :** `app/(tabs)/index.tsx`
- **Couvrir / Implémenter :**
  - Remplacer le tableau plat de `FavoriteCard` par une grille pilotée par `useResponsiveColumns` (T1.1)
  - Cellule `width: cellWidth` calculée par carte (colonnes × gap)
  - Ne pas modifier `FavoriteCard` lui-même
  - Message limite "Seuls les 7 favoris..." conservé en `width:'100%'` hors grille
- **Acceptation :**
  - ✓ 1/2/3 colonnes selon breakpoint simulé
  - ✓ Cas liste vide et cas 1 élément ne cassent pas la mise en page

#### T2.2 - Grille écran Lumières/Volets
- **Fichier(s) :** `app/(tabs)/devices.tabs.tsx`
- **Couvrir / Implémenter :**
  - Même traitement de grille pour `ViewDomoticzDevice` / `DeviceCard`
  - Ne pas modifier `DeviceCard` ni `ViewDomoticzDevice`
- **Acceptation :**
  - ✓ 1/2/3 colonnes selon breakpoint simulé
  - ✓ Cas liste vide et cas 1 élément ne cassent pas la mise en page

#### T2.3 - Grille écran Températures
- **Fichier(s) :** `app/(tabs)/temperatures.tab.tsx`
- **Couvrir / Implémenter :**
  - Grille pour la liste `ViewDomoticzTemperature` (composant synced, logique interne non touchée)
  - Le `Thermostat` reste hors grille (pleine largeur ou zone dédiée en tête d'écran) — dimensionnement traité en Phase 3
- **Acceptation :**
  - ✓ 1/2/3 colonnes selon breakpoint simulé pour la liste de capteurs
  - ✓ Zone Thermostat non intégrée à la grille de cartes

---

## 🎯 Phase 3 — Paramétrage du cadran Thermostat

### Contexte
- `DIAL_SIZE = 180` en dur dans `app/components/thermostat.component.tsx:13`.
- Géométrie tactile (`touchToTemp`, `polarToXY`, `CX`/`CY`/`TRACK_R`/`TRACK_W`/`KNOB_R`) actuellement dérivée de cette constante de module — risque réel de désynchronisation tap-cible/rendu si mal recalculée.
- Dépend de Phase 2 (l'écran Températures, T2.3, doit exister pour dériver et passer la prop `dialSize` selon breakpoint).
- `Thermostat` est hors périmètre design-sync (dépendances natives Slider/SVG/gesture-handler) — libre d'évoluer.

### Critères de Réussite
✅ `dialSize?: number` exposé en prop optionnel, défaut 180 (rétrocompatible pour tout appelant existant)
✅ Toutes les constantes géométriques (`CX`, `CY`, `TRACK_R`, `TRACK_W`, `KNOB_R`) recalculées à partir du prop, plus aucune constante de module figée
✅ `touchToTemp` utilise les mêmes valeurs recalculées (pas de désync tap-cible/rendu)
✅ Écran Températures dérive `dialSize` du breakpoint (ex. 180 compact, 240 medium/expanded)
✅ Landscape tablette (~1280dp) : cadran visuellement proportionné à l'écran

### Tâches (Agent: DEVon (🔵 DEV))

#### T3.1 - Rendre `DIAL_SIZE` paramétrable
- **Fichier(s) :** `app/components/thermostat.component.tsx`, `app/(tabs)/temperatures.tab.tsx`
- **Couvrir / Implémenter :**
  - Sortir `dialSize?: number` en prop du composant `Thermostat` (défaut 180)
  - Recalculer `CX`, `CY`, `TRACK_R`, `TRACK_W`, `KNOB_R` à partir du prop (suppression des constantes de module figées)
  - Vérifier `touchToTemp`/`polarToXY` utilisent bien les valeurs recalculées
  - Câbler dans `temperatures.tab.tsx` : `dialSize` dérivé de `useResponsiveColumns` (180 compact, 240 medium/expanded)
- **Acceptation :**
  - ✓ Rendu à `dialSize=180` (défaut) strictement identique à l'existant
  - ✓ Rendu à `dialSize=240` proportionné, sans chevauchement d'éléments
  - ✓ Zone tactile (drag/tap) cohérente avec le rendu visuel aux deux tailles

---

## 🎯 Phase 4 — Tests (non-régression + nouveaux comportements)

### Contexte
- Cibles couverture projet : controllers 100%, services ≥90%, composants ≥70%, modèles ≥85%.
- Hook = utilitaire pur → viser 100% de couverture.
- Risque gestuel réel sur Thermostat (drag/tap) : tests dédiés obligatoires aux deux tailles de cadran.
- Dépend de Phase 3 (code complet des 3 phases précédentes livré et stabilisé).

### Critères de Réussite
✅ `hooks/useResponsiveColumns.ts` : 100% de couverture (mock `useWindowDimensions` pour simuler largeurs compact/medium/expanded)
✅ Rendu grille testé sur les 3 écrans : 1/2/3 colonnes, cas liste vide, cas 1 élément
✅ Non-régression Thermostat : drag/tap corrects à `dialSize=180` ET `dialSize=240`
✅ `npm test -- --watchAll=false --coverage` vert, aucune régression de couverture globale
✅ `npm run typecheck` et `npm run lint` verts

### Tâches (Agent: QALvin (🟢 QUAL))

#### T4.1 - Tests hook `useResponsiveColumns`
- **Fichier(s) :** `hooks/__tests__/useResponsiveColumns.test.ts` (nouveau)
- **Couvrir / Implémenter :**
  - Mock `useWindowDimensions` : largeurs représentatives compact (<600), medium (600-839), expanded (≥840)
  - Valeurs limites exactes des seuils (599/600, 839/840)
- **Acceptation :** ✓ 100% couverture (branches incluses)

#### T4.2 - Tests grilles écrans (Favoris, Lumières/Volets, Températures)
- **Fichier(s) :** tests associés à `app/(tabs)/index.tsx`, `app/(tabs)/devices.tabs.tsx`, `app/(tabs)/temperatures.tab.tsx`
- **Couvrir / Implémenter :**
  - Rendu 1/2/3 colonnes par écran (mock hook ou `useWindowDimensions`)
  - Cas liste vide, cas 1 élément
  - Non-régression : message limite favoris toujours hors grille
- **Acceptation :** ✓ Composants ≥70% couverture (cible projet), aucun cas non couvert parmi ceux listés

#### T4.3 - Tests non-régression Thermostat
- **Fichier(s) :** tests associés à `app/components/thermostat.component.tsx`
- **Couvrir / Implémenter :**
  - Drag/tap à `dialSize=180` (défaut, rétrocompatibilité)
  - Drag/tap à `dialSize=240` (medium/expanded)
  - Vérifier cohérence géométrique (`touchToTemp` aligné au rendu) aux deux tailles
- **Acceptation :** ✓ Aucune régression gestuelle, cas limites (bords du cadran) couverts

---

## 🎯 Phase 5 — Documentation

### Contexte
- Documentation architecture doit refléter la nouvelle capacité responsive.
- ADR déjà rédigé (contenu prêt à l'emploi fourni par ARCos) — DOCly n'a qu'à le poser au bon numéro séquentiel.
- Dépend de Phase 4 (tests validés).
- Prochain numéro ADR disponible constaté dans `docs/adr/` au moment de la création de ce plan : **013**.

### Critères de Réussite
✅ Section "Responsive / Breakpoints" ajoutée à `docs/ARCHITECTURE.md`
✅ ADR créé à `docs/adr/013-adaptation-responsive-tablette-grille-breakpoint.md` (contenu ARCos, numéro vérifié au moment de l'exécution)
✅ `.claude/plans/README.md` mis à jour (statut plan 003)
✅ Documentation cohérente avec le code livré (pas de dérive)

### Tâches (Agent: DOCly (🟣 DOC))

#### T5.1 - Section Responsive dans ARCHITECTURE.md
- **Fichier(s) :** `docs/ARCHITECTURE.md`
- **Couvrir / Implémenter :**
  - Décrire `useResponsiveColumns`, seuils, écrans concernés
  - Décrire paramétrage `dialSize` du Thermostat
  - Préciser périmètre hors-scope (navigation/barre d'onglets inchangées)
- **Acceptation :** ✓ Section présente, cohérente avec le reste du document

#### T5.2 - Créer l'ADR
- **Fichier(s) :** `docs/adr/013-adaptation-responsive-tablette-grille-breakpoint.md` (numéro à revérifier avant création — prendre le prochain disponible dans `docs/adr/`)
- **Couvrir / Implémenter :**
  - Reprendre tel quel le contenu ADR fourni par ARCos (Contexte / Décision / Alternatives considérées / Conséquences)
- **Acceptation :** ✓ ADR créé, numéro séquentiel correct, contenu fidèle à la décision validée Gate #0

#### T5.3 - Mettre à jour l'index des plans
- **Fichier(s) :** `.claude/plans/README.md`
- **Couvrir / Implémenter :**
  - Déplacer le plan 003 vers "Plans archivés" avec statut ✅ Complété à la clôture (Gate #4)
- **Acceptation :** ✓ Index synchronisé avec le statut réel du plan

---

## 📊 Résumé des Tâches par Agent

### DEVon (🔵 DEV) Agent
- T1.1 : Hook `useResponsiveColumns`
- T2.1 à T2.3 : Grilles des 3 écrans liste
- T3.1 : Paramétrage `dialSize` Thermostat
- **Livrable :** Hook responsive + 3 écrans en grille + Thermostat redimensionnable, code compilant, `npm run typecheck` / `npm run lint` verts
- **Durée estimée :** 3-4 jours

### QALvin (🟢 QUAL) Agent
- T4.1 : Tests hook (100% couverture)
- T4.2 : Tests grilles écrans (1/2/3 colonnes, vide, 1 élément)
- T4.3 : Tests non-régression Thermostat (drag/tap aux deux tailles)
- **Livrable :** Suite de tests verte, couverture non dégradée, rapport de couverture
- **Durée estimée :** 2 jours

### DOCly (🟣 DOC) Agent
- T5.1 : Section Responsive dans `docs/ARCHITECTURE.md`
- T5.2 : ADR `docs/adr/013-...md`
- T5.3 : Mise à jour `.claude/plans/README.md`
- **Livrable :** Documentation à jour, ADR posé, index des plans synchronisé
- **Durée estimée :** 0,5 jour

---

## 📍 Dépendances entre Phases

```
Phase 1 (Hook useResponsiveColumns)
    ↓
Phase 2 (Grilles Favoris / Lumières-Volets / Températures) ← [Phase 1 doit être ✅]
   (T2.1, T2.2, T2.3 parallélisables entre elles)
    ↓
Phase 3 (Paramétrage dialSize Thermostat) ← [Phase 2 doit être ✅, notamment T2.3]
    ↓
    Gate #2 (validation code avant tests)
    ↓
Phase 4 (Tests) ← [Phase 3 doit être ✅]
    ↓
    Gate #3 (validation tests avant doc)
    ↓
Phase 5 (Documentation) ← [Phase 4 doit être ✅]
    ↓
    Gate #4 (clôture initiative)
```

---

## ✅ Critères de Succès Globaux

1. **Portrait tablette (~800dp)** : 2 colonnes sur les 3 écrans liste, aucune carte étirée anormalement (Phases 2-3)
2. **Landscape tablette (~1280dp)** : 3 colonnes, cadran Thermostat visuellement proportionné (Phases 2-3)
3. **Mobile compact (<600dp)** : rendu strictement identique à l'existant, aucune régression (Phases 1-3)
4. **Zéro nouvelle dépendance, zéro nouveau Context** (toutes phases)
5. **Composants design-sync non modifiés dans leur logique interne** (`DeviceCard`, `FavoriteCard`, `ViewDomoticzTemperature`) (Phase 2)
6. **`npm run typecheck` / `npm run lint` / `npm test -- --watchAll=false --coverage` verts**, couverture non dégradée (controllers 100%, services ≥90%, composants ≥70%, modèles ≥85%) (Phase 4)
7. **Documentation + ADR à jour** (Phase 5)

---

## 🚀 Plan d'Exécution

1. **Gate #1** : validation du présent plan par le développeur humain — **prérequis avant tout lancement d'implémentation**
2. **Après Gate #1** : lancer Phase 1 (DEVon — T1.1)
3. **Après Phase 1 ✅** : lancer Phase 2 (DEVon — T2.1, T2.2, T2.3, parallélisables)
4. **Après Phase 2 ✅** : lancer Phase 3 (DEVon — T3.1)
5. **Après Phase 3 ✅** : **Gate #2** — validation code par développeur humain avant tests
6. **Après Gate #2** : lancer Phase 4 (QALvin — T4.1, T4.2, T4.3)
7. **Après Phase 4 ✅** : **Gate #3** — validation tests par développeur humain avant documentation
8. **Après Gate #3** : lancer Phase 5 (DOCly — T5.1, T5.2, T5.3)
9. **Après Phase 5 ✅** : **Gate #4** — validation documentation et clôture de l'initiative (statut plan → ✅ Complété)

**Triggers pour démarrer une phase :**
- Tous les rapports de la phase précédente ✅ COMPLÉTÉE
- Tous les critères de réussite atteints
- Pas de bloqueurs signalés
- Gate humain correspondant franchi (Gate #1 avant Phase 1, Gate #2 avant Phase 4, Gate #3 avant Phase 5, Gate #4 après Phase 5)

---

**Fin du Plan d'Action 003**
