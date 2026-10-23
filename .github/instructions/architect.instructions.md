---
description: "Conventions architecturales du projet domoticz-mobile pour 🟠 ARCos : couches, état, accès réseau, routage, bibliothèques autorisées, intégrations externes. Prioritaire sur le générique."
applyTo: "**"
---

# Conventions projet — domoticz-mobile (architecture)

> Projet : `domoticz-mobile` — application mobile React Native / Expo (Android + Web) pour piloter un serveur Domoticz.

## Document d'architecture

Lire `docs/ARCHITECTURE.md` : stack, couches, composants clés, § Responsive. Toute proposition doit rester
cohérente avec l'existant et les ADR (`docs/adr/`, ADR-001 → ADR-014).

## Conventions architecturales

- **Couches** : `app/(tabs)/` + `app/components/` (UI) → `app/controllers/` (pont UI/services) →
  `app/services/` (`ClientHTTP.service.ts`, `DomoticzContextProvider`, `DataUtils`) → `app/enums/` + `app/models/`
  (constantes, endpoints, classes de données). Réutilisables génériques : `components/`, `hooks/`.
- **État partagé** : uniquement via `DomoticzContextProvider` (React Context API, `useContext(DomoticzContext)`) ;
  pas de nouveau Context ni de bibliothèque de state management externe sans décision explicite (ADR).
- **Accès réseau / données** : toujours via `callDomoticz()` de `app/services/ClientHTTP.service.ts` ; pas de
  `fetch` direct depuis un composant ou un controller. Pas de cache HTTP persistant (ADR-004/005).
- **Routage / points d'entrée** : Expo Router (file-based), onglets déclarés dans `app/(tabs)/_layout.tsx`.
- **Responsive** : téléphone (< 600dp) = référence immuable ; tablette (plus petit côté ≥ 600dp) verrouillée
  paysage, onglets fusionnés 2 colonnes (`hooks/useTabletLayout.ts`, `app/services/TabGroups.service.ts`,
  ADR-013/014).
- **Bibliothèques autorisées** : composants React Native natifs (`View`, `Text`, `TouchableOpacity`…) +
  dépendances déjà présentes dans `package.json` (`@react-native-community/slider`,
  `react-native-element-dropdown`, `react-native-svg`, `@expo/vector-icons`, `uuid`…). Toute nouvelle
  dépendance structurante = décision d'architecture (ADR). Versions Expo alignées via `expo install` (ADR-012).

## Décisions d'architecture (ADR)

- Fichier `docs/adr/NNN-titre-court.md` pour chaque décision majeure : nouveau framework ou dépendance
  structurante, changement de pattern, décision de sécurité, choix de structure.
- Contenu minimal : contexte, décision, alternatives considérées, conséquences.
- ARCos prépare le contenu ; 🟣 DOCly rédige le fichier (skill `adr-writing`).

## Intégrations externes

- **Serveur Domoticz** (API JSON HTTP) : contrat (URL, paramètres, codes retour) documenté dans `docs/API.md` ;
  serveur externe, version non maîtrisée. Tout nouvel endpoint s'ajoute dans `app/enums/APIconstants.ts`
  (`SERVICES_URL`, `SERVICES_PARAMS`) avant usage par 🔵 DEVon.
- Configuration des URLs / authentification : `app/enums/APIconstants.ts` + variables d'environnement `.env`
  (`EXPO_PUBLIC_DOMOTICZ_URL`, `EXPO_PUBLIC_DOMOTICZ_AUTH`, `EXPO_PUBLIC_MY_ENVIRONMENT`), `app.config.js`, `eas.json`.
- Build / déploiement : EAS (ADR-010/011), CI GitHub Actions (`.github/workflows/`), SonarQube.

## Handoff vers ⚫ MAINa

ARCos ne crée ni tâches ni plan. Il livre : analyse comparative (≥ 2 options) + recommandation, puis
découpage **candidat** (tâches logiques + dépendances + effort) comme entrée du Plan d'Action.
