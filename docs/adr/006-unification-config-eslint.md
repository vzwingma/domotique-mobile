# ADR 006 — Unification de la configuration ESLint

- **Statut** : Proposé (en attente de validation Gate#0)
- **Date** : 2026-07-07
- **Décideurs** : Équipe domoticz-mobile
- **Portée** : Configuration ESLint du projet (`eslint.config.js`, `.eslintrc.js`)

## Contexte

Le projet contient aujourd'hui **deux configurations ESLint coexistantes** :

- `eslint.config.js` — configuration **flat** (format natif ESLint 9), minimaliste : aucun `extends`, seulement deux règles (`no-console`, `no-unused-vars`) et un parser TypeScript nu.
- `.eslintrc.js` — configuration **legacy** (`module.exports = { extends: 'expo' }`).

ESLint 9.39.1 (version installée, `package.json`) utilise par défaut le **format flat exclusivement** dès qu'un fichier `eslint.config.js` est présent à la racine ; `.eslintrc.js` est alors **totalement ignoré** (sauf bascule explicite via `ESLINT_USE_FLAT_CONFIG=false`, non activée ici). `.eslintrc.js` est donc du **code mort** — il ne s'exécute jamais — mais reste **trompeur** : il laisse croire que le projet hérite du preset `expo` (règles React Native/Expo, hooks, import), alors que la réalité est un lint quasi nu (2 règles).

Le paquet `eslint-config-expo` (`~56.0.4`) est déjà présent en `devDependency` mais **n'est utilisé par aucune des deux configurations** actives. Vérification de compatibilité flat : `node_modules/eslint-config-expo/package.json` expose `"files": ["default.js", "flat.js", "flat", "utils"]` — un export flat dédié (`eslint-config-expo/flat`) existe bien, avec les dépendances requises (`@typescript-eslint/*` v8, `eslint-plugin-react-hooks` v7, `eslint-plugin-import`, `eslint-plugin-expo`) déjà satisfaites par la version installée.

## Décision

Nous retenons l'**Option B** : intégrer `eslint-config-expo/flat` dans `eslint.config.js`, et supprimer `.eslintrc.js`.

## Alternatives considérées

### Option A — Garder le flat minimal actuel, supprimer `.eslintrc.js`

- **Avantages** : changement quasi nul, aucun risque de nouvelles violations de lint à corriger, effort minimal.
- **Inconvénients** : le projet reste avec un lint appauvri (2 règles génériques), sans les règles spécifiques React/React Native/Expo (hooks, accessibilité, imports) que le preset `expo` apporte habituellement. La dépendance `eslint-config-expo` reste installée mais inutilisée — incohérence entre `package.json` et la configuration réelle.
- **Risques** : dérive silencieuse (bugs de hooks, imports cassés) non détectée faute de règles adaptées.
- **Impacts** : aucun fichier existant à corriger.
- **Effort** : Faible.

### Option B — Intégrer `eslint-config-expo` en flat, supprimer `.eslintrc.js` (retenue ✅)

- **Avantages** : une seule source de vérité, cohérente avec l'intention déjà actée par la présence de la dépendance en `devDependencies` ; récupère les règles Expo/React Native (hooks, import resolver TypeScript, react) maintenues par l'équipe Expo et alignées sur le SDK 56 ; supprime l'écart entre dépendance installée et configuration réelle.
- **Inconvénients** : le preset `expo` est nettement plus riche que la config actuelle (2 règles) — l'intégration peut révéler un nombre non négligeable de nouvelles violations de lint sur le code existant, à corriger dans T2.1.
- **Risques** : effort de remédiation T2.1 sous-estimé si le volume de violations est important ; à mitiger en isolant les règles les plus bruyantes en `warn` dans un premier temps si nécessaire, sans bloquer la CI de façon disproportionnée.
- **Impacts** : `eslint.config.js` réécrit pour importer `eslint-config-expo/flat` puis surcharger localement les règles projet (`no-console`, `no-unused-vars`) ; `.eslintrc.js` supprimé.
- **Effort** : Moyen (intégration simple, mais remédiation potentielle des violations révélées côté T2.1).

## Conséquences

### Positives

- Une seule configuration ESLint active, sans ambiguïté ni fichier trompeur.
- Alignement entre dépendance déclarée (`eslint-config-expo`) et usage réel.
- Couverture de lint plus proche des standards Expo/React Native (hooks, imports, accessibilité de base).

### Négatives / compromis

- Risque de nouvelles violations à corriger lors de l'implémentation (T2.1), effort à cadrer avant merge.
- Légère hausse de la surface de règles à maintenir dans le temps (mises à jour de `eslint-config-expo` suivies via Renovate, déjà dans `packageRules` `^eslint`).

## Mise en œuvre

**Fichiers impactés (délégué à DEVon — T2.1) :**

| Fichier | Nature de la modification |
|---|---|
| `eslint.config.js` | Import de `eslint-config-expo/flat`, conservation des règles projet en surcharge |
| `.eslintrc.js` | Suppression (config legacy morte) |
| `package.json` | Aucun changement de dépendance (déjà présente) |

**Critère d'acceptation T2.1 :** `npm run lint` passe sans erreur, une seule configuration ESLint active.

## Références

- `eslint.config.js`, `.eslintrc.js` (état avant décision)
- `node_modules/eslint-config-expo/package.json` (export flat vérifié)
- Plan d'Action : [`.claude/plans/001_modernisation-technique-frontend.plan.md`](../../.claude/plans/001_modernisation-technique-frontend.plan.md)
