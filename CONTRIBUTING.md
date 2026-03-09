# Guide de contribution — domoticz-mobile

## Prérequis

- **Node.js** 21 ou supérieur
- **npm** 6 ou supérieur
- **Expo CLI** : `npm install -g expo-cli`

## Installation locale

```bash
git clone https://github.com/vzwingma/domoticz-mobile.git
cd domoticz-mobile
npm install
```

Créez un fichier `.env.local` à la racine (non versionné) :

```env
EXPO_PUBLIC_DOMOTICZ_URL=http://<ip-domoticz>:<port>/
EXPO_PUBLIC_DOMOTICZ_AUTH=<Base64 de login:password>
```

> Générer la valeur Base64 : `echo -n "login:password" | base64`

## Conventions de nommage

| Type          | Suffixe / Extension       | Dossier                |
|---------------|---------------------------|------------------------|
| Composant écran | `*.component.tsx`       | `app/components/`      |
| Service         | `*.service.ts`          | `app/services/`        |
| Controller      | `*.controller.tsx`      | `app/controllers/`     |
| Modèle          | `*.model.ts`            | `app/models/`          |
| Test            | `*-test.tsx` / `*.test.tsx` | `__tests__/`       |

## TypeScript

- Mode **strict** activé (`tsconfig.json`).
- Utiliser des **classes** (pas des interfaces) pour les modèles de données Domoticz.
- Propriétés immuables marquées `readonly`.
- Props typées : `export type XxxProps = { ... }`, composants : `React.FC<XxxProps>`.

## Tests

```bash
npm test                                       # Jest en mode watch
npm test -- path/to/file.test.tsx              # Un fichier précis
npm test -- --testNamePattern="nom du test"    # Par nom
npm run lint                                   # ESLint
```

- Preset : **jest-expo** (snapshot testing + tests unitaires).
- Tout nouveau service ou controller doit être accompagné de tests unitaires.
- Pas de tests d'intégration ni E2E pour l'instant.

## Processus de contribution

1. **Forker** le dépôt et cloner votre fork.
2. **Créer une branche** explicite : `feature/ma-fonctionnalite` ou `fix/mon-correctif`.
3. **Implémenter** en respectant les conventions ci-dessus.
4. **Tester** : `npm test` et `npm run lint` doivent passer sans erreur.
5. **Soumettre une Pull Request** avec une description claire des changements.

> Pour les détails architecturaux complets (flux de données, API, gestion d'état),  
> référez-vous à [`.github/copilot-instructions.md`](./.github/copilot-instructions.md).
