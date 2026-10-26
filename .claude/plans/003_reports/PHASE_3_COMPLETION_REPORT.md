# Phase 3 : Paramétrage du cadran Thermostat

**Responsable Agent :** Devon (🔵 DEV)
**Date Début :** 2026-09-15
**Date Fin :** 2026-09-15
**Statut :** ✅ COMPLÉTÉE

---

## 📝 Tâches

### T3.1 - Rendre `DIAL_SIZE` paramétrable

**Statut :** ✅ DONE
**Date Fin :** 2026-09-15

**Fichiers Modifiés / Créés :**
- `app/components/thermostat.component.tsx`
- `app/(tabs)/temperatures.tab.tsx`

**Résultats Quantifiés :**
- `npm run typecheck` : 0 erreur
- `npm run lint` : 0 erreur
- `npx jest --testPathPattern="thermostat|temperatures.tab" --watchAll=false` : 4 suites, 117/117 tests verts (aucune adaptation nécessaire)
- `npx jest --watchAll=false` (suite complète) : 41 suites, 874/874 tests verts (identique à la baseline Phase 2, aucune régression)

**Notes / Décisions :**

- **Piège identifié par le plan confirmé et traité** : `DIAL_SIZE`/`CX`/`CY`/`TRACK_R`/`TRACK_W`/`KNOB_R` étaient des constantes de module, et `polarToXY`/`touchToTemp`/`describeArc` des fonctions de module fermant dessus. Tout est sorti :
  - `DEFAULT_DIAL_SIZE = 180` (référence, défaut prop) + `REF_TRACK_R = 85` / `REF_TRACK_W = 12` / `REF_KNOB_R = 8` restent des constantes de module (valeurs de référence uniquement, plus jamais utilisées directement pour le rendu).
  - `polarToXY(cx, cy, angleDeg, r)`, `describeArc(cx, cy, startAngle, span, r)`, `touchToTemp(cx, cy, x, y)` : signatures étendues avec `cx`/`cy` en premiers paramètres. Fonctions pures de module conservées (pas de closure), appelées depuis le composant avec les `cx`/`cy` courants de l'instance.
  - Dans le composant : `cx = dialSize / 2`, `cy = dialSize / 2`, `scale = dialSize / DEFAULT_DIAL_SIZE`, puis `trackR = REF_TRACK_R * scale`, `trackW = REF_TRACK_W * scale`, `knobR = REF_KNOB_R * scale` — recalculés à chaque render à partir du prop `dialSize` reçu.

