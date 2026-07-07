# ADR 010 — Stratégie de build et déploiement EAS

- **Statut** : Proposé (en attente de validation Gate#0)
- **Date** : 2026-07-07 (correction factuelle post-Gate#0 le 2026-07-07)
- **Décideurs** : Équipe domoticz-mobile
- **Portée** : `package.json` (scripts npm), `eas.json`, `.eas/workflows/` (automatisation native EAS)

> **Note de révision (Gate#0)** : la version initiale de cet ADR affirmait à tort qu'aucune automatisation de build n'existait. Une revue du développeur a signalé l'existence de `.eas/workflows/android-build-main-workflow.yml`, un **EAS Workflow natif** qui déclenche déjà des builds automatiques. Le contenu ci-dessous corrige ce constat et réévalue les options en conséquence.

## Contexte

`eas.json` définit 5 profils de build EAS (Android uniquement) :

- `development` — client de dev, distribution interne
- `preview`, `previewV`, `previewC` — distribution interne, variantes d'environnement (`EXPO_PUBLIC_MY_ENVIRONMENT`)
- `production` — build de production, avec un bloc `submit.production` configuré

Contrairement au constat initial, une automatisation de build **existe déjà**, mais via **EAS Workflows** (orchestration native côté plateforme Expo/EAS — fichiers YAML dans `.eas/workflows/`), un mécanisme **distinct de GitHub Actions**. Le seul fichier présent dans `.eas/workflows/` (aucun autre trouvé lors de la revue) est :

`android-build-main-workflow.yml` — déclenché sur chaque `push` vers `main` :

1. `build_android_V` : build `previewV` (Android)
2. `build_android_C` : build `previewC` (Android), déclenché **après** succès de `build_android_V` (`after:`)

Ce mécanisme couvre donc **une automatisation réelle mais partielle** :

- ✅ builds `previewV`/`previewC` automatiques sur push `main`, séquentiels
- ❌ pas de build `development` ni `production` automatisé
- ❌ pas de `submit` (déploiement store) automatisé
- ❌ pas de gate manuel ni de notification visibles dans le workflow (déclenchement inconditionnel dès le push)

Le déploiement n'est donc **pas 100 % manuel** comme affirmé initialement : les builds preview post-merge sur `main` sont déjà reproductibles et automatiques. En revanche, les builds `development`/`production` et le `submit` vers les stores restent **entièrement manuels**, sans script npm ni trace reproductible dans le repo — les commandes EAS CLI correspondantes sont mémorisées/tapées à la main par le mainteneur pour ces cas.

Les workflows GitHub Actions existants (`ci.yml`, `build-on-all.yml`) utilisent `expo/expo-github-action@v8` avec `secrets.EXPO_TOKEN` (pour `expo prebuild`/`validate:expo`) — ce secret GitHub Actions est indépendant de l'authentification EAS Workflows (celle-ci repose sur la connexion du projet EAS lui-même côté plateforme Expo, pas sur un secret GitHub).

Le projet est à équipe réduite (mainteneur unique / app à usage personnel), avec une cadence de release faible et irrégulière (pas de calendrier de release formel identifié dans le repo).

## Décision

Nous retenons l'**Option C** : conserver le workflow EAS existant tel quel pour les builds preview automatiques, et compléter par des scripts npm locaux pour les cas non couverts (`development`, `production`, `submit`).

## Alternatives considérées

### Option A — Conserver le workflow EAS existant sans aucun ajout

- **Description** : ne rien changer ; le workflow `android-build-main-workflow.yml` reste la seule automatisation. Les builds `development`/`production` et le `submit` restent des commandes EAS CLI tapées à la main, sans trace dans le repo.
- **Avantages** : aucun effort ; le besoin le plus fréquent (preview après merge sur `main`) est déjà couvert.
- **Inconvénients** : les builds `production`/`submit` — les plus sensibles et les moins fréquents, donc les plus propices à l'erreur de mémoire (mauvais profil, mauvais ordre) — restent sans reproductibilité versionnée.
- **Risques** : erreur humaine sur un build de production (profil incorrect, oubli d'étape de submit).
- **Impacts** : aucun.
- **Effort** : Nul.

### Option B — Étendre le workflow EAS existant à `production`/`submit` et ajouter un gate manuel

- **Description** : modifier `android-build-main-workflow.yml` (ou ajouter un second workflow EAS) pour inclure un job `production` + `submit`, avec un déclenchement conditionnel (tag de version, ou approbation manuelle) plutôt qu'un push direct sur `main`.
- **Avantages** : automatisation complète bout-en-bout (preview + production + submit), reproductible et versionnée nativement dans `.eas/workflows/`.
- **Inconvénients** : les EAS Workflows ne supportent pas nativement un gate d'approbation humaine aussi riche qu'un environment GitHub Actions protégé ; complexifie le fichier YAML pour un besoin de production peu fréquent ; chaque exécution consomme du quota EAS, y compris en cas de déclenchement accidentel.
- **Risques** : déclenchement non désiré d'un `submit` en production sans étape de confirmation suffisamment robuste.
- **Impacts** : modification de `.eas/workflows/`, nécessite une réflexion sur le déclencheur (tag vs push vs approbation).
- **Effort** : Élevé (conception + tests du workflow de production, risque plus élevé à valider).

### Option C — Conserver le workflow EAS existant + scripts npm locaux pour development/production/submit (retenue ✅)

- **Description** : ne pas toucher au workflow EAS Workflows existant (`previewV`/`previewC` sur push `main` reste satisfaisant tel quel pour son périmètre) ; ajouter des scripts npm reproductibles (`eas:build:development`, `eas:build:production`, `eas:submit`) invoqués manuellement en local pour les cas que le workflow EAS ne couvre pas.
- **Avantages** : élimine la dépendance à la mémoire individuelle pour les commandes `production`/`submit`, les plus sensibles, sans toucher à un mécanisme d'automatisation preview qui fonctionne déjà ; aucune consommation de quota supplémentaire (les scripts restent déclenchés manuellement, comme aujourd'hui) ; effort minimal ; pas de risque de déclenchement accidentel d'un `submit` en production.
- **Inconvénients** : le build/submit de production reste un geste manuel — pas de garantie automatique de fraîcheur ni de gate CI avant publication store (jugé acceptable vu la cadence de release faible et le mainteneur unique).
- **Risques** : faible — oubli d'exécuter un script avant une release, sans impact sur la qualité du code ni sur l'automatisation preview existante.
- **Impacts** : ajout de 3 scripts npm dans `package.json` ; `eas.json` inchangé (profils déjà définis) ; `.eas/workflows/android-build-main-workflow.yml` inchangé.
- **Effort** : Faible.

**Justification du choix :** le constat corrigé montre que l'automatisation preview (la plus fréquemment utile) **existe déjà et fonctionne** via EAS Workflows — il n'y a aucune raison de la dupliquer ou de la remplacer par un mécanisme GitHub Actions équivalent (option initialement envisagée). Le vrai point non couvert est la reproductibilité des builds `development`/`production` et du `submit`, qui restent manuels. Automatiser ces derniers en CI (Option B) introduirait un risque disproportionné (déclenchement accidentel d'un submit en production) pour un gain limité vu la cadence de release faible d'un projet à mainteneur unique. Les scripts npm (Option C) ferment cette lacune sans toucher à l'automatisation existante ni introduire de coût de quota récurrent. Si la cadence de release augmente significativement (plusieurs contributeurs, releases régulières), l'extension du workflow EAS à `production`/`submit` avec un gate robuste (Option B) devra être réévaluée — cf. ADR-007 pour le principe de revue périodique, transposable ici.

## Conséquences

### Positives

- L'automatisation preview existante (`previewV` → `previewC` sur push `main`) est préservée sans modification, réduisant le risque de régression.
- Commandes de build `development`/`production` et de `submit` reproductibles et versionnées (`package.json`), fin de la dépendance à la mémoire individuelle sur ces cas sensibles.
- Aucun coût de quota EAS récurrent additionnel (les nouveaux scripts restent à déclenchement manuel).
- Aucun nouveau secret à gérer.

### Négatives / compromis

- Le build/submit de production reste un geste manuel — pas de garantie automatique de fraîcheur ni de gate CI avant publication store.
- Réévaluation nécessaire si la cadence de release ou la taille de l'équipe change (cf. Option B en réserve).

## Mise en œuvre

**Fichiers impactés (délégué à DEVon — T3.3) :**

| Fichier | Nature de la modification |
|---|---|
| `package.json` | Ajout des scripts `eas:build:development`, `eas:build:production`, `eas:submit` |
| `eas.json` | Aucun changement de structure (profils déjà définis) |
| `.eas/workflows/android-build-main-workflow.yml` | Aucun changement (automatisation preview conservée telle quelle) |

**Critère d'acceptation T3.3 :** scripts exécutables localement (`npm run eas:build:production`, `npm run eas:submit`, etc.) ; aucune modification du workflow EAS existant ; aucun job GitHub Actions de build automatique ajouté.

## Références

- `eas.json` (5 profils Android)
- `.eas/workflows/android-build-main-workflow.yml` (EAS Workflow natif, builds `previewV`/`previewC` automatiques sur push `main`)
- `.github/workflows/ci.yml`, `.github/workflows/build-on-all.yml` (usage existant de `EXPO_TOKEN`, mécanisme distinct des EAS Workflows)
- Plan d'Action : [`.claude/plans/001_modernisation-technique-frontend.plan.md`](../../.claude/plans/001_modernisation-technique-frontend.plan.md)
