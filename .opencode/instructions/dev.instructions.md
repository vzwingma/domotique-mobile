---
description: Spécificités projet domoticz-mobile pour l'agent 🔵 DEVon (dev)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile (Dev)

> Fichier lu automatiquement par agent 🔵 DEVon au démarrage.
> Contient les spécificités projet `domoticz-mobile`, application Expo / React Native / TypeScript pour piloter Domoticz.

## Workflow

1. Lire `AGENTS.md`, `docs/ARCHITECTURE.md` et le scope transmis par MAINa.
2. Identifier les fichiers à modifier et les patterns existants similaires.
3. Implémenter uniquement le périmètre validé.
4. Exécuter une vérification ciblée quand possible.
5. Livrer la liste des fichiers modifiés, hypothèses et commandes exécutées.

## Stack technique

- **Expo SDK `~56.0.12`** avec React Native `0.85.3`.
- **React `19.2.3`** et composants fonctionnels TypeScript.
- **TypeScript `~6.0.3` strict** via `tsconfig.json`.
- **expo-router `~56.2.11`** : file-based routing, routes dans `app/`.
- **AsyncStorage `2.2.0`** pour stockage local existant.
- **React Native SVG / Vector Icons** pour icônes et visuels existants.

## Conventions de code

### Composants

```typescript
export type MonComposantProps = {
  readonly label: string;
};

export function MonComposant({ label }: MonComposantProps) {
  return <ThemedText>{label}</ThemedText>;
}
```

- Composants métier dans `app/components/` avec suffixe `.component.tsx` quand le pattern existe.
- Composants génériques dans `components/`.
- Props typées près du composant ou selon le pattern du fichier existant.
- Garder le rendu orienté React Native (`View`, `Text`, `Pressable`, `StyleSheet`).
- Responsive via APIs React Native, Safe Area et styles existants ; ne pas ajouter de framework CSS.

### Controllers

- Controllers dans `app/controllers/` avec suffixe `.controller.tsx`.
- Les controllers relient UI, services, contexte et modèles.
- Les composants ne doivent pas contenir de logique HTTP ou métier complexe.

### Appels HTTP

```typescript
import { ClientHTTP } from '../services/ClientHTTP.service';

await clientHTTP.callDomoticz(endpoint, params);
```

- Toujours passer par `app/services/ClientHTTP.service.ts`.
- Ne pas appeler `fetch` directement depuis les composants.
- Endpoints et constantes dans `app/enums/`.
- Gérer explicitement erreurs réseau, timeout et données absentes selon les patterns existants.

### Modèles et état

- Classes données dans `app/models/`.
- État global via `DomoticzContextProvider` / `DomoticzContext` dans `app/services/`.
- État local UI via `useState` ou hooks existants.
- Pas de nouveau state manager sans validation ARCos.

### Enums et constantes

- Endpoints Domoticz dans `app/enums/DomoticzEndpoints.enum.ts`.
- Types métier dans `app/enums/`.
- Configuration publique via `EXPO_PUBLIC_*`, `app.config.js`, `app.json` ou `eas.json` selon le besoin.
- Ne pas hardcoder URL, token ou identifiants.

## Commandes utiles

```bash
npm run typecheck
npm run lint
npm test -- path/to/file.test.tsx
npm run validate:expo
```

## Ce que tu ne fais PAS

- Ne pas modifier les tests sauf demande explicite de MAINa ou de l'utilisateur.
- Ne pas mettre à jour README, `docs/` ou changelog sauf demande explicite.
- Ne pas prendre de décision architecture majeure sans ARCos.
- Ne pas introduire de nouvelle bibliothèque sans validation.
- Ne pas élargir le scope pour refactoriser du code non lié.