- **Formule de scaling `TRACK_R`/`TRACK_W`/`KNOB_R` choisie** : proportionnel simple au ratio `dialSize / DEFAULT_DIAL_SIZE` (ex. dialSize=240 → scale=1.333 → trackR≈113.3, trackW=16, knobR≈10.67). Choix motivé :
  - Ordre de calcul `scale = dialSize / DEFAULT_DIAL_SIZE` PUIS `constante * scale` (et non l'inverse) : à `dialSize=180`, `scale` est exactement `1.0` en IEEE754 (division d'un nombre par lui-même), donc `trackR`/`trackW`/`knobR` valent exactement `85`/`12`/`8` — aucune dérive d'arrondi flottant, rendu par défaut bit-à-bit identique à l'existant.
  - Un scaling proportionnel simple de l'anneau (pas de ratio réduit) a été retenu plutôt qu'un anneau à épaisseur fixe : à `dialSize=240`, un anneau resté à 12px sur un disque 33% plus grand aurait visuellement paru "fin"/disproportionné par rapport à l'agrandissement du disque. Le scaling linéaire garde une proportion visuelle cohérente (piste, curseur et disque grandissent ensemble).
  - Le décalage `- 2` du rayon du disque intérieur (`trackR - trackW/2 - 2`) n'est pas scalé (reste absolu) : effet négligeable à toute taille testée (180/240), non retenu comme prioritaire à corriger.
  - Vérification faite par raisonnement géométrique explicite (pas d'accès à un environnement web interactif dans cette session) : voir section "Vérification chevauchement" ci-dessous.

- **`touchToTemp` / désync tap-cible-rendu** : les callbacks `.onBegin`/`.onUpdate` du `Gesture.Pan()` appellent désormais `touchToTemp(cx, cy, e.x, e.y)` avec le `cx`/`cy` calculé dans le même render que celui utilisé pour le rendu SVG (`<Svg width={dialSize} height={dialSize}>`, `<Circle cx={cx} cy={cy} .../>`) — même source de vérité, pas de valeur figée. Élimine le risque principal signalé par le plan.

- **Styles figés en `StyleSheet.create` de module (piège n°2 identifié)** : `dialWrapper`, `dialOverlay`, `innerGroup.top`, `controls.top` calculaient `width`/`height`/`top` à partir des anciennes constantes de module (`DIAL_SIZE`, `CY`) — passer `dialSize` en prop n'aurait rien changé à ces styles. Ces 4 propriétés sont sorties du `StyleSheet.create` statique et recalculées inline dans le composant à partir de `dialSize`/`cy` courants, puis fusionnées via `style={[styles.dialWrapper, { width: dialSize, height: dialSize }, ...]}` (et équivalent `dialOverlay`, `innerGroup` avec `{ top: cy - 60 }`, `controls` avec `{ top: cy + 46 }}`). Le reste des styles (couleurs, `alignItems`, `flexDirection`, tailles de police, etc.) reste dans le `StyleSheet.create` statique, inchangé.

- **Vérification chevauchement (raisonnement géométrique, `dialSize=240`)** :
  - `cy = 120` (au lieu de 90 à 180).
  - Bloc "Consigne" + valeur (`innerGroup`) : `top = cy - 60 = 60`. Hauteur du contenu (tailles de police non scalées : `consigneLabel` ~14px + marge 2px + `tempRow` hauteur ligne 72px) ≈ 88px → se termine vers `y ≈ 148`.
  - Boutons +/- (`controls`) : `top = cy + 46 = 166`, hauteur `ctrlBtn` = 40px → se termine vers `y ≈ 206`.
  - Marge résiduelle entre les deux blocs : `166 - 148 ≈ 18px` (positive, pas de chevauchement). Le tout (`206px`) tient dans la hauteur du disque (`240px`).
  - Comme les tailles de police (`tempInt`, `tempDec`, `consigneLabel`, `ctrlText`) restent des valeurs absolues non scalées, l'espace disponible ne fait qu'augmenter avec `dialSize` — aucun risque de chevauchement à `dialSize ≥ 180` (la marge de 18px à 180 était déjà positive ; elle ne se réduit jamais quand `dialSize` croît, seul `cy` grandit, écartant `innerGroup` et `controls`).
  - Pas d'accès à un environnement de build web interactif dans cette session pour capture d'écran — raisonnement géométrique jugé suffisant compte tenu de la marge confortable (18px) et de l'absence de scaling des éléments texte qui pourrait la réduire.

- **Rétrocompatibilité** : `dialSize?: number` optionnel avec défaut `DEFAULT_DIAL_SIZE = 180` dans la déstructuration des props (`{ thermostat, dialSize = DEFAULT_DIAL_SIZE }`). Tout appelant existant qui ne passe pas `dialSize` obtient un rendu strictement identique (démontré par le scaling exact à `scale=1` ci-dessus, et confirmé par les 117 tests thermostat/temperatures.tab verts sans adaptation).

- **`temperatures.tab.tsx`** : `dialSize` dérivé du `breakpoint` retourné par `useResponsiveColumns()` (déjà utilisé pour `columns` en Phase 2) : `180` (`DIAL_SIZE_COMPACT`) en `compact`, `240` (`DIAL_SIZE_LARGE`) en `medium`/`expanded`. Passé en prop à chaque `<ViewDomoticzThermostat thermostat={item} dialSize={dialSize} />`.

- **Aucune nouvelle dépendance** : uniquement `react-native`/`react-native-svg`/`react-native-gesture-handler` déjà utilisés, et `useResponsiveColumns` (Phase 1) déjà importé dans `temperatures.tab.tsx` depuis T2.3.

- **Test existant `app/components/__tests__/thermostat.component.test.ts`** : n'importe pas les fonctions de module (`polarToXY`/`touchToTemp`/`describeArc`) ni ne rend le composant — il duplique la logique métier inline pour la tester isolément. Signature `dialSize` non testée par ce fichier ; aucun impact du changement de signature. QALvin ajoutera la couverture dédiée `dialSize=180`/`240` en Phase 4 (T4.3), notamment tests directs de `touchToTemp`/`polarToXY` avec les nouvelles signatures paramétrées.

---

## 📊 Synthèse de Phase

**Tâches Complétées :** 1/1

**Critères de Réussite Atteints :**
- ☑ `dialSize?: number` optionnel, défaut 180
- ☑ Constantes géométriques (`cx`, `cy`, `trackR`, `trackW`, `knobR`) recalculées à partir du prop, plus aucune constante de module figée utilisée pour le rendu
- ☑ `touchToTemp` cohérent avec les valeurs recalculées (mêmes `cx`/`cy` que le rendu SVG, dans le même render)
- ☑ Écran Températures dérive `dialSize` du breakpoint (180 compact, 240 medium/expanded)
- ☑ Landscape tablette (~1280dp → breakpoint expanded) : cadran proportionné (scaling linéaire piste/curseur/disque), vérifié par raisonnement géométrique explicite (pas de chevauchement, marge ~18px)

**Vérifications complémentaires (hors critères plan, gate qualité) :**
- ☑ `npm run typecheck` : 0 erreur
- ☑ `npm run lint` : 0 erreur
- ☑ Rendu à `dialSize=180` (défaut) strictement identique à l'existant (scale=1 exact, pas de dérive flottante)
- ☑ Suite de tests complète : 874/874 verts (aucune régression vs baseline Phase 2)

**Bloqueurs :** aucun.
**Point d'attention signalé (non bloquant) :** vérification visuelle réelle (capture d'écran `npm run web` ou device) non effectuée dans cette session — remplacée par raisonnement géométrique explicite ci-dessus. À confirmer visuellement si possible avant Gate #2, sinon geste de confiance sur le raisonnement fourni.
**Prochaine Phase :** Gate #2 (validation code) puis Phase 4 (Tests — QALvin, notamment T4.3 couverture dédiée `dialSize=180`/`240`)

---

Fin du rapport Phase 3
