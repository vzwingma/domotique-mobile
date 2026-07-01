---
description: Spécificités projet domoticz-mobile pour l'agent 🟣 DOCly (doc)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile (Doc)

> Fichier lu automatiquement par agent 🟣 DOCly au démarrage.
> Contient les spécificités projet `domoticz-mobile`, application Expo / React Native / TypeScript pour piloter Domoticz.

## Workflow

1. Lire `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md` et les rapports ou résumés fournis par MAINa/DEVon/QALvin.
2. Identifier les documents réellement impactés.
3. Faire des mises à jour ciblées, sans réécriture complète si inutile.
4. Vérifier liens, chemins, commandes et cohérence terminologique.
5. Livrer la liste des fichiers documentaires modifiés.

## Fichiers sous responsabilité

### Racine projet

- `README.md` : présentation produit, prérequis, installation, variables d'environnement, scripts, fonctionnalités.
- `CHANGELOG.md` : historique des changements versionnés quand une livraison le justifie.
- `CONTRIBUTING.md` : contribution si le workflow change.
- `AGENTS.md` : contexte des agents et conventions projet.

### Documentation versionnée

- `docs/ARCHITECTURE.md` : architecture réelle, stack, couches, flux de données, patterns.
- `docs/API.md` : intégration API REST Domoticz, endpoints et paramètres.
- `docs/TESTING.md` : stratégie et commandes de test.
- `docs/adr/` : Architecture Decision Records, nommage `NNN-titre-court.md`.

### OpenCode

- `.opencode/README.md` : vue transverse agents, prompts, skills et instructions.
- `.opencode/instructions/*.instructions.md` : spécificités projet par agent.
- `.opencode/skills/` : procédures partagées si le workflow agents change.
- `.opencode/PLANS.md` : guide Plans d'Action si la gouvernance change.

## Conventions de documentation

- Langue narrative : français.
- Blocs de commandes et code : garder syntaxe exacte et chemins réels.
- `docs/ARCHITECTURE.md` doit refléter l'architecture actuelle.
- ADR requis pour décisions majeures : architecture, routing, stratégie HTTP, état global, sécurité, build natif, dépendances structurantes.
- Ne pas mentionner l'ancien nom repo `domotique-mobile` comme nom courant ; le nom projet courant est `domoticz-mobile`.
- Pour une nouvelle version livrée, ajouter l'entrée pertinente en tête de `CHANGELOG.md` si le projet suit ce flux.
- Si `.opencode/plans/README.md` existe dans une initiative future, le maintenir comme index synthétique plans + statut global uniquement.

## Versions à maintenir cohérentes

- Expo SDK `~56.0.12`.
- React `19.2.3`.
- React Native `0.85.3`.
- TypeScript `~6.0.3`.
- expo-router `~56.2.11`.
- Jest `29.7.0`.
- Testing Library React Native `13.3.3`.
- ESLint `9.39.1`.

## Commandes à documenter si elles changent

```bash
npm start
npm run start:dev-client
npm run android
npm run android:clean
npm run web
npm test
npm test -- --coverage
npm run lint
npm run typecheck
npm run validate:expo
```

## Ce que tu ne fais PAS

- Ne pas modifier le code source applicatif.
- Ne pas créer de tests.
- Ne pas prendre de décision architecturale à la place d'ARCos.
- Ne pas documenter des comportements non vérifiés dans le code ou les livrables.
- Ne pas conserver de liens vers des fichiers absents sans signaler le risque.
