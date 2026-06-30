---
description: Spécificités projet domoticz-mobile pour l'agent ARCos (architect)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile

> Fichier auto-lu par agent 🟠 ARCos au démarrage.
> Contient les spécificités projet `domoticz-mobile`, application Expo / React Native / TypeScript pour piloter Domoticz.

## Lecture du document d'architecture

Au démarrage, lis `docs/ARCHITECTURE.md` si présent :
- Comprendre stack technique, couches applicatives, composants clés et flux de données.
- Assurer cohérence des décisions avec l'architecture existante.
- Signaler toute contradiction entre la demande et l'architecture documentée.

## Conventions architecturales

- **Couches** : `app/(tabs)/` et `app/components/` (UI) -> `app/controllers/` (orchestration UI/métier) -> `app/services/` (HTTP, état, logique métier) -> `app/models/` et `app/enums/` (données, constantes).
- **État global** : uniquement via `DomoticzContextProvider` / `DomoticzContext`. Ne pas créer de nouveau Context sans décision validée.
- **HTTP** : toujours via `app/services/ClientHTTP.service.ts` et `callDomoticz()`. Pas de `fetch` direct dans les composants.
- **Routing** : `expo-router` file-based. Les nouvelles routes s'ajoutent dans `app/`, avec les onglets principaux dans `app/(tabs)/`.
- **State management** : pas de bibliothèque externe sans décision architecturale explicite.
- **UI** : React Native / Expo et composants existants. Ne pas introduire de bibliothèque UI majeure sans ADR.
- **Configuration** : variables publiques Expo via `EXPO_PUBLIC_*`, configuration native dans `app.json`, `app.config.js` et `eas.json`.

## Documentation des décisions architecturales (ADR)

Chaque décision architecturale majeure doit produire un ADR dans `docs/adr/` :
- Nommage : `docs/adr/NNN-titre-court.md`.
- Contenu minimal : contexte, décision, alternatives considérées, conséquences.
- Créer un ADR pour nouveau framework, changement de pattern architectural, décision sécurité, routing, state management, stratégie HTTP ou build natif.
- Préparer le contenu et déléguer la rédaction à DOCly après validation humaine.

## Intégration Domoticz

- Domoticz est le partenaire externe principal, via API REST HTTP.
- Les endpoints sont centralisés dans `app/enums/DomoticzEndpoints.enum.ts` et documentés dans `docs/API.md`.
- Les appels passent par `ClientHTTP.service.ts` avec Basic Auth et gestion d'erreurs.
- Toute nouvelle intégration endpoint doit préciser : URL, paramètres, méthode, réponse attendue, erreurs, impact modèle/service/test.

## Agents du projet

| Icône | Nom | Fichier agent | Rôle |
|---|---|---|---|
| ⚫ | MAINa | `Maina.agent.md` | Orchestration et Plan d'Action |
| 🔵 | DEVon | `Devon.agent.md` | Implémentation Expo / React Native / TypeScript |
| 🟢 | QALvin | `Qalvin.agent.md` | Tests unitaires Jest / Testing Library React Native |
| 🟣 | DOCly | `Docly.agent.md` | Documentation README, docs et ADR |

## Règles de planification

- Pour initiative majeure, fournir à MAINa un découpage candidat en tâches architecture, dev, QA et documentation.
- Les tâches doivent citer les fichiers ou dossiers cibles quand ils sont connus.
- Les critères de succès doivent être vérifiables par commande, test, revue humaine ou documentation.
- Si `.opencode/plans/README.md` existe dans une initiative future, le maintenir comme index synthétique plans + statut global uniquement.
