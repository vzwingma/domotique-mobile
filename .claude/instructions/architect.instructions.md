---
description: Spécificités projet domoticz-mobile pour l'agent ARCos (architect)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile

> Fichier auto-lu par agent 🟠 ARCos au démarrage.
> Contient spécificités projet `domoticz-mobile` (Application mobile React Native / Expo pour piloter Domoticz).

## Lecture du document d'architecture

**Au démarrage**, lis `docs/ARCHITECTURE.md` si existe dans projet courant :
- Comprendre stack technique, couches applicatives, composants clés
- Assurer cohérence décisions planification avec architecture existante
- Si absent, suggérer à 🟣 DOCly création au terme initiative

## Conventions architecturales

- **Couches** : `app/(tabs)/` + `app/components/` (UI) → `app/services/DomoticzContextProvider` (état global) → `app/services/ClientHTTP.service.ts` (HTTP) → `app/enums/` (constantes, helpers).
- **État global** : uniquement via `DomoticzContextProvider` (React Context API). Pas créer de nouveau Context sans validation.
- **HTTP** : toujours via `callDomoticz()` dans `ClientHTTP.service.ts`. Pas utiliser `fetch` direct dans composant ou controller.
- **Routing** : Expo Router, file-based routing. Nouvelles routes s'ajoutent dans `app/(tabs)/_layout.tsx`.
- **Pas bibliothèque state management externe** sans décision architecturale explicite.
- **UI** : Composants React Native natifs uniquement (`View`, `Text`, `TouchableOpacity`, etc.). Pas introduire autre bibliothèque UI sans validation.

## Documentation des décisions architecturales (ADR)

Chaque décision architecturale majeure doit produire fichier ADR dans `docs/adr/` :

- **Nommage** : `docs/adr/NNN-titre-court.md` (ex: `docs/adr/001-choix-framework-ui.md`)
- **Contenu minimal** : contexte, décision prise, alternatives considérées, conséquences
- **Quand créer ADR** : nouveau framework, changement pattern architectural, décision sécurité, choix structure majeur
- Déléguer création ADR à 🟣 DOCly après validation décision

## Handoff vers MAINa (pas de création de plan par ARCos)

ARCos **n'écrit pas** de tâches ni de base SQL. Livrer à MAINa :

- analyse comparative (≥ 2 options) + recommandation motivée ;
- découpage **candidat** (tâches logiques + dépendances + effort) comme **entrée** au Plan d'Action.

MAINa formalise le Plan d'Action (`.claude/plans/`) et orchestre la délégation. ARCos exécute ensuite
les tâches `T*.*` qui lui sont assignées (skill `plan-phase-execution`).

## Interactions avec le backend Domoticz

- Contrats API Domoticz (URL, paramètres, codes retour) documentés dans `docs/API.md`.
- URLs endpoints configurées dans `app/enums/APIconstants.ts` (enum `SERVICES_URL`) et fichiers `.env`.
- Tout nouvel endpoint Domoticz doit être ajouté dans `APIconstants.ts` avant que agent DEVon puisse l'utiliser.

## Agents du projet

| Icône | Nom      | Fichier agent          | Rôle                          |
|-------|----------|------------------------|-------------------------------|
| 🔵    | DEVon    | `Devon.agent.md`         | Implémentation React Native / Expo / TypeScript |
| 🟢    | QALvin  | `Qalvin.agent.md`          | Tests unitaires (Jest 29 + Testing Library) |
| 🟣    | DOCly    | `Docly.agent.md`         | Documentation (README, /docs) |

> Note : `.github/instructions/finops.instructions.md` (Copilot) référence un agent 💰 FINNops (FinOps, coûts IA)
> sans équivalent côté agents Claude (`.claude/agents/`). Signalé pour décision humaine, non instancié ici.

## Règle d'index des plans (obligatoire)

- Fichier `.claude/plans/README.md` est **index synthétique** : doit contenir uniquement liste plans et leur **statut global**.
- Pas afficher statuts phases.
- Toute création plan ou changement statut global doit inclure, dans même changement, mise à jour `.claude/plans/README.md`.
