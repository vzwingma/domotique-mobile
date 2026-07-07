# Phase 2 : Socle technique

**Responsable Agent :** Devon (🔵 DEV)
**Date Début :** 2026-07-07
**Date Fin :** 2026-07-07
**Statut :** ⚠️ PARTIELLEMENT COMPLÉTÉE (T2.1 implémenté avec réserve documentée, T2.2 DONE, T2.3 PENDING — dépendance Phase 3)

---

## 📝 Tâches

### T2.1 - Implémenter décision ADR-006 (unification ESLint)
**Statut :** ⚠️ DONE avec réserve (config unifiée conforme ADR-006 ; `npm run lint` ne passe pas à zéro erreur — 11 erreurs préexistantes révélées, hors périmètre correction aveugle)

**Fichiers Créés / Modifiés :**
- `eslint.config.js` — réécrit : import `eslint-config-expo/flat` (array de 13 configs, vérifié via `node -e "require('eslint-config-expo/flat')"` avant écriture), conservation des ignores projet et des règles projet (`no-console`, `no-unused-vars`) en surcharge locale
- `.eslintrc.js` — **supprimé** (code mort confirmé par ADR-006 : ESLint 9 + `eslint.config.js` ⇒ format flat exclusif, jamais chargé)
- `app/(tabs)/parametrages.tab.tsx` — 2 corrections triviales `react/no-unescaped-entities` (apostrophes françaises échappées en `&apos;`, aucun changement de logique)
- `app/+not-found.tsx` — 1 correction triviale `react/no-unescaped-entities` (idem)

**Vérification API `eslint-config-expo/flat` avant écriture :**
- `node_modules/eslint-config-expo/package.json` → `"files": ["flat.js", "flat", ...]`
- `node_modules/eslint-config-expo/flat.js` → `module.exports = require('./flat/default.js')`
- `node_modules/eslint-config-expo/flat/default.js` → `module.exports = defineConfig([...coreConfig, ...typescriptConfig, ...reactConfig, ...expoConfig, {...}, {...}])`
- Test direct : `node -e "const c = require('eslint-config-expo/flat'); console.log(Array.isArray(c), c.length)"` → `true 13`
- Confirmé : array de configs flat, spreadable directement dans `module.exports = [...]`, syntaxe README (`eslint-config-expo/flat`) respectée.

