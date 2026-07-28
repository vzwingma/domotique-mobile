# Plan d'Action : Synchronisation automatique des dépendances Expo

**Document :** `.claude/plans/002_synchronisation-dependances-expo.plan.md`
**Date de création :** 2026-07-28
**Statut :** ✅ Complété (implémentation en un lot — Gate humain via plan mode validé le 2026-07-28)
**Objectif Prioritaire :** HIGH

---

## 🎯 Objectif Global

Faire cesser les échecs récurrents du gate `expo-doctor` en CI (`npm run validate:expo`, job `build` de `ci.yml`), y compris sur des PR Renovate non liées, en maintenant automatiquement les dépendances alignées sur la source de vérité distante d'Expo — sans affaiblir le gate lui-même.

Déclencheur : échec observé sur [PR #292](https://github.com/vzwingma/domotique-mobile/actions/runs/30161363053/job/89687154028?pr=292), « Check that packages match versions required by installed Expo SDK », 9 paquets en écart.

Objectifs mesurables : `npm run validate:expo` passe 20/20 sur `main` ; nouveau workflow planifié capable de corriger toute dérive future de façon autonome ; gate `expo-doctor` toujours bloquant.

---

## Contexte / Analyse préalable

Analyse complète menée en mode plan (agent Explore + agent Plan), confrontée au code source de `@expo/cli` installé localement. Résumé :

- `expo-doctor` délègue son check de versions à `npx expo install --check --json`, qui interroge `api.expo.dev` (versions distantes et mutables) — jamais purement le contenu du dépôt.
- Deux causes combinées : dérive « dans la plage » (8/9 paquets, corrigible par rafraîchissement de lock) et dérive « hors plage » (`react-native-screens` épinglé exact, nécessite édition manifeste).
- Asymétrie du check : être en avance casse le gate autant qu'être en retard (sauf pour `expo` lui-même).
- Détail complet, alternatives évaluées et décision : [ADR-012](../../docs/adr/012-synchronisation-automatique-dependances-expo.md).

Décisions actées avec le développeur (AskUserQuestion, 2026-07-28) :

| Sujet | Choix |
|---|---|
| Identité de la PR auto | GitHub App + `actions/create-github-app-token` |
| Config Renovate | Inchangée (pas de gel) — risque documenté dans ADR-012 |
| `npm install` → `npm ci` en CI | Oui |
| `expo-doctor` en devDependency | Oui |
| Diagnostic + garde anti-neutralisation | Oui |
| ADR-012 + plan 002 | Oui |

---

## Phase 1 — Alignement immédiat des dépendances

### Contexte
Bloquant pour tout le reste : tant que `main` n'est pas aligné, toute PR ultérieure (y compris celles de Renovate) reste rouge sur le gate.

**Statut : déjà complétée avant la rédaction de ce plan**, via [PR #293](https://github.com/vzwingma/domotique-mobile/pull/293) (branche `chore/align-expo-sdk`, mergée sur `main`). Consignée ici pour traçabilité complète de l'initiative — les Phases 2 à 5 ci-dessous sont le travail réellement réalisé dans cette session, construit sur la base de `main` post-PR #293.

### Critères de Réussite
✅ `npx expo install --check` sort en code 0
✅ `npm run validate:expo` affiche 20/20 checks passed
✅ `npx tsc --noEmit`, `npm run lint`, `npm test -- --coverage`, `npx expo prebuild --platform android --no-install --clean` passent sans régression

### Tâches (réalisées via PR #293, avant cette session)

#### T1.1 - Exécuter `npx expo install --fix` (deux passes)
- **Fichier(s) :** `package.json`, `package-lock.json`
- **Réalisé :** deux passes exécutées (la première a déclenché un sous-processus interne car `expo` lui-même était en retard, comportement attendu et documenté) ; convergence confirmée par `npx expo install --check`.
- **Résultat :** 9 plages mises à jour, dont `react-native-screens` passé d'un épinglage exact (`4.25.2`) à une plage tilde (`~4.26.0`), conforme à la convention Expo.
- **Acceptation :** ✅ `npm run validate:expo` → 20/20 checks passed (revérifié dans cette session sur la base `main` mise à jour, avant de démarrer les Phases 2-5)

#### T1.2 - Valider l'absence de régression
- **Fichier :** N/A (exécution)
- **Réalisé :** `npx tsc --noEmit` (0 erreur), `npm run lint` (0 erreur), `npm test -- --ci --watchAll=false --coverage --passWithNoTests` (41 suites, 874 tests passants), `npx expo prebuild --platform android --no-install --clean` (plugin SSL custom `withNetworkSecurity` fonctionnel, fichiers `network_security_config.xml`/`domoticz.pem` générés et vérifiés).
- **Acceptation :** ✅ Aucune régression détectée malgré le changement de mineure de `react-native-screens`

---

## Phase 2 — Identité GitHub App (setup humain)

### Contexte
Prérequis de la Phase 3. Une PR ouverte avec le `GITHUB_TOKEN` par défaut ne déclenche aucun workflow (protection anti-récursion GitHub) — la CI ne rapporterait jamais sur la PR de sync.

### Critères de Réussite
✅ GitHub App créée avec permissions minimales (`Contents: write`, `Pull requests: write`, pas de `Workflows`)
✅ Secrets `EXPO_SYNC_APP_CLIENT_ID` et `EXPO_SYNC_APP_PRIVATE_KEY` configurés sur le dépôt (repository secrets — Client ID traité comme secret bien que non sensible, par simplicité de configuration)

### Tâches (réalisées : T2.1 via navigateur in-app, T2.2 par le développeur)

#### T2.1 - Créer la GitHub App et l'installer sur le dépôt
- **Réalisé :** App `domoticz-mobile-bot` créée (App ID `4418126`), permissions `Contents: Read and write` + `Pull requests: Read and write` uniquement (`Workflows` volontairement exclu), webhook désactivé, installée sur `vzwingma/domotique-mobile` uniquement (« Only select repositories »).
- **Acceptation :** ✅ App visible dans *Settings → GitHub Apps* du dépôt, permissions confirmées à l'installation

#### T2.2 - Configurer les secrets
- **Réalisé :** `EXPO_SYNC_APP_CLIENT_ID` et `EXPO_SYNC_APP_PRIVATE_KEY` ajoutés comme **repository secrets** (les deux sous l'onglet Secrets, pas Variables — le Client ID n'est pas sensible mais traité comme secret par simplicité). Le workflow `expo-sdk-sync.yml` a été ajusté en conséquence (`secrets.EXPO_SYNC_APP_CLIENT_ID` au lieu de `vars.EXPO_SYNC_APP_CLIENT_ID`, cf. commit de correction post-merge de la PR #295).
- **Acceptation :** ✅ Les deux secrets présents dans *Settings → Secrets and variables → Actions → Repository secrets*

**Note :** Phase 2 complétée. Le workflow créé en Phase 3 est désormais fonctionnel de bout en bout.

---

## Phase 3 — Workflow de synchronisation planifié

### Contexte
Cœur du mécanisme de convergence : exécute `npx expo install --fix` (inverse exact du check `expo-doctor`) sur un cron quotidien et ouvre une PR si une dérive est détectée.

### Critères de Réussite
✅ Workflow déclenché par cron (`0 6 * * *`) et `workflow_dispatch`
✅ PR ouverte via token GitHub App (CI capable de s'exécuter dessus)
✅ Gate réel (`npm run validate:expo`) vérifié avant ouverture de la PR
✅ Périmètre du commit restreint à `package.json`/`package-lock.json`/`app.json`

### Tâches (réalisées dans cette session)

#### T3.1 - Créer `expo-sdk-sync.yml`
- **Fichier :** `.github/workflows/expo-sdk-sync.yml` (nouveau)
- **Réalisé :** Workflow créé — génération token App, checkout, `npm ci`, snapshot de dérive (`expo install --check --json`), deux passes `expo install --fix`, vérification de convergence, exécution du gate réel, ouverture PR via `peter-evans/create-pull-request@v8` avec corps de PR incluant l'écart détecté.
- **Acceptation :** ✅ Syntaxe YAML validée (`js-yaml`) ; versions d'actions confirmées à jour (`create-github-app-token@v3` = 3.2.0, `create-pull-request@v8` = 8.0.0 sur le registre npm miroir)

---

## Phase 4 — Ajustements `package.json` et workflows CI existants

### Contexte
Rendre le gate reproductible et lisible en cas d'échec, sans changer son verdict.

### Critères de Réussite
✅ `validate:expo` fonctionne sans `npx --yes` (versions pinnées)
✅ `npm ci` remplace `npm install` partout en CI (détecte la dérive lock/manifest au lieu de la masquer)
✅ Diagnostic actionnable affiché en cas d'échec du gate
✅ Garde empêchant la neutralisation silencieuse du gate (`EXPO_OFFLINE`/`EXPO_NO_DEPENDENCY_VALIDATION`)

### Tâches (réalisées dans cette session)

#### T4.1 - Ajuster `package.json`
- **Fichier :** `package.json`
- **Réalisé :** `validate:expo` simplifié (`expo-env-info && expo-doctor`, sans `npx --yes`) ; scripts `expo:check`/`expo:fix` ajoutés ; `expo-doctor@~1.20.1` et `expo-env-info@^2.1.0` ajoutés en devDependencies (vérifiés non gouvernés par le SDK Expo).
- **Acceptation :** ✅ `npm run validate:expo` → 20/20 checks passed avec les versions pinnées

#### T4.2 - `npm ci` dans `ci.yml` et `quick-check.yml`
- **Fichier(s) :** `.github/workflows/ci.yml`, `.github/workflows/quick-check.yml`
- **Réalisé :** 4 occurrences de `npm install --ignore-scripts` remplacées par `npm ci --ignore-scripts` dans `ci.yml` (jobs `lint`, `test`, `build`, `sonarqube-scan`), 1 dans `quick-check.yml`.
- **Acceptation :** ✅ Syntaxe YAML validée

#### T4.3 - Garde + diagnostic dans le job `build`
- **Fichier :** `.github/workflows/ci.yml`
- **Réalisé :** Step `Guard - dependency validation must not be disabled` (échoue si `EXPO_OFFLINE`/`EXPO_NO_DEPENDENCY_VALIDATION` positionnées) inséré avant le gate ; step `Diagnose Expo SDK drift` (`if: failure()`, affiche `expo install --check --json` + commande de correction) inséré après.
- **Acceptation :** ✅ Le gate reste seul juge (aucun de ces deux steps ne peut faire passer un `build` qui aurait dû échouer)

#### T4.4 - Exclusion de la branche de sync dans `quick-check.yml`
- **Fichier :** `.github/workflows/quick-check.yml`
- **Réalisé :** `chore/expo-sdk-sync` ajoutée à `branches-ignore` du déclencheur `push`, pour éviter un run lint/test redondant avec celui déjà exécuté par le workflow de sync lui-même.

---

## Phase 5 — Traçabilité

### Contexte
Règle obligatoire du `CLAUDE.md` racine : toute initiative d'infrastructure produit un ADR + un Plan d'Action dans le même lot que l'implémentation.

### Critères de Réussite
✅ ADR-012 rédigé, statut Accepté
✅ Ce plan créé et renseigné
✅ Index `.claude/plans/README.md` mis à jour

### Tâches (réalisées dans cette session)

#### T5.1 - Rédiger ADR-012
- **Fichier :** `docs/adr/012-synchronisation-automatique-dependances-expo.md`
- **Acceptation :** ✅ Contexte, décision, ≥2 alternatives comparées, conséquences (dont le risque assumé de ne pas geler Renovate), références croisées avec ADR-001 et ADR-007

#### T5.2 - Mettre à jour l'index des plans
- **Fichier :** `.claude/plans/README.md`
- **Acceptation :** ✅ Ligne ajoutée à la table des plans archivés

---

## Vérification end-to-end (post-merge, à réaliser par le développeur)

1. Après merge de la PR de la branche `chore/align-expo-sdk` : confirmer que le job `build` de `ci.yml` passe sur `main`.
2. Une fois la Phase 2 (GitHub App) complétée : déclencher manuellement *Actions → Expo SDK Sync → Run workflow*. Attendu au premier run post-alignement : aucun diff, aucune PR créée (« No changes »).
3. Test négatif recommandé : rétrograder volontairement une ligne de `package.json` sur une branche de test, relancer le workflow, confirmer que la PR `chore/expo-sdk-sync` apparaît **avec la CI qui s'exécute** (preuve que le token App fonctionne réellement).

## Risque assumé (rappel, détail complet dans ADR-012)

`renovate.json` n'a pas été modifié. Une PR Renovate sur `typescript`/`jest`/`@types/*` (gouvernés par Expo mais dans la règle d'auto-merge actuelle) peut rester ouverte et rouge si elle casse le gate — sans jamais pouvoir merger sur `main`. Remèdes prêts à activer sans nouvel ADR si le symptôme se manifeste : voir ADR-012 § Conséquences. À réévaluer à la revue trimestrielle d'ADR-007.

## Fichiers impactés

| Fichier | Action |
|---|---|
| `package.json` | Modifié (Phase 1 + 4) |
| `package-lock.json` | Régénéré (Phase 1) |
| `.github/workflows/expo-sdk-sync.yml` | Créé (Phase 3) |
| `.github/workflows/ci.yml` | Modifié (Phase 4) |
| `.github/workflows/quick-check.yml` | Modifié (Phase 4) |
| `docs/adr/012-synchronisation-automatique-dependances-expo.md` | Créé (Phase 5) |
| `.claude/plans/002_synchronisation-dependances-expo.plan.md` | Créé (ce fichier) |
| `.claude/plans/README.md` | Modifié (Phase 5) |
| `renovate.json` | Inchangé (décision actée) |
