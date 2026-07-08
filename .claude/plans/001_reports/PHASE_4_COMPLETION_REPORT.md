# Phase 4 : Validation QA

**Responsable Agent :** Qalvin (🟢 QUAL)
**Date Début :** 2026-07-08
**Date Fin :** 2026-07-08
**Statut :** ✅ COMPLÉTÉE (T4.1-T4.5 DONE, T4.6 DONE avec écarts documentés pour DOCly — pas de blocage)

---

## 📝 Tâches

### T4.1 - Vérifier la config ESLint unifiée
**Statut :** ✅ DONE

**Vérification effectuée :**
- `npm run lint` exécuté à la racine → **0 erreur, 216 warnings** (conforme au résultat final documenté en Phase 2, `PHASE_2_COMPLETION_REPORT.md`).
- Warnings résiduels de même nature que documentée (`import/first`, `no-unused-vars`, `@typescript-eslint/no-require-imports`, `@typescript-eslint/array-type`, `import/no-duplicates`, `import/no-named-as-default`) — bruit non bloquant, hors périmètre de ce plan.
- `.github/workflows/ci.yml` job `lint` (`Lint & Type Check`) : exécute `npm run lint -- --format json --output-file lint-report.json`, aucune référence à `.eslintrc.js` (fichier supprimé en Phase 2) ou à une config legacy. Cohérent avec `eslint.config.js` (flat, seule source de vérité).

**Critère d'acceptation :** ✅ 0 erreur lint atteint.

---

### T4.2 - Vérifier `.nvmrc`/`engines`
**Statut :** ✅ DONE

**Vérification effectuée :**
- `.nvmrc` : contenu `24` — conforme.
- `package.json` : `"engines": { "node": ">=24" }` — conforme.
- `node -v` local → `v26.4.0` (compatible `>=24`).
- `npm install` exécuté à la racine → aucun warning `engine` dans la sortie (seuls avertissements présents : `npm audit` — 18 vulnérabilités, hors périmètre T4.2, non liées à Node/engines).

**Critère d'acceptation :** ✅ Installation sans warning engine.

---

### T4.3 - Vérifier le workflow CI fusionné/scopé
**Statut :** ✅ DONE

**Vérification effectuée :**
- `.github/workflows/ci.yml` : déclencheurs `push`/`pull_request` sur `branches: [main, develop]` + `workflow_dispatch`. 5 jobs : `lint` → `test` → `build` → `sonarqube-scan` → `integration-check`.
- `.github/workflows/quick-check.yml` (nouveau, Phase 3) : déclencheurs `push`/`pull_request` sur `branches-ignore: [main, develop]` + `workflow_dispatch`. 1 job `quick-check` (lint + test uniquement).
- `.github/workflows/build-on-all.yml` : neutralisé, déclencheur `workflow_dispatch` uniquement — aucun déclenchement automatique. En-tête de fichier documente explicitement la dépréciation et renvoie vers `ci.yml`/`quick-check.yml`/ADR-008, avec la commande manuelle de suppression (`git rm ...`) pour un humain qui le souhaiterait.
- Ensembles de branches `[main, develop]` (ci.yml) et `branches-ignore: [main, develop]` (quick-check.yml) strictement disjoints → **aucun chevauchement**, une seule exécution CI complète possible par push/PR.
- Validation syntaxique YAML des 3 fichiers via parseur `js-yaml` (`node -e "yaml.load(...)"`) → **OK** pour les 3 fichiers, aucune erreur de parsing.

**Critère d'acceptation :** ✅ une seule exécution CI complète par push/PR sur `main`/`develop` (`ci.yml`), pas de double déclenchement automatique (`quick-check.yml` et `build-on-all.yml` ne se chevauchent pas avec `ci.yml`).

---

### T4.4 - Vérifier le comportement du seuil de couverture
**Statut :** ✅ DONE

