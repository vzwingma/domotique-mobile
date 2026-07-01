# Instructions Agents — domoticz-mobile

## Projet

`domoticz-mobile` est une application Expo / React Native / TypeScript pour piloter et consulter des équipements Domoticz depuis Android et le Web.

Stack principale :
- Expo SDK `~56.0.12`
- React `19.2.3`
- React Native `0.85.3`
- TypeScript strict
- `expo-router` `~56.2.11` pour le routage file-based
- Jest `29.7.0` avec Testing Library React Native pour les tests
- ESLint `9.39.1` via `expo lint`

## Structure

- `app/(tabs)/` : écrans principaux Expo Router (`favoris`, `lights`, `blinds`, `temperatures`, `house`).
- `app/components/` : composants métier d'écran (`*.component.tsx`).
- `app/controllers/` : hooks/controllers qui relient UI, services et modèles (`*.controller.tsx`).
- `app/services/` : services métier, HTTP et état global.
- `app/models/` : classes TypeScript représentant les données Domoticz.
- `app/enums/` : enums, constantes et endpoints Domoticz.
- `components/` : composants réutilisables génériques.
- `hooks/` : hooks React partagés.
- `docs/` : architecture, API, testing et ADR.
- `.opencode/` : agents, skills, prompts, templates et instructions projet.

## Architecture

Flux cible : UI -> Controllers -> Services -> API REST Domoticz.

Principes à respecter :
- Les composants UI ne font pas d'appels HTTP directs.
- Les appels Domoticz passent par `app/services/ClientHTTP.service.ts`.
- L'état global passe par `DomoticzContextProvider` / `DomoticzContext`.
- Les modèles sont des classes TypeScript avec propriétés explicites et immuables quand pertinent.
- Les nouvelles routes suivent le routage file-based d'`expo-router` dans `app/`.
- Les décisions d'architecture majeures doivent être tracées dans `docs/adr/`.

Référence obligatoire : lire `docs/ARCHITECTURE.md` avant toute décision d'architecture ou changement structurel.

## Commandes

```bash
npm start
npm run start:dev-client
npm run android
npm run android:clean
npm run web
npm test
npm test -- --coverage
npm test -- path/to/file.test.tsx
npm test -- --testNamePattern="nom du test"
npm run lint
npm run typecheck
npm run validate:expo
```

Validation locale recommandée avant PR :

```bash
npm test
npm run lint
npm run typecheck
npm run validate:expo
```

## Conventions Code

- TypeScript strict, pas d'`any` sans justification.
- Préférer les patterns existants aux abstractions nouvelles.
- Ne pas introduire de nouvelle bibliothèque UI, routing, state management ou HTTP sans décision ARCos validée.
- Utiliser les chemins et conventions déjà présents dans `app/`, `components/` et `hooks/`.
- Garder les changements focalisés sur le périmètre demandé.
- Ne pas hardcoder d'URL, token ou secret dans le code source.

## Tests

- Les tests sont dans `__tests__/` ou sous forme `*.test.ts` / `*.test.tsx`.
- Tester les controllers, services, modèles, hooks et composants touchés.
- Couverture cible : au moins 80% sur `app/`, `components/` et `hooks/`.
- Mocker les dépendances natives, AsyncStorage, timers, réseau et contexte quand nécessaire.
- Référence : `docs/TESTING.md`.

## Documentation

- `README.md` décrit le produit, l'installation, les scripts et les fonctionnalités.
- `docs/ARCHITECTURE.md` décrit l'architecture réelle et doit rester à jour.
- `docs/API.md` documente l'intégration Domoticz.
- `docs/TESTING.md` documente la stratégie de tests.
- `docs/adr/` contient les Architecture Decision Records.
- `CHANGELOG.md` reçoit les changements livrés quand une version/fonctionnalité le justifie.

## Agents OpenCode

- `MAINa` : orchestrateur principal, cadre la demande, consulte ARCos, crée le Plan d'Action et impose les validations humaines.
- `ARCos` : architecture, comparaison de solutions, recommandations, ADR.
- `DEVon` : implémentation dans le périmètre validé.
- `QALvin` : tests unitaires, couverture et validation qualité.
- `DOCly` : documentation, README, architecture, ADR et synchronisation documentaire.

Instructions spécifiques projet :
- `.opencode/instructions/orchestrator.instructions.md`
- `.opencode/instructions/architect.instructions.md`
- `.opencode/instructions/dev.instructions.md`
- `.opencode/instructions/qa.instructions.md`
- `.opencode/instructions/doc.instructions.md`

Workflow nominal :
1. MAINa clarifie le besoin et les critères d'acceptation.
2. MAINa consulte ARCos pour comparer au moins deux options si la demande touche l'architecture.
3. Le développeur humain choisit la solution et valide le Plan d'Action.
4. DEVon implémente le périmètre validé.
5. Le développeur humain valide le code avant QA.
6. QALvin écrit/exécute les tests.
7. Le développeur humain valide les tests avant documentation.
8. DOCly synchronise la documentation.
9. Le développeur humain valide la clôture.

## Règles de Sécurité

- Ne jamais modifier des secrets réels ni les exposer dans la documentation.
- Respecter `.gitignore` et ne pas ajouter d'artefacts générés non souhaités.
- Ne pas lancer d'opérations destructives sans validation explicite.
- Ne pas réécrire ou annuler des changements non liés présents dans le worktree.
