# ADR 015 — Échelle segmentée du slider de volets (réglage fin 0–10 %)

- **Statut** : Acceptée
- **Date** : 2026-11-10
- **Décideurs** : 🟠 ARCos + 👤 Développeur humain (Gate #0 : GO, option A)
- **Portée** : `app/services/BlindLevelScale.service.ts` (nouveau), `app/components/segmentedBlindSlider.component.tsx` (nouveau), `app/components/blindDevice.component.tsx`, `app/enums/Colors.ts` (lecture du flag `PROFILE`, non modifié)
- **Issue** : #330

## Contexte

Le slider de volets (`blindDevice.component.tsx`) est un `@react-native-community/slider` **linéaire 0–100 %**. Les positions d'usage courantes d'un volet sont 0 %, 50 % et 100 %, mais le besoin exprimé dans l'issue #330 est de pouvoir **régler finement la zone 0–10 %** (entrebâillement), que la course linéaire rend trop peu précise : 10 % de la valeur n'occupent que 10 % de la course.

Besoin : une **échelle segmentée non linéaire** sur la course normalisée [0..1], découpée en 3 tiers égaux :

| Tiers | Course | Niveau |
|---|---|---|
| 1 | 0 → 1/3 | 0 → 10 % |
| 2 | 1/3 → 2/3 | 10 → 50 % |
| 3 | 2/3 → 1 | 50 → 100 % |

Des étiquettes de graduation « 0 % », « 10 % », « 50 % », « 100 % » doivent figurer sous la barre, aux positions 0, 1/3, 2/3 et 1. Exemple : 60 % se situe à ≈ 73 % de la course.

Contraintes :
- le reste de l'application (`devices.controller.tsx` : `overrideNextValue` / `updateDeviceLevel` / `getLevel`) et l'API Domoticz manipulent des **pourcentages entiers** et ne doivent pas changer ;
- aucune nouvelle dépendance n'est souhaitée ;
- la fonctionnalité est déployée prudemment, derrière le feature flag de build `PROFILE` (`PROFILE === PROFILES_ENV.V`, `app/enums/Colors.ts`).

Note de vocabulaire : l'échelle est qualifiée de « log » dans le titre de l'issue ; il s'agit en réalité d'une échelle **linéaire par morceaux** (valeurs rondes aux jonctions, comportement prévisible, aller-retour exact).

## Décision

**Nous avons décidé de** conserver `@react-native-community/slider` et de lui faire manipuler une **position interne normalisée 0–1** (`minimumValue=0`, `maximumValue=1`, `step=0`), convertie vers/depuis le pourcentage par des **fonctions pures linéaires par morceaux** isolées dans `app/services/BlindLevelScale.service.ts`, la conversion et les graduations étant encapsulées dans un nouveau composant `segmentedBlindSlider.component.tsx`, **activé uniquement pour les volets et uniquement en profil `previewV`**.

Détail :

1. **Service pur `BlindLevelScale.service.ts`** :
   - `levelToPosition(level)` : pourcentage → position [0..1] ;
   - `positionToLevel(position)` : position → pourcentage entier (`Math.round`, borné à 0..100) ;
   - `BLIND_SCALE_TICKS` : graduations (étiquettes et positions 0, 1/3, 2/3, 1).
2. **Formules** (p = niveau en %, t = position) :
   - tiers 1 (0 ≤ p ≤ 10) : `t = p / 30` ;
   - tiers 2 (10 < p ≤ 50) : `t = 1/3 + (p − 10) / 120` ;
   - tiers 3 (50 < p ≤ 100) : `t = 2/3 + (p − 50) / 150`.
   Sens inverse : jonctions `t <= 1/3 → 10 %` et `t <= 2/3 → 50 %` (comparaisons `<=`).
3. **Seuils fixes** `[0, 10, 50, 100]` écrits dans le code, **non configurables**.
4. **Aller-retour exact** : pour les 101 entiers 0..100, `positionToLevel(levelToPosition(n)) === n`.
5. **Composant `segmentedBlindSlider.component.tsx`** : props en **pourcentage entier** (`level`, `disabled`, `onLevelChange`, `onSlideStart`, `onSlideEnd`, `accessibilityLabel`). Il affiche le slider et, dessous, une ligne de graduations alignée par une constante `TRACK_INSET` (à caler sur appareil). Il **dédoublonne** les émissions sur le pourcentage arrondi (pas d'événement tant que le % entier ne change pas) et fournit `accessibilityValue` en pourcentage.
6. **Frontière en % entier** : `devices.controller.tsx` et l'API Domoticz restent inchangés.
7. **Périmètre** (décision 👤) :
   - **volets uniquement** (`blindDevice.component.tsx`) ;
   - **uniquement en profil `previewV`** (`PROFILE === PROFILES_ENV.V`, feature flag de build) ; les autres profils (dont `previewC` et la production sans profil) conservent le slider linéaire actuel ;
   - lumières, `FavoriteCard` (tous modes, dont `previewC`) et autres sliders **inchangés**. Extension possible ultérieurement.

## Alternatives considérées

### Option A — `@react-native-community/slider` + conversion par fonctions pures (retenue ✅)

- **Avantages** :
  - aucune nouvelle dépendance ; comportement natif du slider conservé (geste, accessibilité, rendu plateforme) ;
  - conversion pure, testable à 100 % indépendamment de l'UI ;
  - pourcentage entier conservé hors du composant : contrôleur et API intacts ;
  - réglage 0–10 % **3,3× plus fin** (10 % du niveau occupent 1/3 de la course au lieu de 10 %).
- **Inconvénients** :
  - graduations dessinées dans une `View` séparée dont l'alignement dépend du retrait natif de la piste (risque visuel Android/iOS, calage sur appareil via `TRACK_INSET`) ;
  - écart d'échelle volontaire entre volets et lumières.

### Option B — Slider maison (`PanResponder` / `gesture-handler`)

- **Avantages** : maîtrise totale du rendu, graduations parfaitement alignées sur la piste.
- **Inconvénients** : effort élevé ; risques de régression sur le geste et l'accessibilité ; remplace de fait la librairie standard.
- **Raison du rejet** : coût et risque disproportionnés pour le besoin. Le module de conversion étant indépendant de l'UI, cette option reste **réutilisable plus tard** si l'alignement des graduations devient une exigence.

### Option C — Sélecteur de tiers + slider « zoomé »

- **Avantages** : réutilise un slider linéaire avec une plage réduite.
- **Inconvénients** : deux interactions successives ; proche de la barre de boutons écartée par les conventions du projet.
- **Raison du rejet** : ne répond pas à l'issue (réglage continu sur une seule barre avec graduations).

## Conséquences

### Positives

- Réglage fin 0–10 % **3,3× plus précis**.
- Conversion **100 % testable** (fonctions pures, aller-retour exact vérifiable sur les 101 entiers).
- Comportement natif du slider conservé ; aucune nouvelle dépendance.
- Contrôleur, API Domoticz, lumières, `FavoriteCard` et profils hors `previewV` strictement inchangés.
- Déploiement progressif et réversible grâce au feature flag de build.

### Négatives / compromis

- Graduations dessinées dans une `View` séparée : leur alignement dépend du retrait natif de la piste, donc **risque visuel Android/iOS** et calage de `TRACK_INSET` sur appareil.
- **Écart d'échelle volontaire** entre volets (segmentée, en `previewV`) et lumières (linéaire) tant que l'extension n'est pas décidée.
- **+12 à 14 px de hauteur** de carte pour la ligne de graduations.
- **Incrément en fin de course** : le pas 99 → 100 % n'occupe que 0,67 % de la course (1/150), donc moins aisé à atteindre précisément en tiers 3.
- **Accessibilité** : l'annonce doit rester en pourcentage (et non en position 0–1) ; elle repose sur `accessibilityValue` fourni par le composant, à vérifier sur lecteur d'écran.
- Une bascule vers l'option B reste possible si l'alignement des graduations devient une exigence.

### Neutres

- Mise à jour de `docs/ARCHITECTURE.md` à prévoir (nouveau service et composant, feature flag `previewV`) lors de la phase de documentation du plan.

## Mise en œuvre

- **Fichiers impactés** : `app/services/BlindLevelScale.service.ts` (nouveau), `app/components/segmentedBlindSlider.component.tsx` (nouveau), `app/components/blindDevice.component.tsx` (sélection du slider selon `PROFILE === PROFILES_ENV.V`).
- **Tâches de suivi** : voir les phases du plan AP-006 (DEVon — service, composant et intégration ; QALvin — tests unitaires de conversion, dont l'aller-retour sur 101 entiers et les jonctions, et tests composant ; DOCly — `docs/ARCHITECTURE.md`).
- **Date d'effet** : à partir de la livraison du plan AP-006, en profil `previewV` uniquement.

## Références

- Issue : #330
- Plan d'Action : [`.github/plans/006_echelle_segmentee_slider_volets.plan.md`](../../.github/plans/006_echelle_segmentee_slider_volets.plan.md) (AP-006)
- `app/enums/Colors.ts` (`PROFILE`, `PROFILES_ENV`)
- [docs/ARCHITECTURE.md](../ARCHITECTURE.md)
