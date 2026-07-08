# Déploiement & Build Android

**Document Version:** 1.0.0
**Last Updated:** 2026-07-08
**Audience:** Mainteneur(s) du projet
**Références :** [ADR-010 — Stratégie de build et déploiement EAS](./adr/010-strategie-build-deploiement-eas.md), [ADR-011 — Gestion du keystore de production via EAS Credentials](./adr/011-gestion-keystore-production-eas-credentials.md)

> ⚠️ Ce document ne contient et ne doit **jamais** contenir de valeur de secret, de mot de passe, d'empreinte de keystore ou de credential. Toute opération sensible passe exclusivement par `eas credentials` (interactif, côté plateforme Expo).

---

## 🎯 Vue d'ensemble

Le déploiement Android combine deux mécanismes complémentaires (cf. ADR-010, Option C) :

1. **Build preview automatique** — via **EAS Workflows** (`.eas/workflows/android-build-main-workflow.yml`), déclenché automatiquement à chaque push sur `main`.
2. **Builds development/production et submit** — via **scripts npm locaux**, déclenchés manuellement.

Ces deux mécanismes sont indépendants des workflows GitHub Actions (`ci.yml`, `quick-check.yml`) : ils utilisent l'infrastructure EAS (Expo Application Services), pas GitHub Actions.

---

## 🤖 Build preview automatique (EAS Workflows)

**Fichier :** `.eas/workflows/android-build-main-workflow.yml`

**Déclencheur :** chaque `push` sur la branche `main`.

**Séquence :**

1. `build_android_V` : build du profil `previewV` (Android, `EXPO_PUBLIC_MY_ENVIRONMENT=previewV`)
2. `build_android_C` : build du profil `previewC` (Android, `EXPO_PUBLIC_MY_ENVIRONMENT=previewC`), déclenché **après** le succès de `build_android_V`

Les deux builds produisent un **APK à distribution interne** (`distribution: internal`, `buildType: apk` dans `eas.json`), disponibles via le dashboard EAS pour installation directe.

**Portée volontairement limitée** (cf. ADR-010) : ce workflow ne couvre ni `development`, ni `production`, ni `submit` — ces cas restent manuels via les scripts npm ci-dessous.

---

## 🛠️ Scripts npm (builds manuels)

Trois scripts ajoutés à `package.json` (Phase 3 de la modernisation technique) :

```bash
npm run eas:build:development   # eas build --profile development --platform android
npm run eas:build:production    # eas build --profile production --platform android
npm run eas:submit              # eas submit --profile production --platform android
```

| Script | Profil `eas.json` | Usage |
|---|---|---|
| `eas:build:development` | `development` (dev-client, `distribution: internal`, `buildType: apk`) | Build à utiliser avec `npm run start:dev-client` |
| `eas:build:production` | `production` (`android.image: latest`) | Build destiné à la distribution finale (store ou distribution directe) |
| `eas:submit` | `submit.production` | Soumission du build de production vers le store configuré |

**Prérequis local :** être authentifié sur EAS (`eas login`) et avoir les droits sur le projet EAS correspondant. Aucun secret n'est stocké dans le repo pour ces commandes — l'authentification EAS est gérée par la session `eas` locale du mainteneur.

**Profils EAS disponibles** (`eas.json`) : `development`, `preview` (base), `previewV`, `previewC` (variantes du build automatique), `production`.

---

## 🔐 Gestion du keystore de production (EAS Credentials)

Formalisation de l'ADR-011 — processus déjà en vigueur de facto.

### Principe

- **EAS Credentials** est la **source de vérité unique** pour le keystore de signature Android de production.
- Le `debug.keystore` généré localement par `expo prebuild` (dans `android/`, répertoire **gitignored**, jamais committé) **n'est jamais utilisé** pour un build destiné à une distribution réelle — uniquement pour les builds locaux de développement (`expo run:android`).
- Tout build destiné à une distribution réelle (`production`, ou `preview`/`previewV`/`previewC` pour les distributions internes intermédiaires) **doit** passer par `eas build`, qui utilise automatiquement le keystore géré côté EAS.

### Processus opérationnel (non-sensible)

1. **Consulter l'état des credentials**
   ```bash
   eas credentials
   ```
   Sélectionner la plateforme `Android`, puis le profil concerné. Cette commande permet de vérifier si un keystore de production existe déjà — **elle n'affiche jamais le contenu du fichier lui-même**.

2. **Génération initiale**
   Si aucun keystore de production n'existe encore, EAS peut en générer un automatiquement à la première exécution de :
   ```bash
   npm run eas:build:production
   ```
   Un keystore existant peut aussi être importé via le menu interactif `eas credentials`.

3. **Rotation**
   En cas de compromission suspectée ou de changement d'équipe, la rotation se fait exclusivement via `eas credentials` — jamais par remplacement manuel d'un fichier `.keystore`/`.jks`.

4. **Aucune copie locale**
   Le keystore de production ne doit **jamais** être téléchargé ou committé dans le repo. Si une récupération devient nécessaire (ex. migration hors EAS), l'opération se fait ponctuellement hors repo, avec un stockage sécurisé dédié (hors périmètre de ce document).

5. **Garde-fous `.gitignore`**
   `android/` (répertoire généré par `expo prebuild`) ainsi que `*.jks`, `*.p12`, `*.key` restent exclus du contrôle de version — vérifié en place, sert de filet de sécurité si un keystore venait à être généré localement par erreur.

### Ce qu'il ne faut jamais faire

- ❌ Committer un fichier `.keystore`/`.jks`/`.p12` dans le repo.
- ❌ Utiliser `debug.keystore` pour signer un build de distribution réelle.
- ❌ Partager le contenu d'un keystore de production hors du mécanisme EAS Credentials.
- ❌ Documenter une empreinte, un mot de passe ou tout autre secret dans ce fichier ou tout autre fichier versionné.

---

## 🔗 Références

- [ADR-010 — Stratégie de build et déploiement EAS](./adr/010-strategie-build-deploiement-eas.md)
- [ADR-011 — Gestion du keystore de production via EAS Credentials](./adr/011-gestion-keystore-production-eas-credentials.md)
- `eas.json` — profils de build EAS
- `.eas/workflows/android-build-main-workflow.yml` — build preview automatique
- [docs/ARCHITECTURE.md](./ARCHITECTURE.md) — section CI/CD
- [README.md](../README.md) — section Build & Déploiement
