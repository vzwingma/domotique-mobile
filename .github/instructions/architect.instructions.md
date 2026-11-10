---
description: "Conventions architecturales de domoticz-mobile pour 🟠 ARCos : couches, état, accès réseau, routage, bibliothèques, intégration Domoticz, ADR et handoff à MAINa."
applyTo: "**"
---

# Conventions projet — domoticz-mobile (architecture)

## Document d'architecture

Lire `docs/ARCHITECTURE.md` avant toute proposition. Toute solution doit rester cohérente avec l'architecture existante ; signaler toute contradiction dans les questions pour 👤. Ce document décrit l'application React Native / Expo de pilotage Domoticz.

## Conventions architecturales

- **Couches** : `app/(tabs)/` et `app/components/` (UI) → `app/controllers/` → `app/services/` (état et logique métier) → `app/services/ClientHTTP.service.ts` (HTTP) → `app/enums/` (constantes et helpers).
- **État partagé** : uniquement via `DomoticzContextProvider` / `DomoticzContext` (React Context API). Ne pas créer de nouveau Context ni de gestionnaire d'état externe sans décision explicite.
- **Réseau** : tous les appels Domoticz passent par `callDomoticz()` dans `ClientHTTP.service.ts`. Aucun `fetch` direct depuis un composant ou controller.
- **Routage** : Expo Router, routage file-based ; les routes principales sont déclarées dans `app/(tabs)/_layout.tsx`.
- **UI** : composants React Native natifs ; toute bibliothèque UI ou dépendance structurante nouvelle requiert une décision d'architecture.

## Décisions d'architecture (ADR)

- Toute décision majeure (dépendance structurante, changement de pattern ou de structure, décision de sécurité) doit être documentée dans `docs/adr/NNN-titre-court.md`.
- ARCos prépare le contenu ; 🟣 DOCly rédige le fichier avec le skill `adr-writing`.

## Intégration Domoticz

- Les contrats d'API (URL, paramètres, codes retour) sont documentés dans `docs/API.md`.
- Les endpoints et paramètres sont définis dans `app/enums/APIconstants.ts` (`SERVICES_URL`, `SERVICES_PARAMS`) ; tout nouvel endpoint y est ajouté avant son implémentation.
- La configuration passe par `app.config.ts` et les variables d'environnement ; ne jamais intégrer d'URL privée, clé ou secret en dur.

## Handoff vers ⚫ MAINa

- Pour une demande de conception, comparer au moins deux options (avantages, inconvénients, risques, impacts et effort), recommander une solution et soumettre le choix à 👤.
- Après décision, fournir conception, critères de succès et découpage candidat (tâches logiques, dépendances, effort) comme entrée à MAINa.
- ARCos ne crée ni Plan d'Action ni tâches ; MAINa formalise et orchestre le plan.

## Règle d'index des plans

`.github/plans/README.md` est un index synthétique (plans et statut global uniquement). Toute création de plan ou modification de statut global doit le mettre à jour dans le même changement ; ne pas y détailler les phases.
