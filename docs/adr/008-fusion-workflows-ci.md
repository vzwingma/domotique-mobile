# ADR 008 — Fusion/scoping des workflows CI dupliqués

- **Statut** : Proposé (en attente de validation Gate#0)
- **Date** : 2026-07-07
- **Décideurs** : Équipe domoticz-mobile
- **Portée** : `.github/workflows/ci.yml`, `.github/workflows/build-on-all.yml`

## Contexte

Deux workflows GitHub Actions exécutent une logique **quasi-identique en double** :

| | `ci.yml` (`name: CI Pipeline`) | `build-on-all.yml` (`name: CI on all branches`) |
|---|---|---|
| **Déclencheur** | `push`/`pull_request` sur `main`, `develop` uniquement | `push`/`pull_request` sur **toutes les branches**, sans filtre |
| **Structure** | 5 jobs séquencés : `lint` → `test` → `build` (prebuild-only) → `sonarqube-scan` → `integration-check` | 1 job monolithique : prebuild + tests + Sonar |
| **Sonar** | `sonarqube-scan` job dédié, après `lint`+`test` | Scan Sonar dans le même job, à la suite des tests |

**Conséquence directe :** un push sur `main` ou `develop` déclenche **les deux workflows simultanément**, chacun exécutant son propre `expo prebuild`, ses propres tests avec couverture, et son propre scan SonarCloud sur le **même commit**. Cela implique :

- deux scans SonarCloud concurrents sur le même commit (risque de conflit d'analyse, résultats incohérents ou écrasement du dernier arrivé),
- consommation double des minutes CI et du quota `EXPO_TOKEN`/Expo,
- `renovate.json` référence `requiredStatusChecks: ["CI Pipeline"]` — seul `ci.yml` est donc le check réellement utilisé pour l'automerge Renovate ; `build-on-all.yml` ne sert à rien dans ce mécanisme.

Aucune tolérance à rester neutre sur ce sujet : l'ADR doit trancher explicitement entre fusion et scoping.

## Décision

Nous retenons l'**Option B — scoping non-chevauchant**.

## Alternatives considérées

### Option A — Fusion complète en un seul workflow

- **Description** : reprendre la structure en jobs de `ci.yml` (lint → test → build → sonar → integration-check), mais avec le scope large de `build-on-all.yml` (toutes branches, tous PR).
- **Avantages** : un seul fichier à maintenir, plus de risque de double exécution par construction.
- **Inconvénients** : exécute le pipeline complet (prebuild Android + scan SonarCloud + gate qualité `sonar.qualitygate.wait=true`) sur **chaque commit de chaque branche**, y compris les branches de travail éphémères/WIP. Sur un projet à équipe réduite, cela consomme du quota SonarCloud et du temps CI pour du code souvent non finalisé, sans bénéfice proportionnel (le quality gate n'a de sens que sur les branches destinées à être mergées).
- **Risques** : ralentissement du feedback sur les branches de feature (pipeline complet = plus lent qu'un simple lint+test) ; surcoût quota Sonar pour des analyses peu pertinentes.
- **Impacts** : suppression de `build-on-all.yml`, un seul workflow renommé/conservé sous le nom `CI Pipeline`.
- **Effort** : Moyen (fusion + tests de non-régression sur le déclenchement).

### Option B — Scoping non-chevauchant (retenue ✅)

- **Description** : conserver `ci.yml` tel quel (pipeline complet : lint, test+couverture, build/prebuild, Sonar, integration-check) sur `main`/`develop`/PR vers ces branches. Alléger `build-on-all.yml` en `quick-check.yml`, scope restreint aux branches de feature (ou toutes branches hors `main`/`develop`), exécutant **uniquement** `lint` + `test` (sans prebuild Android, sans scan Sonar).
- **Avantages** : élimine la duplication de scan Sonar et de prebuild sur les mêmes commits ; feedback rapide sur les branches de travail (lint+test seuls, plus léger) ; le pipeline complet (coûteux) reste réservé aux branches qui comptent réellement (`main`/`develop`) ; cohérent avec `renovate.json` qui référence déjà `CI Pipeline` comme check d'automerge.
- **Inconvénients** : deux fichiers de workflow à maintenir au lieu d'un ; nécessite de bien documenter la répartition des responsabilités entre les deux pour éviter une nouvelle dérive future.
- **Risques** : si les scopes de déclenchement ne sont pas rigoureusement non-chevauchants (ex. oubli de filtre `branches-ignore`), le problème de duplication peut réapparaître — à vérifier explicitement lors de l'implémentation (T3.1).
- **Impacts** : renommage de `build-on-all.yml` → `quick-check.yml`, suppression du prebuild/Sonar dans ce fichier, ajout d'un filtre de branches pour éviter le chevauchement avec `ci.yml`.
- **Effort** : Faible à Moyen (allègement d'un job existant, pas de refonte).

**Justification du choix :** l'Option B élimine la cause racine (double scan Sonar sur le même commit, double consommation de quota) tout en préservant une valeur propre à `build-on-all.yml` : un **feedback rapide** (lint+test) sur les branches de travail, sans payer le coût du prebuild Android et du scan Sonar à chaque commit. C'est le compromis le plus proportionné à la taille de l'équipe et à la fréquence de contribution.

## Conséquences

### Positives

- Plus de scan SonarCloud concurrent sur un même commit.
- Réduction du volume de minutes CI et du quota Expo consommés sur les branches de feature.
- Rôle de chaque workflow clarifié : `ci.yml` = pipeline de référence (gate qualité complet), `quick-check.yml` = feedback rapide.
- `renovate.json` reste cohérent sans modification immédiate (`CI Pipeline` toujours le check de référence).

### Négatives / compromis

- Deux fichiers de workflow à maintenir plutôt qu'un.
- Nécessite une vigilance sur le non-chevauchement des déclencheurs (`branches`/`branches-ignore`) pour ne pas réintroduire le problème.
- Les branches de feature ne bénéficient plus d'un scan Sonar ni d'une vérification de build native avant merge — seule la PR vers `main`/`develop` (via `ci.yml`) l'exécute.

## Mise en œuvre

**Fichiers impactés (délégué à DEVon — T3.1) :**

| Fichier | Nature de la modification |
|---|---|
| `.github/workflows/ci.yml` | Conservé tel quel (pipeline de référence) |
| `.github/workflows/build-on-all.yml` | Renommé `quick-check.yml`, allégé à lint+test uniquement, scope restreint aux branches hors `main`/`develop` |

**Critère d'acceptation T3.1 :** une seule exécution CI complète par push/PR vers `main`/`develop`, pas de scan Sonar concurrent sur le même commit.

## Références

- `.github/workflows/ci.yml`, `.github/workflows/build-on-all.yml` (état avant décision)
- `renovate.json` (`requiredStatusChecks: ["CI Pipeline"]`)
- Plan d'Action : [`.claude/plans/001_modernisation-technique-frontend.plan.md`](../../.claude/plans/001_modernisation-technique-frontend.plan.md)