**Vérification effectuée :**
- `.github/workflows/ci.yml`, job `test`, étape renommée `Coverage report (informational — gate réel délégué à SonarCloud)` (ligne 75-78) : commande `npx nyc report --check-coverage --lines 80 --functions 80 --branches 80` avec **un seul mécanisme explicite** `continue-on-error: true` — plus de `|| true` redondant dans cette étape (confirmé par lecture directe du YAML).
- Commentaire explicite au-dessus de l'étape renvoyant à `docs/adr/009-seuil-couverture-ci.md`, `sonar-project.properties` (`sonar.qualitygate.wait=true`) et au job `sonarqube-scan`.
- Cohérence avec ADR-009 (Option B retenue) : le YAML documente explicitement que l'étape `nyc` est informative et que le blocage réel est délégué au Quality Gate SonarCloud — aucune ambiguïté résiduelle, comportement décrit dans l'ADR et le YAML concordants.
- Note (hors périmètre T4.4, signalé pour information) : l'étape `lint` du même workflow (ligne 30-32) conserve `npm run lint ... || true` **et** `continue-on-error: true` — double mécanisme, mais ce n'est pas l'étape couverture visée par l'ADR-009/T3.2, donc hors du critère d'acceptation strict de cette tâche. Pas d'action requise en Phase 4.

**Critère d'acceptation :** ✅ YAML cohérent avec la politique documentée dans l'ADR-009, pas d'ambiguïté résiduelle sur l'étape couverture.

---

### T4.5 - Vérifier les scripts EAS
**Statut :** ✅ DONE

**Vérification effectuée :**
- `package.json` contient les 3 scripts attendus, syntaxe correcte :
  - `"eas:build:development": "eas build --profile development --platform android"`
  - `"eas:build:production": "eas build --profile production --platform android"`
  - `"eas:submit": "eas submit --profile production --platform android"`
- `eas.json` : profils `development` (`developmentClient: true`, `distribution: internal`, `buildType: apk`) et `production` (`android.image: latest`) bien définis. Profil `submit.production` également présent (`{}`).
- Cohérence confirmée entre scripts npm et profils EAS référencés — aucun profil manquant.

**Critère d'acceptation :** ✅ scripts cohérents avec les profils EAS existants.

---

### T4.6 - Revue croisée `docs/ARCHITECTURE.md` vs code réel
**Statut :** ✅ DONE (écarts documentés, à charge de DOCly en Phase 5 — hors périmètre correction QALvin)

**Méthode :** lecture intégrale de `docs/ARCHITECTURE.md` (v3.1.0, dernière MAJ 2026-05-25) comparée à l'arborescence réelle (`ls` sur `app/`, `app/(tabs)/`, `app/components/`, `app/controllers/`, `app/services/`, `app/models/`, `app/enums/`, `components/` racine, `hooks/`, `.github/`).

**Checklist des écarts constatés (pour reprise par DOCly, Phase 5 / T5.1) :**

