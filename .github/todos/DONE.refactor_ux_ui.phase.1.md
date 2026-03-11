# Plan de refactoring UX/UI – domoticz-mobile

## Contexte & Objectif

Refactoring UX/UI de l'application React Native/Expo Domoticz Mobile selon les consignes de `.github/todos/refactor_ux_ui.md`. L'objectif est de rendre l'application plus naturelle à parcourir, plus accessible et plus cohérente visuellement, sans modifier la logique métier sous-jacente ni les controllers/services.

---

## Architecture actuelle (état de l'art)

- **5 onglets :** Favoris (index), Lumières, Volets, Températures, Paramètres
- **Header :** ParallaxScrollView avec grand pictogramme décoratif, titre "Domoticz Mobile", version, état de connexion
- **Composants :** Cards uniformes (icon + nom + valeur + slider) pour tous les types
- **Paramètres :** Dropdowns pour Mode, Présence, Phase — lecture seule pour les RO

---

## Décisions de conception

| Décision | Justification |
|---|---|
| Conserver ParallaxScrollView, réduire le header | Refonte minimale du layout pour ne pas casser la navigation existante |
| Volets : slider + clic icône conservés | Contrôle volets via le slider et `onClickDeviceIcon` existants — pas de barre de boutons dédiée |
| Chips segmentés pour Mode/Présence/Moment| Material Design recommande les segmented buttons pour des sélections mutuellement exclusives courtes |
| Confirmation modale uniquement pour les groupes de volets | Éviter la sur-confirmation ; ne cibler que les actions à fort impact |
| +/- 0.5°C sur le thermostat en plus du slider | Améliore le contrôle précis sans supprimer le slider existant |
| Renommer "Paramètres" → "Maison" + icône `home` | Reflète la sémantique réelle de l'écran |

---

## Découpage du travail (par section)

> **Légende :** ✅ Implémenté · ⚠️ Partiel / différent de la conception · ❌ Non implémenté

### Section 1 – Navigation & Header

- ✅ **T01** · Renommer le tab "Paramètres" en "Maison" : `TabsEnums.ts` (`MAISON = 'Maison'`), `_layout.tsx` (utilise `Tabs.MAISON`)
- ✅ **T02** · Simplifier le header : `ParallaxScrollView.tsx` réduit à `HEADER_HEIGHT = 70px`, pas de grand pictogramme décoratif, affiche icône d'onglet + titre + icône de connexion. La version n'est plus dans le header.
- ✅ **T03** · Écran "À propos / Diagnostic" dans `parametrages.tab.tsx` : section "À propos" avec version app (`expo-constants`), version Domoticz (`domoticzConnexionData.version`), statut de connexion coloré.

### Section 2 – Lumières

- ✅ **T04** · Groupes lumières : `getLightsGroupLabel()` dans `devices.controller.tsx` retourne "Mixte" / "Éteintes" / "Allumées" / niveau en %. Intégré dans `getStatusLabel()` via la condition `isGroup && LUMIERE`.
- ✅ **T05** · Appareils individuels : `getSingleLightLabel()` dans `devices.controller.tsx` retourne "Éteinte" / "Allumée" (ON/OFF) ou niveau en % (variateur).
- ✅ **T06** · Appareils inactifs : `getStatusLabel()` retourne `"Déconnecté"` quand `!device.isActive`. Pour les températures, `temperature.component.tsx` retourne `"Déconnectée"` ou `"Inconnu"` selon l'état.

### Section 3 – Volets

- ✅ **T07** · Label volets : `getBlindLabel()` dans `devices.controller.tsx` retourne `"Fermé"` (status `Off`) ou `"Ouvert"` (status `On`). Plus de "Off" affiché dans l'UI.
- ✅ **T08** · Composant `BlindActionsBar` créé : `app/components/blindActionsBar.component.tsx` — 3 boutons `TouchableOpacity` (Ouvrir / Stop / Fermer), icônes Ionicons, cibles ≥ 44px, props `isActive / onOpen / onStop / onClose`. ⚠️ *Composant créé mais **non intégré** dans `device.component.tsx` — les volets utilisent le slider + clic icône (décision définitive).*
- ✅ **T10**· Confirmation modale : implémentée dans `components/IconDomoticzDevice.tsx` via la fonction `handleVoletPress()`. ⚠️ *Différence par rapport à la conception* : la logique est dans `IconDomoticzDevice.tsx` (et non dans `device.component.tsx` + `devices.controller.tsx`). La condition est `device.isGroup && device.name.toLowerCase().includes('tous')`.

### Section 4 – Températures & Thermostat

