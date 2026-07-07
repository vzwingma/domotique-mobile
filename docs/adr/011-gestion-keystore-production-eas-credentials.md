# ADR 011 — Gestion du keystore de production via EAS Credentials

- **Statut** : Proposé (en attente de validation Gate#0)
- **Date** : 2026-07-07
- **Décideurs** : Équipe domoticz-mobile
- **Portée** : Formalisation d'un processus déjà en vigueur de facto — aucune manipulation ni exposition de secret dans cet ADR

## Contexte

`android/app/build.gradle` est un fichier **généré par `expo prebuild`**, non committé (répertoire `android/` entièrement listé dans `.gitignore`). Son contenu actuel (observé localement) montre :

```
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
}
buildTypes {
    ...
    release {
        // Caution! In production, you need to generate your own keystore file.
        // see https://reactnative.dev/docs/signed-apk-android.
        signingConfig signingConfigs.debug
        ...
    }
}
```

Autrement dit : en **build local** (`expo prebuild` + `expo run:android`), le `buildType release` réutilise le `debug.keystore` — un keystore de développement non sécurisé, jamais destiné à signer un artefact distribué. Le commentaire généré par le tooling React Native/Expo lui-même avertit explicitement que ce n'est pas la bonne pratique pour un vrai build de production.

Aucun keystore de production n'est committé dans le repo (cohérent avec les bonnes pratiques : `.gitignore` exclut déjà `*.jks`, `*.p12`, `*.key`). `eas.json` définit un profil `production` avec un bloc `submit.production` configuré, ce qui indique que la distribution réelle passe par le service **EAS Build/Submit**, géré côté plateforme Expo (hors repo).

**Il n'existe pas ici deux options concurrentes à comparer** : la décision de facto — utiliser **EAS Credentials** comme source de vérité pour le keystore de production — est déjà en vigueur dans les faits (aucun keystore prod local, `eas.json` configuré pour le submit). Ce qui manque, c'est la **formalisation documentée** de ce choix, pour qu'il ne repose pas uniquement sur la mémoire du mainteneur.

## Décision

Nous formalisons **EAS Credentials** (`eas credentials`, géré côté plateforme Expo) comme **source de vérité unique** pour le keystore de signature de production Android.

- `debug.keystore` et tout le contenu du répertoire `android/` (généré, gitignored) **ne sont jamais utilisés pour un build de distribution réelle**. Ils ne servent qu'aux builds locaux de développement (`expo run:android`).
- Tout build destiné à une distribution réelle (interne ou store) **doit** passer par `eas build --profile production` (ou `preview`/`previewV`/`previewC` pour les distributions internes intermédiaires), qui utilise le keystore géré par EAS Credentials — jamais le `debug.keystore` généré localement.
- La gestion du keystore de production (génération, rotation, consultation des empreintes) s'effectue exclusivement via la commande `eas credentials`, jamais par manipulation manuelle de fichier `.keystore`/`.jks` dans le repo.

## Processus opérationnel (non-sensible)

1. **Consultation de l'état des credentials** : `eas credentials` (sélectionner la plateforme `Android` puis le profil concerné) permet de visualiser si un keystore de production existe déjà, sans jamais afficher le contenu du fichier lui-même.
2. **Génération initiale** : si aucun keystore de production n'existe encore pour le projet, EAS peut en générer un automatiquement à la première exécution de `eas build --profile production`, ou un keystore existant peut être importé via le même menu interactif.
3. **Rotation** : en cas de compromission suspectée ou de changement d'équipe, la rotation du keystore se fait via `eas credentials`, jamais par remplacement manuel de fichier.
4. **Aucune copie locale** : le keystore de production ne doit jamais être téléchargé/committé dans le repo. S'il devient nécessaire de le récupérer (ex. migration hors EAS), l'opération se fait ponctuellement hors du repo, avec stockage sécurisé dédié (hors périmètre de cet ADR).
5. **Vérification `.gitignore`** : `android/` reste exclu du contrôle de version (déjà en place) ; `*.jks`, `*.p12`, `*.key` restent également exclus, en garde-fou supplémentaire si un keystore venait à être généré localement par erreur.

## Conséquences

### Positives

- Décision déjà en vigueur désormais documentée : plus de dépendance à la mémoire individuelle sur "où est le vrai keystore".
- Aucun risque de fuite de secret dans le repo (aucun keystore de production n'y a jamais été committé, pratique confirmée et formalisée).
- Cohérent avec `eas.json` (profil `production` + `submit.production` déjà configurés).

### Négatives / compromis

- Dépendance opérationnelle à la plateforme Expo/EAS pour toute opération de signature de production (pas d'option de repli local documentée dans ce plan).
- Nécessite une vigilance continue pour que personne ne soit tenté, par simplicité, de committer ou partager un keystore local en dehors d'EAS Credentials.

## Mise en œuvre

**Fichiers impactés (délégué à DOCly — Phase 5, T5.3) :**

| Fichier | Nature de la modification |
|---|---|
| `docs/DEPLOIEMENT.md` (nouveau, ou section README) | Documenter la procédure opérationnelle ci-dessus (non-sensible), référencer cet ADR |

**Aucune valeur de secret, empreinte de keystore ou credential n'est incluse dans cet ADR ni dans la documentation qui en découle.**

## Références

- `android/app/build.gradle` (généré, gitignored — commentaire natif React Native sur le keystore de production)
- `eas.json` (profil `production`, `submit.production`)
- `.gitignore` (exclusion `android/`, `*.jks`, `*.p12`, `*.key`)
- Plan d'Action : [`.claude/plans/001_modernisation-technique-frontend.plan.md`](../../.claude/plans/001_modernisation-technique-frontend.plan.md)
- ADR 010 — [Stratégie de build et déploiement EAS](./010-strategie-build-deploiement-eas.md)
