# ADR 001 — Ajouter `expo-doctor` comme gate de validation

- **Statut** : Accepté
- **Date** : 2026-05-07
- **Décideurs** : Équipe domoticz-mobile

## Contexte

Jusqu'ici, la validation locale/pré-PR reposait principalement sur :

- `npm test` (tests unitaires Jest)
- `npm run lint` (qualité statique)

Ce socle reste nécessaire mais ne couvre pas certains problèmes spécifiques à l'écosystème Expo/React Native :

- incompatibilités de versions entre SDK Expo et dépendances installées,
- configuration environnement Expo incohérente,
- problèmes de santé projet détectables avant build natif.

En pratique, ces écarts peuvent passer les tests unitaires tout en cassant l'expérience de build/exécution.

## Décision

Nous ajoutons `expo-doctor` comme **gate obligatoire** dans la validation locale et pré-PR, via la commande :

```bash
npm run validate:expo
```

Cette commande exécute :

```bash
npx --yes expo-env-info && npx --yes expo-doctor@latest
```

La règle de validation devient :

1. `npm test`
2. `npm run lint`
3. `npm run validate:expo`

Une PR n'est pas prête tant que ces 3 vérifications ne sont pas vertes.

## Pourquoi les tests unitaires seuls sont insuffisants

Les tests unitaires valident le comportement du code applicatif, mais ne valident pas :

- l'alignement des dépendances avec le SDK Expo,
- les contraintes de configuration Expo,
- les dérives de tooling qui impactent le cycle mobile (prebuild/run).

## Impacts

### Positifs

- Détection plus précoce des erreurs d'intégration Expo.
- Réduction des régressions liées à l'environnement mobile.
- Alignement plus fiable entre dev local, CI et builds natifs.

### Coûts / trade-offs

- Temps de validation local légèrement plus long.
- Sensibilité potentielle à des alertes/outils externes (doctor).
- Besoin de corriger des warnings Expo qui n'impactaient pas immédiatement les tests.

## Conséquences opérationnelles

- Documentation mise à jour dans `README.md`, `CONTRIBUTING.md` et `docs/TESTING.md`.
- Les checklists PR doivent inclure explicitement `npm run validate:expo`.
- Les contributeurs doivent considérer `expo-doctor` comme un critère bloquant, au même titre que lint/tests.
