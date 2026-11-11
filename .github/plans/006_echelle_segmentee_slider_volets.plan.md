# Plan d'Action 006 — Échelle segmentée du slider des volets (previewV)

**Document :** `.github/plans/006_echelle_segmentee_slider_volets.plan.md`
**Date de création :** 2026-11-10
**Statut :** ✅ Complété
**Objectif Prioritaire :** MEDIUM
**Issue :** [#330](https://github.com/vzwingma/domotique-mobile/issues/330)
**ADR associé :** `docs/adr/015-echelle-segmentee-slider-volets.md` — `Proposée` → `Acceptée` au Gate #1
**Rapports :** `.github/plans/006_reports/`

---

## 🎯 Objectif Global

> **Ajustement 👤 du 2026-11-11 :** recette QA confirmée correcte.
> Retirer les graduations et étiquettes visibles sous le slider ; conserver
> l'échelle segmentée, le périmètre previewV/volets et l'accessibilité en pourcentages.
> Cet ajustement remplace les exigences de graduations et de calibration
> `TRACK_INSET` dans les tâches ci-dessous.

Permettre un réglage fin des volets entre 0 % et 10 % tout en gardant un accès rapide à 0 / 50 / 100 %, via un slider à échelle segmentée non-linéaire.

Outcomes mesurables :
- Course du slider en 3 tiers : 0→10 % (0 → 1/3), 10→50 % (1/3 → 2/3), 50→100 % (2/3 → 1). 60 % ≈ 73 % de la course.
- Graduations et étiquettes `0 %`, `10 %`, `50 %`, `100 %` sous la barre aux positions 0, 1/3, 2/3, 1.
- **Périmètre restreint (décision 👤)** : uniquement les **volets** (`blindDevice.component.tsx`) et uniquement en profil **`previewV`** (`PROFILE === PROFILES_ENV.V`). Les autres profils, les lumières et `FavoriteCard` (y compris previewC) restent sur le slider linéaire actuel.
- Aucune modification de l'API Domoticz ni de `app/controllers/devices.controller.tsx` : l'extérieur du composant reste en % entier.

### Solution retenue (Gate #0)

**Option A** : conserver `@react-native-community/slider` (position interne 0–1, `step=0`), conversion par fonctions pures linéaires par morceaux (`BlindLevelScale.service.ts`) et composant `SegmentedBlindSlider` avec graduations. Retenue pour son effort faible, son absence de nouvelle lib et la conservation du comportement natif (geste, accessibilité). Seuils fixes `[0, 10, 50, 100]`, non configurables. Échelle « logarithmique » du titre de l'issue = échelle linéaire par morceaux.

Hypothèse : la question 3 d'ARCos (graduations dans les favoris) est sans objet, `FavoriteCard` étant hors périmètre. Dans `blindDevice`, les étiquettes complètes de l'issue sont affichées (pas de « traits seuls »). À confirmer au Gate #2 si besoin.

Formules (niveau `p` en %, position `t` ∈ [0,1]) :
- Tiers 1 : `t = p/30`
- Tiers 2 : `t = 1/3 + (p−10)/120`
- Tiers 3 : `t = 2/3 + (p−50)/150`

---

## 🛠️ Phases

### Phase 1 — Implémentation — ✅ Complétée et validée
**Contexte :** `blindDevice.component.tsx` utilise un `Slider` linéaire 0–100 (`step=1`). `PROFILE` / `PROFILES_ENV.V` existent dans `app/enums/Colors.ts`. `overrideNextValue` remplace 0 par la sentinelle 0,1 ; `p ≥ 99` → 100 (inchangé).
**Agent responsable :** 🔵 DEVon
**Critères de réussite :**
- ✅ `npm run typecheck`, `npm run lint`, `npm test -- --watchAll=false` verts.
- ✅ En previewV, le slider volets affiche l'échelle segmentée ; hors previewV, rendu et comportement identiques à l'existant.
- ✅ Aucun diff dans `devices.controller.tsx`, `lightDevice.component.tsx`, `favoriteCard.component.tsx`.

#### T1.1 - Créer le module de conversion
- **Agent :** 🔵 DEVon
- **Fichier(s) :** `app/services/BlindLevelScale.service.ts`
- **Implémenter :**
  - `levelToPosition(level)` (% → 0–1, clamp, sans arrondi), `positionToLevel(position)` (0–1 → % entier, clamp + `Math.round`), `BLIND_SCALE_TICKS` (`{ position, label }[]`).
  - Seuils `[0, 10, 50, 100]` en constante ; jonctions exactes (`<=`) ; valeurs invalides (`NaN`, `undefined`, hors bornes) ramenées aux bornes sans exception ; toute valeur ≤ 0,1 traitée comme 0.
  - JSDoc des formules ; aucune dépendance React.
- **Acceptation :** aller-retour % → position → % exact pour 0..100 ; 60 → ≈ 0,7333 ; t=1/3 → 10, t=2/3 → 50 ; typecheck/lint verts.

#### T1.2 - Créer le composant `SegmentedBlindSlider`
- **Agent :** 🔵 DEVon
- **Fichier(s) :** `app/components/segmentedBlindSlider.component.tsx`, `app/components/deviceRow.styles.ts` (styles graduations si besoin)
- **Implémenter :**
  - Props `export type SegmentedBlindSliderProps = { level; disabled; onLevelChange(p); onSlideStart(); onSlideEnd(); accessibilityLabel? }`, `React.FC`.
  - `Slider` natif `minimumValue=0`, `maximumValue=1`, `step=0`, `value = levelToPosition(level)` mémoïsé, mêmes couleurs/styles que l'existant (`Colors.dark.slider.*`, `Colors.domoticz.color`, `stylesListsDevices.slider` / `sliderDisabled`), `onResponderStart/End` transmis.
  - `onLevelChange` émis uniquement quand le % arrondi change.
  - Ligne de graduations (traits + étiquettes FR avec espace insécable) aux positions 0, 1/3, 2/3, 1, `paddingHorizontal = TRACK_INSET` (constante à caler sur appareil) ; masquée si `disabled`.
  - `accessibilityValue={{ min: 0, max: 100, now: p, text: 'p %' }}` + label FR.
- **Acceptation :** composant sans état global (seul état local : dernier % émis) ; typecheck/lint verts.

#### T1.3 - Intégrer dans `blindDevice` (previewV uniquement)
- **Agent :** 🔵 DEVon
- **Fichier(s) :** `app/components/blindDevice.component.tsx`
- **Implémenter :**
  - Si `isDimmable && PROFILE === PROFILES_ENV.V` : rendre `SegmentedBlindSlider` relié à `overrideNextValue(p, setNextValue)` et au `onResponderEnd` actuel (`updateDeviceLevel`, `setFlagLabel`). Sinon : `Slider` linéaire actuel strictement inchangé.
  - Ne pas modifier le controller.
- **Acceptation :** comportement hors previewV identique à l'existant ; en previewV, glisser à ~73 % de course envoie 60 %.

### Phase 2 — Tests & recette — ✅ Validée
**Contexte :** après Gate #2. Les mocks de tests déclarent `PROFILES_ENV: { C: 'previewC' }` (à étendre avec `V`). Les assertions de slider dans `blindDevice.component.test.tsx` (min/max/step) ne doivent changer que pour le cas previewV.
**Agent responsable :** 🟢 QALvin
**Critères de réussite :**
- ✅ `npm test -- --watchAll=false --coverage`, `npm run typecheck`, `npm run validate:expo` verts.
- ✅ Couverture : `BlindLevelScale.service.ts` = 100 %, `segmentedBlindSlider.component.tsx` ≥ 80 % (seuil composants ≥ 70 %), global ≥ 80 %.
- ✅ Tests `lightDevice` et `favoriteCard` passent **sans modification**.

#### T2.1 - Tester le module `BlindLevelScale.service`
- **Agent :** 🟢 QALvin
- **Fichier(s) :** `app/services/__tests__/BlindLevelScale.service.test.ts`
- **Couvrir :** table de vérité (0, 5, 10, 30, 50, 60, 75, 99, 100), aller-retour exhaustif 0..100, stricte croissance, jonctions 1/3 et 2/3, bornes, `NaN`/`undefined`/négatifs/> borne, valeur 0,1.
- **Acceptation :** 100 % de couverture du module.

#### T2.2 - Tester le composant `SegmentedBlindSlider`
- **Agent :** 🟢 QALvin
- **Fichier(s) :** `app/components/__tests__/segmentedBlindSlider.component.test.tsx`
- **Couvrir :** slider configuré 0–1 / `step=0` ; `value` ≈ 0,8333 pour 75 ; position 0,7333 émet 60 ; pas de réémission si le % ne change pas ; 4 étiquettes FR présentes ; état désactivé ; `accessibilityValue.now` en % ; appels `onSlideStart/End`.
- **Acceptation :** ≥ 80 % de couverture du composant.

#### T2.3 - Mettre à jour les tests `blindDevice` (deux profils)
- **Agent :** 🟢 QALvin
- **Fichier(s) :** `app/components/__tests__/blindDevice.component.test.tsx`, `app/components/__tests__/device.component.test.tsx` si impacté
- **Couvrir :** hors previewV → slider linéaire 0–100 `step=1` inchangé ; previewV → `SegmentedBlindSlider` et commande envoyée en % correct ; mocks `PROFILES_ENV` étendus avec `V`. Non-régression lumières et favoris (previewC inclus).
- **Acceptation :** tous les tests verts, aucun test lumières/favoris modifié.

#### T2.4 - Recette Android (previewV) — 👤 avec QALvin
- **Agent :** 🟢 QALvin + 👤
- **Couvrir :** alignement des graduations (calage de `TRACK_INSET`), réglage 1–9 % atteignable, TalkBack annonce en %, hauteur de carte acceptable (grille tablette).
- **Acceptation :** constat consigné dans le rapport de phase ; écart d'alignement ≤ ~1 px après calage, sinon retour AJUSTER vers DEVon.

### Phase 3 — Documentation & clôture — ✅ Validée
**Contexte :** après Gate #3.
**Agent responsable :** 🟣 DOCly
**Critères de réussite :**
- ✅ Docs synchronisées avec le comportement réel (previewV, volets seulement).
- ✅ ADR-015 `Acceptée`, index des plans à jour.

#### T3.1 - Synchroniser la documentation
- **Agent :** 🟣 DOCly
- **Fichier(s) :** `docs/ARCHITECTURE.md` (composant, arborescence, section Volets, mention ADR-015), `CHANGELOG.md` (entrée #330, en tête), `README.md` si les profils/fonctionnalités y figurent
- **Couvrir :** échelle segmentée, périmètre (volets, previewV), feature flag via `PROFILE`, formules et limites.
- **Acceptation :** liens vérifiés ; aucune mention contradictoire.

#### T3.2 - Clôturer ADR et index
- **Agent :** 🟣 DOCly
- **Fichier(s) :** `docs/adr/015-echelle-segmentee-slider-volets.md`, `.github/plans/README.md`
- **Acceptation :** ADR `Acceptée` ; statut global du plan à jour dans l'index (même changement).

---

## 📊 Résumé par Agent

| Agent | Tâches | Livrable |
|---|---|---|
| 🔵 DEVon | T1.1 – T1.3 | Module de conversion, composant `SegmentedBlindSlider`, intégration previewV dans `blindDevice` |
| 🟢 QALvin | T2.1 – T2.4 | Tests module/composant/intégration, couverture, recette Android |
| 🟣 DOCly | T3.1 – T3.2 | ARCHITECTURE, CHANGELOG, ADR-015 `Acceptée`, index plans |
| 🟠 ARCos | — (Gate #0 livré) | Analyse options + contenu ADR |

---

## 📍 Dépendances entre Phases

```
Gate #1 (plan)
    ↓
Phase 1 (code)  → Gate #2   [T1.1 → T1.2 → T1.3]
    ↓
Phase 2 (tests) → Gate #3   [T2.1 ∥ T2.2 → T2.3 → T2.4]
    ↓
Phase 3 (docs)  → Gate #4
```

---

## ✅ Critères de Succès Globaux

1. En previewV, 10 % à 1/3 de course, 50 % à 2/3, 60 % ≈ 73 % (±1 px après calage) ; chaque entier 0..100 atteignable.
2. Aller-retour de conversion exact sur les 101 valeurs entières.
3. Hors previewV, lumières et FavoriteCard : aucun changement de comportement (tests existants verts sans modification).
4. Aucun diff dans `devices.controller.tsx` ni dans les endpoints Domoticz.
5. `npm run typecheck`, `npm run lint`, `npm test -- --watchAll=false --coverage`, `npm run validate:expo` verts ; couverture globale ≥ 80 %.
6. ADR-015 `Acceptée` ; docs et index des plans synchronisés.

---

## 🚦 Journal des gates

| Gate | Date | Objet | Décision 👤 | Notes |
|---|---|---|---|---|
| #0 | 2026-11-10 | Choix de solution | ✅ GO | Option A ; volets + previewV uniquement (pas previewC, pas favoris/lumières) ; ADR-015 ; échelle linéaire par morceaux 0/10/50/100 fixe |
| #1 | 2026-11-10 | Validation plan | ✅ GO | Gate #1 approuvé par 👤 ; ADR-015 passée à Acceptée ; Phase 1 lancée |
| #2 | 2026-11-10 | Validation code | ✅ GO | Code approuvé par 👤 ; revue corrigée ; typecheck/lint verts ; 47 suites et 1 018 tests verts hors worktrees imbriqués ; lancement QA |
| #3 | 2026-11-11 | Validation tests et recette | ✅ GO | Recette humaine validée ; graduations retirées sur demande ; 37 tests ciblés, typecheck et lint verts ; documentation autorisée |
| #4 | 2026-11-11 | Validation documentation / clôture | ✅ GO | Documentation approuvée par 👤 ; AP-006 clôturé ; ADR-015 Acceptée |