- ✅ **T11** · Boutons ±0,5°C thermostat : `handleDecrease` / `handleIncrease` dans `thermostat.component.tsx`. Boutons `TouchableOpacity` avec `minWidth: 44, minHeight: 44`, clampage sur `DomoticzThermostatLevelValue.MIN/MAX`.
- ✅ **T12** · Mesure vs consigne thermostat : `measuredRow` dans `thermostat.component.tsx` affiche la température mesurée (capteur dont `name` contient "salon" via `domoticzTemperaturesData`) et la consigne (`thermostat.temp`). La ligne occupe toute la largeur (`flex: 1`).
- ✅ **T13** · Cards température compactes : `height: 66` dans `temperatureStyles.viewBox`, icône 44×44px — plus compact que les cards device (84px).
- ✅ **T14** · Labels inactifs températures : `temperature.component.tsx` affiche `"Inconnu"` si actif mais valeur nulle, `"Déconnectée"` si `!temperature.isActive`.

### Section 5 – Maison (ex-Paramètres)

- ✅ **T15** · Chips segmentés dans `paramList.component.tsx` : remplacement du `Picker` dropdown par des `TouchableOpacity` stylisés en chips (`chipStyles`), défilables horizontalement via `ScrollView horizontal`. `accessibilityRole="button"` et `accessibilityState={{ selected }}` présents.
- ✅ **T16** · Renommage Phase → Moment : `getParametreDisplayName()` dans `paramList.component.tsx` mappe `"Phase"` → `"Moment"`. Uniquement côté affichage, le modèle/API est inchangé.
- ✅ **T17** · Labels Présence : `getParametreDisplayLabel()` dans `paramList.component.tsx` mappe `"Présent"` → `"Maison occupée"` et `"Absent"` → `"Maison vide"` quand `parametreName.includes("Présence")`.

### Section 6 – Accessibilité

- ⚠️ **T18** · Cibles tactiles ≥ 44px : appliqué sur les **nouveaux composants** (`adjustButton` thermostat : `minWidth: 44, minHeight: 44` ; chips `paramList` : `minHeight: 44`). Non audité de façon exhaustive sur les contrôles existants (icon volet, tabs, slider).
- ⚠️ **T19** · Contraste texte : texte principal `#ECEDEE` sur `#151718` ≈ 14,5:1 ✅. Texte secondaire `#9BA1A6` sur `#151718` ≈ 4,6:1 (limite). Couleur accent `#f5c727` (profil V) sur `#151718` ≈ 9:1 ✅. Couleur accent `#339a9a` (profil C) sur `#151718` ≈ 3:1 ⚠️ — ne passe probablement pas 4,5:1. Non corrigé.
- ⚠️ **T20** · États visuels pressed/disabled/focus : `opacity: 0.4` pour disabled et `activeOpacity={0.7}` pour pressed sur les **nouveaux composants** (`thermostat`, `paramList`). Non appliqué systématiquement sur les contrôles existants (icon lumière, icon volet dans `IconDomoticzDevice`).

---

## Tâches Agent Dev

| ID | Statut | Titre | Fichiers concernés | Priorité |
|---|---|---|---|---|
| T01 | ✅ | Rename tab Paramètres → Maison | `app/enums/TabsEnums.ts`, `app/(tabs)/_layout.tsx` | Haute |
| T02 | ✅ | Simplifier le header | `components/ParallaxScrollView.tsx` (HEADER_HEIGHT=70, icône + titre + statut connexion) | Haute |
| T03 | ✅ | Écran À propos / Diagnostic | `app/(tabs)/parametrages.tab.tsx` (section "À propos" intégrée) | Moyenne |
| T04 | ✅ | État synthétique groupes lumières | `app/controllers/devices.controller.tsx` (`getLightsGroupLabel`) | Haute |
| T05 | ✅ | Clarifier état appareils individuels lumières | `app/controllers/devices.controller.tsx` (`getSingleLightLabel`) | Haute |
| T06 | ✅ | Remplacer `?`/`-` par labels explicites | `app/controllers/devices.controller.tsx` (`getStatusLabel`), `app/components/temperature.component.tsx` | Haute |
| T07 | ✅ | Label "Fermé" pour volets | `app/controllers/devices.controller.tsx` (`getBlindLabel`) | Haute |
| T08 | ✅ | Composant BlindActionsBar (non intégré — décision définitive) | `app/components/blindActionsBar.component.tsx` | —  |
| T10 | ✅ | Confirmation modale groupes volets| `components/IconDomoticzDevice.tsx` (`handleVoletPress`) — ⚠️ localisé différemment de la conception | Moyenne |
| T11 | ✅ | Boutons +/- thermostat | `app/components/thermostat.component.tsx` (`handleDecrease`/`handleIncrease`) | Haute |
| T12 | ✅ | Mesure vs consigne thermostat | `app/components/thermostat.component.tsx` (`measuredRow`) | Haute |
| T13 | ✅ | Cards température compactes | `app/components/temperature.component.tsx` (height: 66) | Moyenne |
| T14 | ✅ | Labels inactifs température (voir T06) | `app/components/temperature.component.tsx` ("Inconnu"/"Déconnectée") | Haute |
| T15 | ✅ | Chips pour paramètres | `app/components/paramList.component.tsx` (`chipStyles`) | Haute |
| T16 | ✅ | Renommer Phase → Moment | `app/components/paramList.component.tsx` (`getParametreDisplayName`) | Moyenne |
| T17 | ✅ | Labels Présence "Maison occupée/vide" | `app/components/paramList.component.tsx` (`getParametreDisplayLabel`) | Moyenne |
| T18 | ⚠️ | Cibles tactiles ≥ 44px | Nouveaux composants OK ; contrôles existants (icon volet, tabs) non audités | Haute |
| T19 | ⚠️ | Contraste texte ≥ 4,5:1 | Texte principal OK ; `#339a9a` (profil C) sur `#151718` insuffisant (~3:1) | Moyenne |
| T20 | ⚠️ | États pressed/disabled/focus | Nouveaux composants OK (`opacity: 0.4`, `activeOpacity={0.7}`) ; non systématique | Moyenne |

