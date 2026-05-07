---
description: Spécificités projet domoticz-mobile pour l'agent 🔵 DEVon (dev)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile (Dev)

> Ce fichier est lu automatiquement par l'agent 🔵 DEVon au démarrage.
> Il contient uniquement les spécificités du projet `domoticz-mobile` (Application mobile React Native / Expo pour piloter Domoticz).

## Workflow

1. Consulte la table SQL `todos` pour trouver les tâches `owner = 'dev'` dont le statut est `pending` et sans dépendances bloquantes.
2. Passe le todo en `in_progress` avant de commencer.
3. Implémente la fonctionnalité en respectant les conventions ci-dessous.
4. Passe le todo en `done` une fois le code prêt.

```sql
-- Trouver les tâches dev disponibles
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

- **React Native 0.83.6 / Expo ~55** – TypeScript strict, composants fonctionnels uniquement
- **UI** : Composants React Native natifs (`View`, `Text`, `TouchableOpacity`, etc.) — aucune lib UI externe
- **expo-router ~55.0.12** – Routage basé sur les fichiers, routes dans `app/(tabs)/_layout.tsx`
- **Authentification** : Basic Auth via `EXPO_PUBLIC_DOMOTICZ_AUTH` (Base64) — ne pas manipuler dans les composants
- **@react-native-community/slider** – Sliders (volets, niveaux lumineux)
- **uuid ^14.0.0** – Génération de `traceId` pour les appels HTTP

## Conventions de code

### Composants

```typescript
// Toujours : composant fonctionnel typé
export const MonComposant: React.FC<MonComposantProps> = ({ prop1, prop2 }): JSX.Element => {
  // ...
};
```

- Props typées sous la forme `export type XxxProps = { ... }` en tête du fichier `*.component.tsx`.
- Sous-composants dans `app/components/`, styles via `StyleSheet.create()` en bas du fichier.
- Utiliser `useMemo` pour les calculs dérivés coûteux, `useCallback` pour les handlers passés en props.
- `React.memo` pour les composants fréquemment re-rendus (ex : `DeviceCard`, `FavoriteCard`).
- Responsive via `StyleSheet.create()` avec dimensions relatives (pas de valeurs fixes codées en dur).

### Appels HTTP

```typescript
// Toujours passer par callDomoticz()
import callDomoticz from '@/app/services/ClientHTTP.service';
import { SERVICES_URL, SERVICES_PARAMS, KeyValueParams } from '@/app/enums/APIconstants';

// Appel simple
callDomoticz(SERVICES_URL.GET_DEVICES)
  .then(data => { /* ... */ })
  .catch(err => showToast(err.message, ToastDuration.SHORT));

// Appel avec paramètres de remplacement (<IDX>, <CMD>, etc.)
const params: KeyValueParams[] = [
  { key: SERVICES_PARAMS.IDX, value: String(device.idx) },
  { key: SERVICES_PARAMS.CMD, value: 'On' },
];
callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_ON_OFF, params);
```

### Modèles et état

- Les classes de données vont dans `app/models/` (ex : `domoticzDevice.model.ts`).
- L'état global via `useContext(DomoticzContext)` (importé depuis `app/services/DomoticzContextProvider`).
- L'état local UI via `useState`.

### Enums et constantes

- Constantes techniques (URLs API, paramètres) dans `app/enums/APIconstants.ts`.
- Enums métier (types d'appareils, statuts, labels) dans `app/enums/DomoticzEnum.ts`.
- Couleurs dans `app/enums/Colors.ts`.
- Ne pas hardcoder les URLs ou les clés API dans les composants.

## Ce que tu ne fais PAS

- Ne modifie pas les fichiers `*.test.[tsx|ts]` (rôle de 🟢 QUALvin).
- Ne mets pas à jour `README.md`, les wikis, ni `copilot-instructions.md` (rôle de 🟣 DOCly).
- Ne prends pas de décisions architecturales (nouveau Context, nouvelle lib) sans todo venant de 🟠 ARCos.

## Règle d'index des plans (obligatoire)

- `.github/plans/README.md` doit rester limité aux **plans + statut global** (sans détail de phases).
- Si ton travail change le statut global d'un plan, mets à jour `.github/plans/README.md` dans le même changement.

