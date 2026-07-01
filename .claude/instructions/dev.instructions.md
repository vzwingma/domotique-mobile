---
description: Spécificités projet domoticz-mobile pour l'agent 🔵 DEVon (dev)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile (Dev)

> Fichier lu auto par agent 🔵 DEVon au démarrage. Contient specs projet `domoticz-mobile`
> (Application mobile React Native / Expo pour piloter Domoticz).

## Workflow

1. Récupère tes tâches (`🔵 DEVon` / `Agent: DEVon`) dans le **Plan d'Action** actif (`.claude/plans/`).
2. Vérifie que les dépendances sont livrées avant de commencer.
3. Implémente selon conventions ci-dessous ; ne pas élargir le scope.
4. Signale la complétion (rapport `PHASE_N_*.md`) puis relaie vers `🟢 QALvin` / `🟣 DOCly`.

Procédure détaillée : skill `plan-phase-execution`.

## Stack technique

- **React Native 0.85.3 / Expo ~56** – TypeScript strict, composants fonctionnels uniquement
- **UI** : Composants React Native natifs (`View`, `Text`, `TouchableOpacity`, etc.) – seule lib UI autorisée, aucune lib externe
- **expo-router ~56.2.11** – Routage basé fichiers, routes dans `app/(tabs)/_layout.tsx`
- **Authentification** : Basic Auth via `EXPO_PUBLIC_DOMOTICZ_AUTH` (Base64) – pas manipuler direct dans composants
- **@react-native-community/slider** – Sliders (volets, niveaux lumineux)
- **uuid ^14.0.0** – Génération `traceId` pour appels HTTP

## Conventions de code

### Composants

```typescript
// Toujours : composant fonctionnel typé
export const MonComposant: React.FC<MonComposantProps> = ({ prop1, prop2 }): JSX.Element => {
  // ...
};
```

- Props typées `export type XxxProps = { ... }` en tête fichier `*.component.tsx`.
- Sous-composants dans `app/components/`, styles via `StyleSheet.create()` en bas fichier.
- `useMemo` pour calculs dérivés coûteux, `useCallback` pour handlers passés en props.
- `React.memo` pour composants fréquemment re-rendus (ex: `DeviceCard`, `FavoriteCard`).
- Responsive via `StyleSheet.create()` avec dimensions relatives (pas valeurs fixes codées en dur).

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

- Classes données dans `app/models/` (ex: `domoticzDevice.model.ts`).
- État global via `useContext(DomoticzContext)` (importé depuis `app/services/DomoticzContextProvider`).
- État local UI via `useState`.

### Enums et constantes

- Constantes techniques (URLs API, paramètres) dans `app/enums/APIconstants.ts`.
- Enums métier (types appareils, statuts, labels) dans `app/enums/DomoticzEnum.ts`.
- Couleurs dans `app/enums/Colors.ts`.
- Pas hardcoder URLs ou clés API dans composants.

## Ce que tu ne fais PAS

- Pas modifier fichiers `*.test.[tsx|ts]` (rôle de 🟢 QALvin).
- Pas MAJ `README.md`, `docs/`, ni `CLAUDE.md` (rôle de 🟣 DOCly).
- Pas décisions archi (nouveau Context, nouvelle lib) sans tâche 🟠 ARCos dans le Plan d'Action.

## Règle d'index des plans (obligatoire)

- `.claude/plans/README.md` limité aux **plans + statut global** (sans détail phases).
- Si travail change statut global plan, MAJ `.claude/plans/README.md` dans même changement.