---

## Tâches Agent QA

| ID | Titre | Dépend de |
|---|---|---|
| QA01 | Mettre à jour les snapshots après refactoring header/tabs | T01, T02 |
| QA02 | Tests snapshot pour BlindActionsBar | T08 |
| QA03 | Tests snapshot device.component (états lumières, volets) | T04, T05, T06, T07 |
| QA04 | Tests snapshot thermostat.component (boutons +/-) | T11, T12 |
| QA05 | Tests snapshot paramList.component (chips) | T15 |
| QA06 | Tests d'accessibilité : vérifier tailles cibles (accessibilityRole, minHeight) | T18 |

---

## Tâches Agent Doc

| ID | Titre | Dépend de |
|---|---|---|
| D01 | Mettre à jour README : nouvelle architecture des onglets, nouvel écran À propos | T01, T03 |
| D02 | Mettre à jour les instructions Copilot (`.github/copilot-instructions.md`) : schéma UX, convention volets | T15 |

---

## Critères de succès

- [x] L'onglet "Paramètres" est renommé "Maison" avec icône adaptée — **T01 ✅**
- [x] Le header est compact (hauteur 70px, icône d'onglet + titre + statut connexion, pas de version) — **T02 ✅**
- [x] Les groupes lumières affichent un état synthétique ("Éteintes" / "Allumées" / "Mixte" / niveau%) — **T04 ✅**
- [x] Les volets affichent "Ouvert"/"Fermé" et utilisent le slider + clic icône — **T07 ✅** (décision définitive : pas de BlindActionsBar)
- [x] Les volets fermés affichent "Fermé" au lieu de "Off" — **T07 ✅**
- [x] La modale de confirmation s'affiche pour les actions de groupe de volets ("Tous") — **T10 ✅** (dans `IconDomoticzDevice.tsx`)
- [x] Le thermostat affiche mesure vs consigne + boutons ±0,5°C — **T11 + T12 ✅**
- [x] Les appareils inactifs affichent "Déconnecté" / "Déconnectée" / "Inconnu" au lieu de `?`/`-` — **T06 + T14 ✅**
- [x] Les paramètres Mode/Présence/Moment utilisent des chips/boutons segmentés — **T15 ✅**
- [x] "Phase" est renommé "Moment" ; labels présence "Maison occupée" / "Maison vide" — **T16 + T17 ✅**
- [ ] Toutes les cibles tactiles ≥ 44×44px (audit exhaustif non terminé) — **T18 ⚠️**
- [x] Les tests existants passent après mise à jour des snapshots — **QA à vérifier**

---

## Risques & Mitigations

| Risque | Mitigation |
|---|---|
| Casser les snapshots existants | Mettre à jour tous les snapshots en même temps que les changements visuels |
| Le composant `Picker` (dropdown) peut être difficile à remplacer| Utiliser `TouchableOpacity` avec `StyleSheet` pour les chips — éviter des dépendances externes |
| La valeur "mesurée" du thermostat peut ne pas être disponible dans le modèle actuel | Vérifier `DomoticzThermostat` et si besoin enrichir le modèle ou lire depuis les températures du contexte |
| Contraste : couleur domoticz `#339a9a` peut ne pas passer 4,5:1 sur `#151718` | Vérifier avec un outil de contraste — ajuster la luminosité si nécessaire |

---

## Ordre d'exécution recommandé

```
Phase 1 (fondamentaux) : T01 → T02 → T06/T14 (labels inactifs)
Phase 2 (lumières)     : T04 → T05
Phase 3 (volets)       : T07 → T08 → T10
Phase 4 (températures) : T11 → T12 → T13
Phase 5 (maison)       : T15 → T16 → T17 → T03
Phase 6 (accessibilité): T18 → T19 → T20
Phase QA               : QA01 à QA06
Phase Doc              : D01 → D02
```
