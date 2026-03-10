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
| Nouveau composant `BlindActionsBar` pour les 3 boutons volet | Séparation des responsabilités : le slider reste disponible en secondaire |
| Chips segmentés pour Mode/Présence/Moment | Material Design recommande les segmented buttons pour des sélections mutuellement exclusives courtes |
| Confirmation modale uniquement pour les groupes de volets | Éviter la sur-confirmation ; ne cibler que les actions à fort impact |
| +/- 0.5°C sur le thermostat en plus du slider | Améliore le contrôle précis sans supprimer le slider existant |
| Renommer "Paramètres" → "Maison" + icône `home` | Reflète la sémantique réelle de l'écran |

---

## Découpage du travail (par section)

### Section 1 – Navigation & Header

- **T01** · Renommer le tab "Paramètres" en "Maison" : `TabsEnums.ts`, `_layout.tsx`, icône `cog` → `home`
- **T02** · Simplifier le header : réduire le pictogramme décoratif, conserver titre + état de connexion + date dernière synchro ; déplacer la version dans un écran "À propos"
- **T03** · Créer un écran secondaire "À propos / Diagnostic" accessible depuis "Maison" : version de l'app, version Domoticz, état de connexion détaillé

### Section 2 – Lumières

- **T04** · Groupes : afficher état synthétique ("3/5 allumées", état mixte, niveau moyen 40%) dans le composant `device.component.tsx` (conditionnel `isGroup`)
- **T05** · Appareils individuels : clarifier l'affichage de l'état (allumé/éteint explicitement au lieu du seul niveau)
- **T06** · Remplacer `?` et `-` par "Inconnu" ou "Déconnectée" (appareils inactifs) — applicable à tous les types

### Section 3 – Volets

- **T07** · Remplacer "Off" par "Fermé" dans le label d'état des volets (`device.component.tsx`, conditionnel `type === VOLET`)
- **T08** · Créer le composant `BlindActionsBar` : 3 boutons Ouvrir / Stop / Fermer avec icônes explicites (taille cible ≥ 44px)
- **T09** · Intégrer `BlindActionsBar` dans `device.component.tsx` pour `type === VOLET`, slider en mode secondaire (replié ou en bas)
- **T10** · Ajouter une confirmation modale (`Alert.alert`) avant action de groupe de volets (quand `isGroup === true` et nom contient "Tous")

### Section 4 – Températures & Thermostat

- **T11** · Thermostat : ajouter boutons `−` / `+` (0,5°C) autour de la valeur de consigne dans `thermostat.component.tsx`
- **T12** · Thermostat : afficher clairement la valeur **mesurée** (capteur "Salon" ou équivalent) vs la **consigne** — la consigne est le `temp` actuel du thermostat
- **T13** · Capteurs température : rendre les cards plus compactes (réduire padding, hauteur card, icône)
- **T14** · Remplacer `?` et `-` des capteurs inactifs par "Inconnu" / "Déconnectée" (voir T06, mutualisé)

### Section 5 – Maison (ex-Paramètres)

- **T15** · Transformer le composant `paramList.component.tsx` : remplacer le dropdown `Picker` par des **chips / boutons segmentés** pour les `PARAMETRE` (Mode, Présence, Moment)
- **T16** · Renommer "Phase" → "Moment" dans les labels UI (le modèle/API n'est pas changé, seulement l'affichage)
- **T17** · Mettre à jour les labels Présence : "Maison occupée" / "Maison vide" (mapping depuis les valeurs API existantes)

### Section 6 – Accessibilité

- **T18** · Auditer et corriger la taille des cibles tactiles : minimum 44×44px pour tous les boutons actifs (tabs, sliders, boutons volets, +/−)
- **T19** · Vérifier le rapport de contraste texte ≥ 4,5:1 (texte sur fond `#151718`) — ajuster les couleurs texte inactif si nécessaire
- **T20** · Ajouter des états visuels distincts pour `pressed` / `disabled` / `focus` sur les contrôles interactifs

---

## Tâches Agent Dev