**Résultat `npm run lint` (avant intégration expo/flat, config minimale d'origine) :** 0 erreur (référence historique, config quasi vide 2 règles).

**Résultat `npm run lint` après intégration `eslint-config-expo/flat` :**
- **Avant corrections triviales :** 231 problèmes (14 erreurs, 217 warnings)
- **Après corrections triviales (3 `react/no-unescaped-entities`) :** **228 problèmes (11 erreurs, 217 warnings)**, `npm run lint` exit code 1 (non passant)

**Violations corrigées directement (mineures, formatting pur, aucun changement de comportement) :**
| Fichier | Ligne | Règle | Correction |
|---|---|---|---|
| `app/(tabs)/parametrages.tab.tsx` | 44 | `react/no-unescaped-entities` | `l'utilisation` → `l&apos;utilisation` |
| `app/(tabs)/parametrages.tab.tsx` | 63 | `react/no-unescaped-entities` | `l'application` → `l&apos;application` |
| `app/+not-found.tsx` | 11 | `react/no-unescaped-entities` | `doesn't` → `doesn&apos;t` |

**Violations NON corrigées — documentées pour arbitrage (volume/périmètre) :**

Les 217 warnings restants (essentiellement `no-unused-vars` sur exports d'enums non consommés en interne, `no-console`, `@typescript-eslint/no-require-imports` dans les mocks de test, `import/no-named-as-default`) sont du bruit attendu du preset `expo` sur un projet non préparé pour ces règles — non bloquants pour `npm run lint` (code de sortie déterminé par les erreurs, pas les warnings), non traités ici pour rester dans le périmètre strict de T2.1 (acceptation = 0 erreur, pas 0 warning). Signalé pour arbitrage futur (nettoyage warnings hors périmètre de ce plan).

Les **11 erreurs restantes** n'ont **pas** été corrigées à l'aveugle, conformément à la consigne ARCos (volume + périmètre) :

1. **`app/components/*.test.tsx` (6 erreurs `react/display-name`)** — fichiers `*.test.tsx` : hors périmètre DEVon (modification de fichiers de test interdite, rôle QALvin). Composants mocks anonymes dans les tests (`jest.mock(..., () => (props) => ...)`) déclenchent la règle `react/display-name` du preset `expo`. Correction = ajouter un nom de fonction aux mocks, à traiter par QALvin.
   - `app/__tests__/root-layout.test.tsx:28`
   - `app/components/__tests__/blindDevice.component.test.tsx` (2 occurrences)
   - `app/components/__tests__/device.component.test.tsx` (2 occurrences)
   - `app/components/__tests__/favoriteCard.component.test.tsx`
   - `app/components/__tests__/lightDevice.component.test.tsx`

2. **`app/(tabs)/_layout.tsx:60:38` (1 erreur `react-compiler`)** — `Compilation Skipped: Existing memoization could not be preserved`. Touche à la logique de rendu/memoization du layout principal (business logic) — nécessite une revue ciblée de la fonction concernée (probablement un `useMemo`/`useCallback` avec dépendance non stable détectée par React Compiler), hors périmètre d'une correction mécanique en T2.1.

3. **`app/(tabs)/_layout.tsx:85:5` (1 erreur `react-hooks`)** — `Calling setState synchronously within an effect can trigger cascading renders`. Touche à un `useEffect` du layout principal (business logic) — nécessite revue du flux de données (probablement déplacer la logique hors de l'effet ou vers un event handler), hors périmètre d'une correction mécanique en T2.1.

4. **`app/components/thermostat.component.tsx:98,104,110` (3 erreurs `react-hooks/refs`)** — `Cannot access refs during render` sur le `Gesture.Pan()` (gestion tactile du thermostat, `draggingValue.current`). Règle stricte de la nouvelle version `eslint-plugin-react-hooks` v7 sur l'accès à un ref dans un handler de gesture-handler — pattern courant avec `react-native-gesture-handler` mais signalé par la règle. Touche directement à la logique métier du composant thermostat (interaction glisser-déposer) — correction nécessiterait un refactor (ex. `useAnimatedRef`/callback restructuré) à valider avec ARCos avant modification, hors périmètre d'une correction mécanique en T2.1.

**Recommandation :** ces 11 erreurs restantes nécessitent soit un arbitrage ARCos/MAINa (créer une tâche de suivi dédiée, éventuellement un ADR sur la stratégie d'adoption progressive du preset — ex. passer certaines règles en `warn` le temps de la remédiation), soit une intervention ciblée QALvin (pour les 6 dans les fichiers de test). **`npm run lint` ne passe pas encore avec 0 erreur strict** — critère d'acceptation T2.1 non atteint à 100 %, mais l'objectif structurel de l'ADR-006 (une seule config ESLint active, cohérente avec le preset `expo` déclaré en dépendance) est bien atteint.

---

### T2.2 - Figer Node dev/CI (.nvmrc, engines)
**Statut :** ✅ DONE

**Fichiers Créés / Modifiés :**
- `.nvmrc` — nouveau, contenu `24` (aligné `node-version: 24` dans `.github/workflows/ci.yml` et `build-on-all.yml`)
- `package.json` — ajout `"engines": { "node": ">=24" }` en section top-level, à côté de `name`/`version`

**Vérification :**
- `node -v` local → `v25.8.0`, compatible `>=24` → aucun warning engine attendu
- `.nvmrc` lisible par `nvm use` (contenu `24` seul, format standard)

---

### T2.3 - Vérifier/ajuster `renovate.json` post-fusion CI
**Statut :** ⏳ PENDING — dépendance non satisfaite (T3.1, Phase 3, non exécutée). Non traité dans cette session, conformément au périmètre assigné.

---

## 📊 Synthèse de Phase

**Tâches Complétées :** 1/3 ✅ (T2.2), 1/3 ⚠️ avec réserve (T2.1), 1/3 ⏳ PENDING (T2.3, hors périmètre — dépendance Phase 3)

**Critères de Réussite Atteints :**
- ⚠️ `npm run lint` s'exécute avec une seule source de vérité ESLint (`.eslintrc.js` supprimé) mais **ne passe pas encore sans erreur** (11 erreurs préexistantes révélées par l'intégration du preset `expo`, cf. détail T2.1)
- ✅ `.nvmrc` et `engines` présents et alignés sur Node 24 (version CI)
- ⏳ `renovate.json` → non vérifié (T2.3 bloqué, dépendance Phase 3)
- ✅ Aucune régression introduite par les 3 corrections triviales appliquées (formatting JSX pur)

**Bloqueurs :**
- T2.1 : 11 erreurs de lint restantes nécessitent un arbitrage (ARCos/MAINa) ou une intervention QALvin (fichiers de test) avant de pouvoir clore formellement le critère d'acceptation "0 erreur". Ne bloque pas la suite du plan (Phase 3 indépendante), mais à traiter avant clôture finale de Phase 2/Gate#2.
- T2.3 : bloqué par dépendance T3.1 (Phase 3), comme prévu au plan.

**Prochaine Phase :** Phase 3 (CI/CD) peut démarrer dès ADR-008/009/010 acceptés (Gate#0), indépendamment du point ouvert T2.1. Recommandation : soumettre les 11 erreurs restantes à MAINa/ARCos pour décision (créer tâche de suivi ou ADR complémentaire) avant Gate#2.

---

## 📦 Livrables

- ✅ `eslint.config.js` unifié (preset `eslint-config-expo/flat` + règles projet)
- ✅ `.eslintrc.js` supprimé
- ✅ `.nvmrc` créé (`24`)
- ✅ `package.json` avec `engines.node >=24`
- ⚠️ Rapport détaillé des 11 erreurs de lint restantes (ci-dessus), en attente d'arbitrage

---

**Rapport approuvé par :** TBD
**Date d'approbation :** TBD

Fin du rapport Phase 2