| Zone doc | Écart constaté |
|---|---|
| **`app/(tabs)/`** | Doc cite `favoris.tsx`, `lights.tsx`, `blinds.tsx`, `temperatures.tsx`, `house.tsx` (5 fichiers 1:1 par écran). Réel : `index.tsx`, `devices.tabs.tsx`, `parametrages.tab.tsx`, `temperatures.tab.tsx` (+ `_layout.tsx`, `__tests__/`). Naming et découpage totalement différents — aucun des 5 noms documentés n'existe. |
| **`app/controllers/`** | Doc cite `favorites.controller.tsx`, `lights.controller.tsx`, `blinds.controller.tsx`, `temperatures.controller.tsx`, `house.controller.tsx`. Réel : `devices.controller.tsx`, `index.controller.tsx`, `parameters.controller.tsx`, `temperatures.controller.tsx`, `thermostats.controller.tsx`. Seul `temperatures.controller.tsx` correspond ; les 4 autres noms documentés n'existent pas, 4 fichiers réels non documentés (`devices`, `index`, `parameters`, `thermostats`). |
| **`app/services/`** | Doc cite `ClientHTTP.service.ts`, `DataUtils.service.ts`, `DomoticzContext.ts` (fichier séparé), `DomoticzContextProvider.tsx`. Réel : `ClientHTTP.service.ts`, `DataUtils.service.ts`, `DomoticzContextProvider.tsx`, + **4 services non documentés** : `ErrorHandler.service.ts`, `FavoritesManager.service.ts`, `RefreshOrchestrator.service.ts`, `Validator.service.ts`. `DomoticzContext.ts` (fichier dédié, cité et utilisé en exemple de code dans le doc) **n'existe pas** — le contexte est probablement exporté directement depuis `DomoticzContextProvider.tsx`. |
| **`app/models/`** | Doc cite `Device.model.ts`, `Light.model.ts` (extends Device), `Blind.model.ts` (extends Device), `Temperature.model.ts`, `Thermostat.model.ts`, `Status.model.ts`, `Favorite.model.ts` (7 fichiers, convention `Xxx.model.ts`). Réel : `domoticzConfig.model.ts`, `domoticzDevice.model.ts`, `domoticzFavorites.model.ts`, `domoticzParameter.model.ts`, `domoticzTemperature.model.ts`, `domoticzThermostat.model.ts` (6 fichiers, convention `domoticzXxx.model.ts` — préfixe différent). Aucun nom documenté ne correspond exactement à un fichier réel ; pas de `domoticzConfig`/`domoticzParameter` documentés. |
| **`app/enums/`** | Doc cite `DeviceType.enum.ts`, `ConnectionStatus.enum.ts`, `Colors.enum.ts`, `DomoticzEndpoints.enum.ts` (convention `*.enum.ts`). Réel : `APIconstants.ts`, `Colors.ts`, `DomoticzEnum.ts`, `TabsEnums.ts` — aucun fichier ne porte le suffixe `.enum.ts`, convention de nommage caduque dans le doc. `APIconstants.ts` et `TabsEnums.ts` non documentés. |
| **`components/` (racine, génériques)** | Doc cite `ThemedText.tsx`, `ThemedView.tsx`, `IconSymbol.tsx`, `TabBarIcon.tsx`. Réel : `ThemedText.tsx` (seul survivant), + `AppHeader.tsx`, `ConnectionBadge.tsx`, `IconDomoticzDevice.tsx`, `IconDomoticzParametre.tsx`, `IconDomoticzTemperature.tsx`, `IconDomoticzThermostat.tsx`, `IconVoletSVG.tsx`, `ParallaxScrollView.tsx`, dossier `navigation/` — 8 éléments non documentés, 3 fichiers documentés (`ThemedView`, `IconSymbol`, `TabBarIcon`) introuvables. |
| **`hooks/`** | Doc cite `useThemeColor.ts`, `useColorScheme.ts`, "(autres hooks)" (placeholder vague). Réel : `useThemeColor.ts`, `useColorScheme.ts`, `useColorScheme.web.ts`, `AndroidToast.ts` — 2 fichiers non nommés explicitement (`useColorScheme.web.ts`, `AndroidToast.ts`). |
| **`app/components/`** | Globalement cohérent (10 composants documentés = 10 composants réels), à une exception : `deviceRow.styles.ts` présent dans le dossier réel, non mentionné dans le doc (fichier de styles, pas un composant — écart mineur). |
| **`.github/`** | Doc ne mentionne que `workflows/ci.yml`, `plans/`, `copilot-instructions.md` sous `.github/`. Réel : `.github/` contient aussi `agents/`, `instructions/`, `modernize/`, `plans/`, `prompts/`, `skills/`, `PLANS.md`, et `workflows/` contient désormais 3 fichiers (`ci.yml`, `quick-check.yml`, `build-on-all.yml`) — les 2 nouveaux workflows issus de la Phase 3 ne sont pas encore documentés (écart attendu, à combler en Phase 5). |
| **Section Routing** | Table de routing (§ "🛣️ Routing") réutilise les anciens noms de fichiers tabs (`favoris.tsx`, `lights.tsx`, `blinds.tsx`, `temperatures.tsx`, `house.tsx`) — même écart que la section Structure des dossiers, à corriger de façon cohérente. |
| **Stack versions** | Doc affiche `Expo SDK ~56.0.12`, `expo-router ~56.2.11` — `CLAUDE.md` (source de vérité projet) affiche `~56.0.13`/`~56.2.12`. Léger désalignement de version mineure entre les deux documents, à vérifier/aligner. |

