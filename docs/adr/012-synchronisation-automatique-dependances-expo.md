# ADR 012 — Synchronisation automatique des dépendances gouvernées par le SDK Expo

- **Statut** : Accepté
- **Date** : 2026-07-28
- **Décideurs** : Équipe domoticz-mobile
- **Portée** : `renovate.json`, `.github/workflows/ci.yml`, `.github/workflows/quick-check.yml`, nouveau `.github/workflows/expo-sdk-sync.yml`, `package.json`

## Contexte

Le job `build` de `ci.yml` exécute `npm run validate:expo` (gate `expo-doctor`, obligatoire depuis [ADR-001](001-expo-doctor-gate-validation.md)). Ce gate échoue régulièrement, y compris sur des PR Renovate qui ne touchent pas aux dépendances concernées (exemple observé : PR #292, 9 paquets en écart).

### Cause racine

`expo-doctor` délègue son check de versions à `npx expo install --check --json` (vérifié dans le code source de `@expo/cli` installé). Les versions attendues ne viennent **pas** du dépôt mais de deux endpoints distants et mutables :

- `GET https://api.expo.dev/v2/versions/latest`
- `GET https://api.expo.dev/v2/sdks/<sdk>/native-modules`

Le fichier local `node_modules/expo/bundledNativeModules.json` n'est qu'un fallback hors-ligne ; le distant prime (commentaire du code source Expo : *« Prefer the remote versions […] this enables us to push emergency fixes »*). **Aucun épinglage côté dépôt ne peut donc empêcher la dérive** : dès qu'Expo publie un patch, le gate peut casser sur n'importe quelle PR.

Deux mécanismes de dérive coexistent :

1. **Dans la plage** — ex. `"expo": "~56.0.15"` satisfait déjà 56.0.17 publié par Expo ; `package-lock.json` reste figé, Renovate n'ouvre pas de PR pertinente.
2. **Hors plage** — ex. `react-native-screens` épinglé exact à `4.25.2` alors qu'Expo exige `~4.26.0` ; seule une édition de `package.json` corrige.

De plus, `validateDependenciesVersions.js` (code source `@expo/cli`) montre une asymétrie : seul le paquet `expo` tolère d'être en avance (`semver.ltr`). Pour tous les autres, la règle est `!semver.satisfies(...)` — **être en avance casse le gate autant qu'être en retard**. Or Renovate résout ses mises à jour vers la dernière version npm publiée, jamais vers la plage spécifiquement bénie par Expo pour le SDK installé.

### Découverte faite pendant l'analyse

L'inventaire des deux endpoints Expo pour le SDK 56.0.0, croisé avec `package.json`, montre que `typescript`, `jest`, `@types/jest`, `@types/react` et `@babel/core` sont également gouvernés par le SDK Expo — pas seulement les paquets `expo*`/`react-native*` évidents.

## Décision

`npx expo install --fix` est, par construction, l'inverse exact du check qui échoue (même source de vérité, même code). Nous ajoutons un workflow planifié quotidien, `expo-sdk-sync.yml`, qui l'exécute et ouvre une pull request quand une dérive est détectée. Le gate `expo-doctor` du job `build` reste **inchangé et bloquant** (ADR-001 non remis en cause).

`renovate.json` **n'est pas modifié**. Voir « Alternatives considérées » pour la justification et « Conséquences » pour le risque assumé.

## Alternatives considérées

### Option A — Geler Renovate sur le périmètre gouverné par Expo

- **Description** : étendre la règle `packageRules` existante (`enabled: false` sur `react`, `react-dom`, `react-native-svg`, `react-test-renderer`) à l'ensemble des ~30 paquets réellement gouvernés, faisant du workflow de sync l'unique écrivain.
- **Avantages** : élimine toute possibilité de PR Renovate incompatible avec le gate ; supprime le risque de paquet Renovate poussé « en avance » sur `npm latest ».
- **Inconvénients** : configuration plus lourde à maintenir (liste à tenir à jour à chaque nouvelle dépendance) ; réduit la visibilité Renovate sur un périmètre large, y compris pour la remédiation de sécurité automatique.
- **Risques** : liste de gel incomplète ou périmée si une nouvelle dépendance gouvernée est ajoutée sans mise à jour de `renovate.json`.
- **Effort** : Faible à Moyen.

### Option B — Ne pas modifier `renovate.json`, s'appuyer uniquement sur `expo-sdk-sync.yml` (retenue ✅)

- **Description** : laisser Renovate fonctionner sans changement. Le workflow planifié `expo-sdk-sync.yml` devient le mécanisme de convergence ; l'auto-merge natif GitHub (`platformAutomerge: true`) n'exécute jamais un merge dont les checks requis sont rouges, donc aucune PR Renovate incompatible ne peut atteindre `main`.
- **Avantages** : zéro changement de configuration Renovate, zéro liste à maintenir ; le gate reste la seule autorité sur ce qui est mergeable ; Renovate conserve son rôle complet de remédiation de sécurité sur tous les paquets.
- **Inconvénients** : une PR Renovate incompatible avec le gate (ex. `typescript` minor qui casse `expo-doctor`) reste ouverte et rouge indéfiniment, consommant un slot de `prConcurrentLimit: 3` — c'est le symptôme déjà observé aujourd'hui, non aggravé par cette décision.
- **Risques** : accumulation de PR rouges bloquées pouvant saturer la limite de concurrence.
- **Mitigation retenue** : remèdes documentés et prêts à activer sans nouvel ADR si le symptôme se manifeste (augmenter `prConcurrentLimit`, retirer `typescript`/`jest`/`@types/*` de la règle d'auto-merge, ou activer `lockFileMaintenance`). Sujet à réévaluer à la revue trimestrielle d'[ADR-007](007-processus-veille-majors-expo-react.md).
- **Effort** : Faible.

**Justification du choix :** le risque de l'Option B (PR bloquées, symptôme déjà connu et déjà toléré) est strictement inférieur au coût de maintenance de l'Option A (liste de paquets gouvernés à tenir à jour manuellement, sur un projet à mainteneur unique). L'auto-merge GitHub empêchant structurellement tout merge rouge, il n'y a pas de risque de régression sur `main` dans les deux options — seule la fluidité du flux Renovate diffère.

## Mise en œuvre

| Fichier | Nature de la modification |
|---|---|
| `package.json` | 9 plages de dépendances alignées sur le SDK Expo (`expo`, `expo-build-properties`, `expo-constants`, `expo-dev-client`, `expo-linking`, `expo-router`, `expo-splash-screen`, `expo-web-browser`, `react-native-screens`) — réalisé via [PR #293](https://github.com/vzwingma/domotique-mobile/pull/293), déjà mergée sur `main` avant cette décision ; script `validate:expo` simplifié ; `expo-doctor`/`expo-env-info` déplacés en devDependencies pinnées ; scripts `expo:check`/`expo:fix` ajoutés |
| `.github/workflows/expo-sdk-sync.yml` | Créé — cron quotidien + `workflow_dispatch`, exécute `expo install --fix` (deux passes) et ouvre une PR via GitHub App |
| `.github/workflows/ci.yml` | `npm install` → `npm ci` (détecte la dérive lock/manifest au lieu de la masquer) ; garde anti-neutralisation (`EXPO_OFFLINE`/`EXPO_NO_DEPENDENCY_VALIDATION`) ; diagnostic `if: failure()` |
| `.github/workflows/quick-check.yml` | `npm ci` ; exclusion de la branche `chore/expo-sdk-sync` du déclencheur `push` |
| `renovate.json` | Inchangé |

### Identité de la PR automatique

Une PR ouverte avec le `GITHUB_TOKEN` par défaut ne déclenche aucun workflow (protection anti-récursion GitHub), rendant `integration-check` incapable de rapporter. Une GitHub App dédiée (`domoticz-mobile-bot`, permissions `Contents: write` + `Pull requests: write` uniquement, sans accès `Workflows`) fournit un token via `actions/create-github-app-token@v3`, permettant à la CI de s'exécuter normalement sur la PR de sync.

## Conséquences

### Positives

- Le gate `expo-doctor` cesse de casser sur des PR non liées aux dépendances Expo.
- Mécanisme de convergence auto-vérifiant : le workflow de sync exécute littéralement le même gate avant d'ouvrir sa PR (`npm run validate:expo` en dernière étape).
- Aucun changement du comportement du gate lui-même (ADR-001 intact).
- `expo-doctor`/`expo-env-info` deviennent reproductibles (version pinnée, gérée par Renovate — non gouvernée par le SDK Expo).

### Négatives / compromis

- **Risque assumé** : sans gel Renovate, une PR Renovate mineure/patch sur `typescript`, `jest`, `@types/jest` ou `@types/react` (gouvernés par Expo mais actuellement dans la règle d'auto-merge de `renovate.json`) peut rester ouverte et rouge, consommant un slot de `prConcurrentLimit`. Aucun merge sur `main` n'est possible tant que le gate est rouge — le risque est une perte de fluidité, pas une régression de qualité.
- Nouvelle pièce d'infrastructure à maintenir (workflow + GitHub App).
- `expo.install.exclude` reste un échappatoire volontairement non utilisé : la forme scopée (`"pkg@~range"`) est la seule légitime si un jour nécessaire ; la forme nue silence définitivement un paquet et est proscrite.

### Procédure pour une nouvelle dépendance gouvernée par Expo

Après tout ajout de dépendance, rejouer l'inventaire des endpoints Expo (`api.expo.dev/v2/sdks/<sdk>/native-modules` + `/v2/versions/latest`) pour vérifier si le nouveau paquet est gouverné. Si oui, aucune action de gel n'est requise (Option B) ; le workflow `expo-sdk-sync.yml` le prendra en charge automatiquement au prochain run.

## Références

- [ADR-001](001-expo-doctor-gate-validation.md) — gate `expo-doctor` (inchangé par cette décision)
- [ADR-007](007-processus-veille-majors-expo-react.md) — revue trimestrielle, remèdes Renovate à réévaluer si le symptôme de PR bloquées se manifeste
- `.github/workflows/expo-sdk-sync.yml`, `.github/workflows/ci.yml`
- Plan d'Action : [`.claude/plans/002_synchronisation-dependances-expo.plan.md`](../../.claude/plans/002_synchronisation-dependances-expo.plan.md)
