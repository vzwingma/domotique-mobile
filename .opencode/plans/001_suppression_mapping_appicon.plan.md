# Plan d'Action : Suppression du mapping AppIcon

**Document :** `.opencode/plans/001_suppression_mapping_appicon.plan.md`  
**Date de creation :** 2026-07-01  
**Statut :** Complete  
**Objectif Prioritaire :** MEDIUM

---

## Objectif Global

Simplifier la gestion des icones React Native en supprimant le wrapper `AppIcon.tsx` et son mapping de noms Ionicons vers `MaterialCommunityIcons`.

Les composants appelants doivent injecter directement les composants et noms d'icones `MaterialCommunityIcons`, sans nouvelle dependance et sans impact sur controllers, services, modeles ou API Domoticz.

---

## Phase 1 - Cadrage et analyse

### Contexte
- `components/AppIcon.tsx` centralisait un mapping entre noms Ionicons et `MaterialCommunityIcons`.
- Le mapping ajoutait une abstraction couteuse pour des usages UI localises.
- `MaterialCommunityIcons` etait deja utilise directement ailleurs dans le projet.

### Criteres de Reussite
- Le besoin est cadre et valide par l'humain.
- Les fichiers appelants de `AppIcon` sont identifies.
- La necessite ARCos est evaluee.

### Taches (Agent: MAINa)

#### T1.1 - Identifier les usages AppIcon
- **Fichier(s) :** `components/AppIcon.tsx`, `components/**`, `app/components/**`
- **Couvrir / Implementer :**
  - Rechercher `AppIcon`, `mapAppIconName` et les noms Ionicons dependants.
  - Lister les composants et tests impactes.
- **Acceptation :** Liste complete des fichiers a modifier.

#### T1.2 - Valider le plan avec l'humain
- **Fichier(s) :** Conversation OpenCode
- **Couvrir / Implementer :**
  - Proposer suppression de `AppIcon.tsx`.
  - Clarifier le cas Volets et `reorder-four`.
- **Acceptation :** Validation explicite utilisateur avant implementation.

---

## Phase 2 - Refactor UI

### Contexte
- Le changement reste local a la couche UI.
- Aucun changement structurel n'est requis sur services, controllers, state global ou routing.
- ARCos n'est pas requis pour ce refactor cible.

### Criteres de Reussite
- Aucun import `AppIcon` ne subsiste.
- Aucun mapping `reorder-four` ou `mapAppIconName` ne subsiste.
- Les noms d'icones passes sont des noms `MaterialCommunityIcons` directs.

### Taches (Agent: DEVon)

#### T2.1 - Remplacer AppIcon dans la navigation
- **Fichier(s) :**
  - `components/navigation/TabBarIcon.tsx`
  - `components/navigation/TabBarItem.tsx`
  - `components/navigation/TabHeaderIcon.tsx`
- **Couvrir / Implementer :**
  - Importer `MaterialCommunityIcons` directement.
  - Typer les props avec `ComponentProps<typeof MaterialCommunityIcons>`.
  - Remplacer `bulb`, `thermometer-sharp`, `home-sharp` par les noms MCI directs.
  - Supprimer la generation automatique par suffixe pour les noms non compatibles.
  - Supprimer `reorder-four` et utiliser une icone MCI directe pour l'onglet/header Volets.
- **Acceptation :** La navigation ne depend plus de `AppIcon`.

#### T2.2 - Remplacer AppIcon dans les icones metier
- **Fichier(s) :**
  - `components/IconDomoticzParametre.tsx`
  - `components/IconDomoticzThermostat.tsx`
- **Couvrir / Implementer :**
  - Utiliser `MaterialCommunityIcons` directement.
  - Retourner des noms MCI directs dans `getIconDomoticzParametre`.
  - Remplacer `flame` par `fire`.
- **Acceptation :** Les composants metier n'utilisent plus de mapping intermediaire.

#### T2.3 - Supprimer AppIcon
- **Fichier(s) :**
  - `components/AppIcon.tsx`
  - `components/__tests__/AppIcon.test.tsx`
- **Couvrir / Implementer :**
  - Supprimer le wrapper et son test dedie au mapping.
- **Acceptation :** `AppIcon` et `mapAppIconName` ne sont plus presents dans le codebase.

---

## Phase 3 - Validation qualite

### Contexte
- Les tests impactes doivent verifier les noms MCI directs plutot que l'ancien wrapper.
- Les validations ciblees suffisent pour ce refactor local, avec `typecheck` et `lint` en garde-fous.

### Criteres de Reussite
- Tests cibles passants.
- TypeScript strict passant.
- Lint sans erreur.
- Aucune reference residuelle a `AppIcon`, `mapAppIconName` ou `reorder-four`.

### Taches (Agent: QALvin)

#### T3.1 - Adapter les tests de navigation
- **Fichier(s) :** `components/__tests__/TabBarItem.test.tsx`
- **Couvrir / Implementer :**
  - Mock de `MaterialCommunityIcons` au lieu de `AppIcon`.
  - Assertions sur `lightbulb`, `lightbulb-outline` et l'icone directe Volets.
- **Acceptation :** La suite `TabBarItem` passe.

#### T3.2 - Executer les validations ciblees
- **Fichier(s) :** N/A
- **Couvrir / Implementer :**
  - `npm test -- --watchAll=false components/__tests__/TabBarItem.test.tsx app/components/__tests__/paramList.component.test.tsx`
  - `npm run typecheck`
  - `npm run lint`
- **Acceptation :** Tests et typecheck passants ; lint sans erreur.

---

## Resume des Taches par Agent

### MAINa Agent
- T1.1 a T1.2 : cadrage, analyse des usages et validation humaine.
- **Livrable :** Plan d'action valide et decision ARCos non requis.
- **Statut :** Complete.

### DEVon Agent
- T2.1 a T2.3 : refactor UI, suppression de `AppIcon`, injection directe MCI.
- **Livrable :** Code simplifie sans mapping central.
- **Statut :** Complete.

### QALvin Agent
- T3.1 a T3.2 : tests adaptes et validations ciblees.
- **Livrable :** Tests cibles, typecheck et lint executes.
- **Statut :** Complete.

### DOCly Agent
- Non requis : refactor interne UI sans changement documentaire produit/API.
- **Statut :** Non applicable.

---

## Dependances entre Phases

```text
Phase 1 (Cadrage et analyse)
    -> Phase 2 (Refactor UI) <- validation humaine requise
    -> Phase 3 (Validation qualite)
```

---

## Criteres de Succes Globaux

1. `components/AppIcon.tsx` supprime.
2. `components/__tests__/AppIcon.test.tsx` supprime.
3. Aucun usage `AppIcon`, `mapAppIconName` ou `reorder-four` restant.
4. Les composants appelants injectent directement `MaterialCommunityIcons` et les noms MCI.
5. Tests cibles passants.
6. `npm run typecheck` passant.
7. `npm run lint` sans erreur.

---

## Plan d'Execution

1. MAINa cadre le besoin et produit le plan.
2. Validation humaine du plan et des choix Volets.
3. DEVon applique le refactor UI minimal.
4. QALvin adapte les tests et execute les validations.
5. Cloture sans phase DOCly sauf demande documentaire explicite.