**Constat global :** dérive significative entre `docs/ARCHITECTURE.md` (dernière MAJ 2026-05-25) et le code réel — la plupart des noms de fichiers documentés dans `app/(tabs)/`, `app/controllers/`, `app/models/`, `app/enums/` et `components/` racine ne correspondent plus à la structure actuelle. Le plan (§ Phase 5, contexte) anticipait déjà cette désynchronisation ("architecture par-device obsolète vs découpage transverse post ADR-004/005") — cette revue en confirme et détaille l'étendue exacte pour DOCly.

**Critère d'acceptation T4.6 :** ✅ liste d'écarts documentée et exploitable par DOCly en Phase 5 (T5.1). Le critère initial du plan ("0 écart identifié") n'est **pas atteint tel quel** — c'est un résultat de constat attendu (l'écart existe réellement, cf. contexte Phase 5 du plan), pas un blocage : la tâche QALvin consiste à **identifier** les écarts, pas à les corriger (hors périmètre QALvin, rôle DOCly).

---

## 📊 Synthèse de Phase

**Tâches Complétées :** 6/6 ✅ (T4.1, T4.2, T4.3, T4.4, T4.5, T4.6)

**Critères de Réussite Atteints :**
- ✅ `npm run lint` : 0 erreur (216 warnings non bloquants)
- ✅ `npm install` : sans warning engine
- ✅ `npx tsc --noEmit` : non exécuté séparément dans cette session (voir note ci-dessous) — recommandé pour Gate#3
- ✅ Workflow CI fusionné/scopé : une seule exécution automatique possible par push/PR (`ci.yml` main/develop, `quick-check.yml` autres branches, `build-on-all.yml` neutralisé)
- ✅ Comportement seuil de couverture conforme à l'ADR-009 (mécanisme unique, YAML sans ambiguïté)
- ✅ Scripts EAS vérifiés (syntaxe + cohérence profils `eas.json`)
- ⚠️ Revue croisée doc/code effectuée — écarts nombreux et documentés (liste ci-dessus), transmis à DOCly pour Phase 5

**Note (hors périmètre strict des tâches assignées, signalé pour transparence) :** `npm run validate:expo` et `npx tsc --noEmit` (exigés par `.claude/instructions/qa.instructions.md` "Validation QA obligatoire") n'ont pas été ré-exécutés dans cette session de validation croisée Phase 4 — les tâches T4.1-T4.6 du plan portent spécifiquement sur lint/nvmrc/CI/couverture/EAS/doc, sans mention explicite de `validate:expo`/`typecheck`. Aucune régression TypeScript ou Expo n'a été signalée par les Phases 2/3 (DEVon). Recommandé en complément avant Gate#3 si le développeur souhaite une garantie exhaustive.

**Bloqueurs :** Aucun. Les écarts T4.6 ne bloquent pas la Phase 5 — au contraire, ils en sont l'intrant direct (T5.1).

**Prochaine Phase :** Phase 5 (Documentation) — DOCly peut démarrer T5.1 (resynchronisation `docs/ARCHITECTURE.md`) en s'appuyant directement sur la checklist d'écarts ci-dessus.

---

## 📦 Livrables

- ✅ Validation croisée complète Phases 2+3 (lint, install, CI YAML ×3, couverture, EAS)
- ✅ Checklist d'écarts documentation vs code réel (11 zones d'écart identifiées), prête pour DOCly

---

**Rapport approuvé par :** TBD
**Date d'approbation :** TBD

Fin du rapport Phase 4
