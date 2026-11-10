---
description: "Conventions de développement de domoticz-mobile pour 🔵 DEVon : React Native, Expo, TypeScript, structure, appels Domoticz, modèles et commandes de vérification."
applyTo: "**"
---

# Conventions projet — domoticz-mobile (développement)

## Workflow

1. Repérer le todo de développement `pending` sans dépendance bloquante et le passer à `in_progress`.
2. Implémenter uniquement le périmètre validé dans le Plan d'Action.
3. Vérifier typecheck, lint et tests existants ; consigner commandes et résultats dans le handoff.
4. Passer le todo à `done` lorsque l'implémentation est prête pour Gate #2.

```sql
SELECT t.* FROM todos t
WHERE t.status = 'pending'
AND (t.id LIKE '%-dev' OR t.description LIKE '%owner: dev%')
AND NOT EXISTS (
  SELECT 1 FROM todo_deps td
  JOIN todos dep ON td.depends_on = dep.id
  WHERE td.todo_id = t.id AND dep.status != 'done'
);
```

## Stack technique

- **TypeScript strict**, React `19.2.3`, React Native `0.85.3`, Expo `~56.0.24` ; composants fonctionnels uniquement.
- **Routage** : `expo-router ~56.2.22`, file-based dans `app/`.
- **UI** : composants React Native natifs ; ne pas ajouter de bibliothèque UI.
- **Auth** : Basic Auth configurée via `app.config.ts` et `EXPO_PUBLIC_DOMOTICZ_AUTH` ; ne pas manipuler les identifiants dans les composants.
- **Bibliothèques existantes** : `@react-native-community/slider` pour les sliders ; `uuid ^14` pour les `traceId`.

## Commandes de vérification

```bash
npm run typecheck
npm run lint
npm test -- --watchAll=false
```

Utiliser une commande de build uniquement si le plan ou le changement en requiert une. Le handoff indique les commandes réellement exécutées et leurs résultats.

## Structure et nommage

- Écrans Expo Router : `app/(tabs)/` ; composants métier : `app/components/*.component.tsx`.
- Controllers : `app/controllers/*.controller.tsx` ; services : `app/services/*.service.ts`.
- Modèles : classes dans `app/models/*.model.ts` ; constantes et enums dans `app/enums/`.
- Tests `*.test.ts` / `*.test.tsx` : responsabilité de 🟢 QALvin.

## Conventions de code

- Props de composants : `export type XxxProps`; composants fonctionnels typés ; styles avec `StyleSheet.create()`.
- Utiliser `useMemo`, `useCallback` et `React.memo` selon les patterns existants ; garder l'UI responsive.
- Les classes de modèles ont des propriétés explicites et immuables quand pertinent. État partagé via `DomoticzContextProvider`, état d'interface local via hooks React.
- Controllers utilisent les callbacks du Context et les chaînes de promesses `.then().catch()` ; signaler les erreurs via `AndroidToast` selon les patterns existants.
- Tous les appels réseau passent par `callDomoticz()` dans `ClientHTTP.service.ts`, jamais par `fetch` dans UI/controllers.
- Constantes API : `app/enums/APIconstants.ts`; enums métier : `app/enums/DomoticzEnum.ts`; couleurs : `app/enums/Colors.ts`.
- Ne jamais coder en dur une URL, une clé ou un secret.

Exemple d'appel : `callDomoticz(SERVICES_URL.GET_DEVICES)` ; ajouter les paramètres via `KeyValueParams` pour les substitutions d'endpoint.

## Ce que DEVon ne fait pas

- Ne modifie ni n'écrit les tests ; rôle de 🟢 QALvin.
- Ne met pas à jour README, `docs/`, wiki ou instructions d'agents ; rôle de 🟣 DOCly.
- Ne prend pas de décision architecturale et n'ajoute pas de dépendance structurante sans décision 🟠 ARCos validée.
- Ne corrige pas de problème préexistant sans lien direct avec l'implémentation.

## Règle d'index des plans

`.github/plans/README.md` liste les plans et leur statut global uniquement. Si l'implémentation change ce statut, mettre l'index à jour dans le même changement.
