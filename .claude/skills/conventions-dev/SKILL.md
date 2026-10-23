---
name: conventions-dev
description: "Conventions de développement du projet domoticz-mobile pour 🔵 DEVon : stack et versions, structure, conventions de code, accès réseau, modèles, commandes de vérification. Prioritaire sur le générique."
user-invocable: false
---

# Conventions projet — domoticz-mobile (développement)

> Projet : `domoticz-mobile` — application mobile React Native / Expo (Android + Web) pour piloter un serveur Domoticz.

## Stack technique

- **TypeScript ~6.0 (strict)** — composants fonctionnels uniquement
- **React Native 0.85.3 / React 19.2.3 / Expo SDK ~56.0.23** — dépendances Expo alignées via `npm run expo:fix`
- **expo-router ~56.2.21** — routage file-based, onglets dans `app/(tabs)/_layout.tsx`
- **UI** : composants React Native natifs (`View`, `Text`, `TouchableOpacity`…) — aucune bibliothèque UI externe
- **Authentification** : Basic Auth via `EXPO_PUBLIC_DOMOTICZ_AUTH` (Base64), gérée par `ClientHTTP.service.ts` —
  jamais manipulée dans les composants
- Utilitaires : `@react-native-community/slider` (volets, niveaux), `uuid` (`traceId` des appels HTTP),
  `expo-screen-orientation` (verrou paysage tablette)

## Commandes de vérification (preuves avant handoff)

```bash
npm run typecheck                 # tsc --noEmit (TypeScript strict)
npm run lint                      # expo lint (ESLint 9 flat config)
npm test -- --watchAll=false      # tests existants (non-régression) ; `npm test` seul = mode watch
npm run validate:expo             # expo-doctor, obligatoire avant PR (ADR-001)
```

## Structure et nommage

- Code source : `app/` (`(tabs)/`, `components/`, `controllers/`, `services/`, `models/`, `enums/`) + `components/`
  et `hooks/` (réutilisables) ; organisation par couche
- Nommage fichiers : `*.component.tsx`, `*.controller.tsx`, `*.service.ts`, `*.model.ts`, `*.enum.ts` ;
  identifiants : `PascalCase` composants/types/classes, `camelCase` fonctions/variables ; alias d'import `@/`

## Conventions de code

- Composant fonctionnel typé, props `export type XxxProps = { ... }` en tête de `*.component.tsx`, styles via
  `StyleSheet.create()` en bas de fichier ; `useMemo` / `useCallback` / `React.memo` pour les cartes
  fréquemment re-rendues (`DeviceCard`, `FavoriteCard`)
- Gestion d'erreurs : `.catch()` sur les promesses `callDomoticz` + toast utilisateur (`hooks/AndroidToast.ts`) ;
  HTTP 403 → état déconnecté / réinitialisation du contexte
- Accès réseau / données : toujours via `callDomoticz()` (`callDomoticz(SERVICES_URL.GET_DEVICES)`,
  paramètres `KeyValueParams[]` avec `SERVICES_PARAMS.IDX`, `SERVICES_PARAMS.CMD`…)
- Modèles / types de données : `app/models/` — classes TS `readonly`, pas d'interfaces
- État global : `useContext(DomoticzContext)` — jamais de prop drilling ; état local UI via `useState`
- Constantes techniques : `app/enums/APIconstants.ts` ; énumérations métier : `app/enums/DomoticzEnum.ts` ;
  couleurs : `app/enums/Colors.ts` (thème sombre uniquement)
- Labels UI en français : « Allumé/Éteint », « Ouvert/Fermé », « Déconnecté », « Mixte » — jamais « On/Off »
- Responsive : rendu téléphone (< 600dp) inchangé ; dimensions relatives, pas de tailles fixes codées en dur
- Jamais d'URL, clé ou secret en dur dans le code.

## Ce que DEVon ne fait PAS

- Modifier les fichiers de test `*.test.ts(x)` / `__tests__/` (rôle 🟢 QALvin).
- Mettre à jour `README.md`, `docs/`, `CHANGELOG.md` ou les instructions d'agents (rôle 🟣 DOCly).
- Introduire une dépendance ou un pattern structurant (nouveau Context, nouvelle lib) sans tâche 🟠 ARCos dans le Plan d'Action.