| ID | Titre | Fichiers concernés | Priorité |
|---|---|---|---|
| T01 | Rename tab Paramètres → Maison | `app/enums/TabsEnums.ts`, `app/(tabs)/_layout.tsx` | Haute |
| T02 | Simplifier le header | `app/(tabs)/_layout.tsx`, `components/ParallaxScrollView.tsx` | Haute |
| T03 | Écran À propos / Diagnostic | `app/(tabs)/parametrages.tab.tsx` (ou nouvelle route) | Moyenne |
| T04 | État synthétique groupes lumières | `app/components/device.component.tsx` | Haute |
| T05 | Clarifier état appareils individuels lumières | `app/components/device.component.tsx` | Haute |
| T06 | Remplacer `?`/`-` par labels explicites | `app/components/device.component.tsx`, `app/components/temperature.component.tsx` | Haute |
| T07 | Label "Fermé" pour volets | `app/components/device.component.tsx` | Haute |
| T08 | Composant BlindActionsBar | Nouveau fichier `app/components/blindActionsBar.component.tsx` | Haute |
| T09 | Intégrer BlindActionsBar dans device | `app/components/device.component.tsx` | Haute |
| T10 | Confirmation modale groupes volets | `app/components/device.component.tsx` + `app/controllers/devices.controller.tsx` | Moyenne |
| T11 | Boutons +/- thermostat | `app/components/thermostat.component.tsx` | Haute |
| T12 | Mesure vs consigne thermostat | `app/components/thermostat.component.tsx` | Haute |
| T13 | Cards température compactes | `app/components/temperature.component.tsx` | Moyenne |
| T14 | Labels inactifs température (voir T06) | `app/components/temperature.component.tsx` | Haute |
| T15 | Chips pour paramètres | `app/components/paramList.component.tsx` | Haute |
| T16 | Renommer Phase → Moment | `app/components/paramList.component.tsx`, `app/enums/` | Moyenne |
| T17 | Labels Présence "Maison occupée/vide" | `app/components/paramList.component.tsx` | Moyenne |
| T18 | Cibles tactiles ≥ 44px | Tous composants interactifs | Haute |
| T19 | Contraste texte ≥ 4,5:1 | `app/enums/Colors.ts`, composants | Moyenne |
| T20 | États pressed/disabled/focus | `app/components/`, `components/navigation/` | Moyenne |

---

## Tâches Agent QA

| ID | Titre | Dépend de |
|---|---|---|
| QA01 | Mettre à jour les snapshots après refactoring header/tabs | T01, T02 |
| QA02 | Tests snapshot pour BlindActionsBar | T08 |
| QA03 | Tests snapshot device.component (états lumières, volets) | T04, T05, T06, T07, T09 |
| QA04 | Tests snapshot thermostat.component (boutons +/-) | T11, T12 |
| QA05 | Tests snapshot paramList.component (chips) | T15 |
| QA06 | Tests d'accessibilité : vérifier tailles cibles (accessibilityRole, minHeight) | T18 |

---

## Tâches Agent Doc

| ID | Titre | Dépend de |
|---|---|---|
| D01 | Mettre à jour README : nouvelle architecture des onglets, nouvel écran À propos | T01, T03 |
| D02 | Mettre à jour les instructions Copilot (`.github/copilot-instructions.md`) : composant BlindActionsBar, schéma UX | T08, T15 |

---

## Critères de succès

- [ ] L'onglet "Paramètres" est renommé "Maison" avec icône `home`
- [ ] Le header est compact (pas de grand pictogramme, pas de version en header)
- [ ] Les groupes lumières affichent un état synthétique ("X/Y allumées")
- [ ] Les volets affichent les 3 boutons Ouvrir/Stop/Fermer
- [ ] Les volets fermés affichent "Fermé" au lieu de "Off"
- [ ] La modale de confirmation s'affiche pour les actions de groupe de volets
- [ ] Le thermostat affiche mesure vs consigne + boutons +/- 0,5°C
- [ ] Les appareils inactifs affichent "Inconnu" ou "Déconnectée" au lieu de `?`/`-`
- [ ] Les paramètres Mode/Présence/Moment utilisent des chips/boutons segmentés
- [ ] "Phase" est renommé "Moment" ; labels présence mis à jour
- [ ] Toutes les cibles tactiles ≥ 44×44px
- [ ] Les tests existants passent après mise à jour des snapshots

---

## Risques & Mitigations

| Risque | Mitigation |
|---|---|
| Casser les snapshots existants | Mettre à jour tous les snapshots en même temps que les changements visuels |
| Le composant `BlindActionsBar` nécessite des nouveaux endpoints API | Vérifier : Open/Stop/Close existent dans `APIconstants.ts`; si non, les ajouter |
| Le composant `Picker` (dropdown) peut être difficile à remplacer | Utiliser `TouchableOpacity` avec `StyleSheet` pour les chips — éviter des dépendances externes |
| La valeur "mesurée" du thermostat peut ne pas être disponible dans le modèle actuel | Vérifier `DomoticzThermostat` et si besoin enrichir le modèle ou lire depuis les températures du contexte |
| Contraste : couleur domoticz `#339a9a` peut ne pas passer 4,5:1 sur `#151718` | Vérifier avec un outil de contraste — ajuster la luminosité si nécessaire |

---

## Ordre d'exécution recommandé

```
Phase 1 (fondamentaux) : T01 → T02 → T06/T14 (labels inactifs)
Phase 2 (lumières)     : T04 → T05
Phase 3 (volets)       : T07 → T08 → T09 → T10
Phase 4 (températures) : T11 → T12 → T13
Phase 5 (maison)       : T15 → T16 → T17 → T03
Phase 6 (accessibilité): T18 → T19 → T20
Phase QA               : QA01 à QA06
Phase Doc              : D01 → D02
```
