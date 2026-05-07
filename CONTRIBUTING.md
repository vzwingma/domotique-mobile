# Guide de Contribution — domoticz-mobile

Merci de contribuer à **domoticz-mobile** ! Ce guide vous aide à comprendre le processus de contribution, les conventions de code, et comment soumettre vos changements.

**Contenu :**
1. [Prérequis](#-prérequis)
2. [Installation Locale](#-installation-locale)
3. [Git Workflow](#-git-workflow)
4. [Conventions de Nommage](#-conventions-de-nommage)
5. [TypeScript & Code Style](#-typescript--code-style)
6. [Running Tests](#-running-tests)
7. [Linting & Formatting](#-linting--formatting)
8. [Soumettre une Pull Request](#-soumettre-une-pull-request)
9. [Commit Message Format](#-commit-message-format)
10. [Labels & Issues](#-labels--issues)
11. [Architecture & Ressources](#-architecture--ressources)

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- **Git** ([guide](https://git-scm.com/))
- **Node.js** 21 ou supérieur ([télécharger](https://nodejs.org/))
- **npm** 6 ou supérieur (inclus avec Node.js)
- **Expo CLI** : `npm install -g expo-cli`

Vérifier les versions :

```bash
git --version      # git version 2.x+
node --version     # v21.0.0+
npm --version      # v6.0.0+
expo --version     # 52.x+
```

---

## 🚀 Installation Locale

### Étape 1 : Forker et cloner le dépôt

```bash
# Fork sur GitHub (cliquer "Fork" sur https://github.com/vzwingma/domoticz-mobile)

# Cloner votre fork
git clone https://github.com/YOUR_USERNAME/domoticz-mobile.git
cd domoticz-mobile

# Ajouter le remote upstream (pour rester à jour)
git remote add upstream https://github.com/vzwingma/domoticz-mobile.git
git remote -v  # Vérifier: origin (fork) et upstream (original)
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

### Étape 3 : Configurer l'environnement

Créez un fichier `.env.local` à la racine (non versionné) :

```env
# URL du serveur Domoticz (inclure le port)
EXPO_PUBLIC_DOMOTICZ_URL=http://192.168.1.100:8080/

# Authentification Basic Auth (login:password en Base64)
# echo -n "monlogin:monmotdepasse" | base64
EXPO_PUBLIC_DOMOTICZ_AUTH=bW9ubG9naW46bW9ubW90ZGVwYXNzZQ==

# Environnement (optionnel)
EXPO_PUBLIC_MY_ENVIRONMENT=development

# Domaine Domoticz si HTTPS (optionnel)
# EXPO_PUBLIC_DOMOTICZ_DOMAIN=192.168.1.100
```

### Étape 4 : Lancer l'application

```bash
npm start                # Expo Go (développement rapide)
npm run web              # Navigateur Web
npm run android          # Build Android natif (avec SSL)
```

---

## 🌿 Git Workflow

### Branche Strategy

```
main                    # Production-ready (release branch)
 ├── develop            # Intégration (base pour feature branches)
 │    ├── feature/auth-system
 │    ├── feature/light-control
 │    ├── fix/ssl-bug
 │    └── ...
 └── (tags: v3.0.0, v2.1.0, etc.)
```

### Processus de branche

1. **Toujours** partir de `develop` :

```bash
git fetch upstream              # Récupérer les derniers changements
git checkout develop
git pull upstream develop
```

2. **Créer une branche feature/fix explicite** :

```bash
# Feature
git checkout -b feature/ma-fonctionnalite

# Bug fix
git checkout -b fix/description-du-bug

# Amélioration/refactor
git checkout -b refactor/nom-du-refactor
```

3. **Travailler sur la branche** :

```bash
# Éditer fichiers, commiter, etc.
git add .
git commit -m "feat: Add light slider control"
git push origin feature/ma-fonctionnalite
```

4. **Soumettre Pull Request** :
   - Base : `develop` (pas `main`)
   - Titre descriptif
   - Description complète des changements
   - Liens aux issues associées

5. **Review & merge** :
   - Reviewer approuve changements
   - Tests passent
   - Merge via "Squash and merge" ou "Create a merge commit"

### Rester à jour avec upstream

```bash
git fetch upstream
git rebase upstream/develop
git push origin feature/ma-fonctionnalite --force  # Si nécessaire après rebase
```

---

## 📝 Conventions de Nommage

### Fichiers

| Type | Suffixe | Dossier | Exemple |
|------|---------|---------|---------|
| Modèle données | `*.model.ts` | `app/models/` | `Light.model.ts` |
| Service | `*.service.ts` | `app/services/` | `ClientHTTP.service.ts` |
| Controller | `*.controller.tsx` | `app/controllers/` | `lights.controller.tsx` |
| Composant écran | `*.component.tsx` | `app/components/` | `device.component.tsx` |
| Énumération | `*.enum.ts` | `app/enums/` | `DeviceType.enum.ts` |
| Test | `*.test.tsx` ou `*-test.tsx` | `__tests__/` | `lights.controller.test.tsx` |
| Page/Route | `*.tsx` | `app/(tabs)/` | `lights.tsx` |

### Variables & Fonctions

- **camelCase** pour variables, fonctions, méthodes
- **UPPER_SNAKE_CASE** pour constantes
- **PascalCase** pour classes, types, interfaces, énums

```typescript
// ✅ Correct
const MAX_FAVORITES = 8;
const deviceList = [...];
function getDeviceType(device: Device): DeviceType { }

export class Light { }
export type LightProps = { };
export enum DeviceType { LIGHT = 'Light' }

// ❌ Incorrect
const max_favorites = 8;
const GetDeviceType = () => { };
```

---

## ⚙️ TypeScript & Code Style

### Strict Mode

Tous les fichiers utilisent **TypeScript strict mode** :

```typescript
// ✅ Correct
function toggleLight(device: Light): void {
  // Pas d'implicit any
}

export type ViewLightProps = {
  device: Light;
  onToggle: (device: Light) => void;
};

// ❌ Incorrect
function toggleLight(device: any) { }  // No 'any'
const light = { ... };                  // No implicit types
```

### Classes pour Modèles

Toujours utiliser des **classes** (pas d'interfaces) pour les modèles de données :

```typescript
// ✅ Correct
export class Light {
  readonly id: string;
  readonly name: string;
  readonly level: number;
  
  constructor(id: string, name: string, level: number) {
    this.id = id;
    this.name = name;
    this.level = level;
  }
}

// ❌ Incorrect
export interface ILight {
  id: string;
  name: string;
}
```

### Props Typing

Type explicite pour les props des composants :

```typescript
// ✅ Correct
export type ViewLightProps = {
  device: Light;
  onToggle: (device: Light) => void;
  disabled?: boolean;
};

export const ViewLight: React.FC<ViewLightProps> = ({ device, onToggle }) => {
  // ...
};

// ❌ Incorrect
const ViewLight = (props: any) => { };
```

### Immuabilité

Marquer les propriétés comme `readonly` :

```typescript
// ✅ Correct
export class Device {
  readonly id: string;
  readonly name: string;
}

// ❌ Incorrect
export class Device {
  id: string;
  name: string;
}
```

---

## ✅ Running Tests

### Lancer les tests

```bash
# Mode watch (rerun on file change)
npm test

# Fichier spécifique
npm test -- app/controllers/lights.controller.test.tsx

# Pattern de nom
npm test -- --testNamePattern="toggleLight"

# Coverage report
npm test -- --coverage

# Validation Expo (obligatoire avant PR)
npm run validate:expo

# Snapshot update (après changement intentionnel)
npm test -- --updateSnapshot
```

### Écrire les tests

**Chaque service et controller doit avoir des tests unitaires :**

```typescript
// ✅ Exemple: app/controllers/__tests__/lights.controller.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useLightsController } from '../lights.controller';

describe('LightsController', () => {
  it('should toggle light from off to on', async () => {
    const { result } = renderHook(() => useLightsController());
    
    const device = new Light('1', 'Test Light', 0);
    
    await act(async () => {
      await result.current.toggleLight(device);
    });
    
    // Assertions...
  });
});
```

### Snapshot Testing

Pour les composants UI :

```typescript
// ✅ Exemple: app/components/__tests__/device.component.test.tsx
import { render } from '@testing-library/react-native';
import { DeviceComponent } from '../device.component';

describe('DeviceComponent', () => {
  it('matches snapshot', () => {
    const tree = render(
      <DeviceComponent device={mockDevice} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
```

### Couverture cible

- **Global :** ≥ 80% couverture
- **Controllers :** 100% (logique métier critique)
- **Services :** ≥ 90% (HTTP, data utils)
- **Composants :** ≥ 70% (snapshot tests)

---

## 🎨 Linting & Formatting

### ESLint

```bash
npm run lint           # Vérifier les erreurs
npm run lint -- --fix # Auto-fix erreurs (quand possible)
```

**Règles principales :**
- Pas d'imports inutilisés
- Pas de variables déclarées mais non utilisées
- Types explicites
- Pas de `console.log` en production (warn)

### Prettier (via Expo)

Le projet utilise Prettier via Expo CLI pour l'auto-formatting :

```bash
npm run lint -- --fix  # Applique aussi Prettier
```

### Avant de commiter

```bash
npm run lint -- --fix  # Auto-fix lint + format
npm test               # Lancer les tests
npm run validate:expo  # Vérification Expo Doctor (gate obligatoire)
git add .
git commit -m "feat: Your message"
```

---

## 🚀 Soumettre une Pull Request

### Checklist avant de soumettre

- [ ] ✅ Branche créée depuis `develop`
- [ ] ✅ Tests écrits et passant (`npm test`)
- [ ] ✅ Lint sans erreur (`npm run lint`)
- [ ] ✅ Expo Doctor OK (`npm run validate:expo`)
- [ ] ✅ Commits avec messages clairs
- [ ] ✅ Branch à jour avec `develop` (`git rebase upstream/develop`)

### Template PR

```markdown
## Description
Une description claire de vos changements.

## Type de changement
- [ ] Nouvelle fonctionnalité (feature)
- [ ] Correction de bug (bugfix)
- [ ] Amélioration/refactor (refactor)
- [ ] Documentation

## Changements
- Changement 1
- Changement 2

## Testing
- [ ] Testé localement (`npm test`)
- [ ] Coverage ≥ 80%
- [ ] Lint sans erreur (`npm run lint`)
- [ ] Expo Doctor OK (`npm run validate:expo`)

## Linked Issues
Ferme #123, #124

## Screenshots (si applicable)
[Ajouter screenshots ou GIF]
```

### Processus de review

1. **Automate checks :**
   - Tests doivent passer
   - Lint doit passer
   - Expo Doctor doit passer
   - Coverage > 80%

2. **Code review :**
   - Minimum 1 approval requis
   - Demandes de modification possible

3. **Merge :**
   - "Squash and merge" ou "Create a merge commit"
   - Branche feature supprimée après merge

---

## 💬 Commit Message Format

Suivre le format **Conventional Commits** :

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatting, semicolons (pas de logic change)
- `refactor` : Refactoring code sans feat ni fix
- `test` : Tests ajoutés/modifiés
- `chore` : Build, deps, config

### Scope (optionnel)

L'area du code affecté :

- `controllers` : Controllers
- `services` : Services
- `components` : Composants UI
- `models` : Modèles de données
- `api` : Integration Domoticz API
- `deps` : Dependencies

### Subject

- Impératif : "Add" pas "Added" ou "Adds"
- Pas de point final
- Anglais de préférence, ou français si cohérent avec la base

### Body (optionnel)

Explications détaillées des changements.

### Footer (optionnel)

**Références issues :**
```
Closes #123
Fixes #124
```

**Co-authored-by :**
```
Co-authored-by: Contributor Name <contributor@example.com>
```

### Exemples

```
feat(components): Add light slider control
- Implement continuous level adjustment (0-100%)
- Add haptic feedback on slider drag
- Update state on release only

Co-authored-by: Alice <alice@example.com>
```

```
fix(api): Handle SSL certificate validation errors

Add error handling for self-signed certificates during HTTPS requests.

Closes #456
```

```
docs: Update architecture guide

- Add Context API flow diagram
- Clarify service responsibilities
- Add code examples
```

---

## 🏷️ Labels & Issues

### Labels

Utilisez les labels GitHub pour catégoriser les issues :

| Label | Description |
|-------|-------------|
| `bug` | Rapport de bug |
| `enhancement` | Nouvelle fonctionnalité |
| `documentation` | Amélioration docs |
| `refactor` | Refactoring code |
| `testing` | Tests/couverture |
| `performance` | Optimisation perf |
| `good first issue` | Bon pour débutants |
| `help wanted` | Aide bienvenue |

### Ouvrir une Issue

Titre clair et description détaillée :

```markdown
## Description
Courte description du problème/feature.

## Comportement attendu
Qu'est-ce qui devrait se passer ?

## Comportement actuel (si bug)
Qu'est-ce qui se passe vraiment ?

## Étapes pour reproduire (si bug)
1. ...
2. ...
3. ...

## Environnement
- Node.js version: 21.x
- npm version: 6.x
- Plateforme: Android / Web / etc.

## Fichiers affectés
- `app/components/...`
- `app/services/...`

## Screenshots/Logs
[Ajouter si pertinent]
```

---

## 📚 Architecture & Ressources

Pour comprendre l'architecture complète de l'application :

- **Architecture détaillée :** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **API Domoticz :** [docs/API.md](./docs/API.md)
- **Testing Guide :** [docs/TESTING.md](./docs/TESTING.md)
- **Expo Router :** https://docs.expo.dev/routing/introduction/
- **React Context :** https://react.dev/reference/react/useContext
- **TypeScript :** https://www.typescriptlang.org/
- **Jest :** https://jestjs.io/docs/getting-started

---

## ❓ Questions ?

Ouvrir une [issue](https://github.com/vzwingma/domoticz-mobile/issues) ou contacter les mainteneurs.

**Merci de contribuer ! 🚀**

