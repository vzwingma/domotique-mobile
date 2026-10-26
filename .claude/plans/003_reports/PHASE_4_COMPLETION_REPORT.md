# Phase 4 : Tests (non-régression + nouveaux comportements)

**Responsable Agent :** Qalvin (🟢 QUAL)
**Date Début :** 2026-09-15
**Date Fin :** 2026-09-15
**Statut :** ✅ COMPLÉTÉE (2 agents en parallèle : T4.1+T4.3 / T4.2, fichiers disjoints)

---

## 📝 Tâches

### T4.1 - Tests hook `useResponsiveColumns`

**Statut :** ✅ DONE
**Date Fin :** 2026-09-15

**Fichiers Modifiés / Créés :**
- `hooks/__tests__/useResponsiveColumns.test.ts` (nouveau, 23 tests)

**Résultats Quantifiés :**
- Couverture `hooks/useResponsiveColumns.ts` : 100% statements/branches/functions/lines
- `npm run typecheck` / `npm run lint` : 0 erreur

**Notes / Décisions :**
- Couvre les 3 breakpoints (largeurs représentatives) + les 4 valeurs limites exactes des seuils (599/600, 839/840) + réactivité au changement de largeur (rerender) + `getGridCellStyle` (1/2/3 colonnes, gap=0, gap impair).
- Mock `useWindowDimensions` non trivial : `jest.spyOn` inefficace (le hook capture la référence avant le spy runtime) ; `jest.mock` avec spread `{...actual}` casse tout (force l'évaluation d'un getter natif `DevMenu` absent sous Jest). Solution retenue : `Object.defineProperty` ciblée sur l'objet réel (`jest.requireActual`), sans spread.

---

### T4.2 - Tests grilles écrans (Favoris, Lumières/Volets, Températures)

**Statut :** ✅ DONE
**Date Fin :** 2026-09-15

**Fichiers Modifiés / Créés :**
- `app/(tabs)/__tests__/index.test.tsx` (18→25 tests, +7)
- `app/(tabs)/__tests__/devices.tabs.test.tsx` (40→46 tests, +6)
- `app/(tabs)/__tests__/temperatures.tab.test.tsx` (27→36 tests, +9)

**Résultats Quantifiés :**
- Couverture : `devices.tabs.tsx` 100/100/100/100, `temperatures.tab.tsx` 100/100/100/100, `index.tsx` 97.22/83.33/100/97.05 (seule ligne non couverte : garde défensive préexistante `favoritesData === undefined`, inatteignable via le cycle de vie réel du composant, hors scope grille)
- `npm run typecheck` / `npm run lint` : 0 erreur

**Notes / Décisions :**
- Compact/medium/expanded testés sur les 3 écrans, + cas liste vide, cas 1 élément, message limite favoris hors grille (medium ET expanded), zone Thermostat absente/présente selon données, thermostats exclus du compte de cellules grille, câblage `dialSize` 180→240 selon breakpoint.
- `devices.tabs.test.tsx`/`temperatures.tab.test.tsx` n'avaient aucun mock `react-native` (les composants utilisent le vrai `StyleSheet.create`) — ajout d'un mock ciblé via `Proxy` (override uniquement `useWindowDimensions`, lecture paresseuse) après échec d'un spread `{...actual}` (`Invariant Violation: TurboModuleRegistry... DevMenu`).
- Bug latent découvert (non corrigé, hors scope) : le mock existant de `getFavoritesFromStorage` dans `index.test.tsx` ciblait le mauvais module (`DataUtils.service` au lieu de `FavoritesManager.service`) — code mort, favoris toujours vides avant cette passe. Un mock correctement ciblé a été ajouté pour permettre les nouveaux tests de grille ; l'ancien mock mort a été laissé tel quel (tests préexistants non affectés, jamais assertés sur le contenu des favoris).
- Détection des cellules de grille dans les tests : signature `boxSizing` unique de `getGridCellStyle`, absente des styles `StyleSheet.create` des écrans.

---

### T4.3 - Tests non-régression Thermostat

**Statut :** ✅ DONE
**Date Fin :** 2026-09-15

**Fichiers Modifiés / Créés :**
- `app/components/__tests__/thermostat.component.test.ts` (étendu, 28→49 tests, +21)

**Résultats Quantifiés :**
- Couverture `app/components/thermostat.component.tsx` : 96.1% statements / 89.74% branches / 100% functions / 100% lines (cible plan ≥70%, largement dépassée)
- `npm run typecheck` / `npm run lint` : 0 erreur

**Notes / Décisions :**
- **Constat de départ** : les 28 tests existants ne rendaient jamais le vrai composant (logique dupliquée testée en isolation) — couverture réelle mesurée avant cette tâche : 0% sur `thermostat.component.tsx`. Conservés tels quels (toujours verts), nouvelle section ajoutée qui rend réellement `ViewDomoticzThermostat`.
- Mocks ajoutés : `react-native-gesture-handler` (capture `.onBegin/.onUpdate/.onEnd` du `Gesture.Pan()` pour simulation tap/drag sans moteur gestuel natif), `thermostats.controller` (`updateThermostatPoint`, pas d'appel réseau réel).
- **Test clé (risque #1 du plan — désync tap-cible/rendu)** : reproduction locale de `polarToXY`/`touchToTemp` pour générer un point de contact ciblant un angle donné, `it.each` sur 5 angles (MIN, MAX, milieu 17.5°C, 2 bords de zone morte), **à `dialSize=180` ET `240` dans le même test**, assertion que les deux tailles produisent la même valeur affichée — scénario exact que Phase 3 devait éliminer en supprimant les anciennes constantes de module `CX`/`CY`.
- Rendu par défaut (180) et explicite (240) vérifiés séparément (nom, "Consigne", valeur formatée, propagation taille au SVG, état inactif "−", section Mesure conditionnelle), boutons +/- (incrément/décrément 0.5°C, `disabled` si inactif), drag continu + `onEnd`, no-op gestuel si thermostat inactif.
- Lignes non couvertes restantes : garde défensive `describeArc` (`span<=0`, jamais atteinte en usage métier réel) et branches internes `if(!isActive) return` de `handleDecrease`/`handleIncrease` (code mort en pratique : `TouchableOpacity disabled=true` ne transmet plus `onPress`).
- Fichier `.test.ts` (pas `.tsx`, nom imposé par le plan) → JSX interdit par `babel-preset-expo` dans ce type de fichier ; composition via `React.createElement(...)`.

---

## 📊 Synthèse de Phase

**Tâches Complétées :** 3/3

**Vérification finale consolidée** (suite complète, après fusion des 2 agents parallèles) :
- `npm test -- --watchAll=false` : **42 suites, 940/940 tests verts** (874 baseline Phase 1-3 + 23 T4.1 + 22 T4.2 + 21 T4.3 = 940, exact — confirmé indépendamment par les deux agents, aucun chevauchement/duplication)
- `npm run typecheck` : 0 erreur
- `npm run lint` : 0 erreur
- Couverture cibles atteintes : hook 100% (cible 100%), écrans grille 97-100% (cible ≥70%), Thermostat 96.1%/89.74% (cible ≥70%)

**Critères de Réussite Atteints :**
- ☑ `hooks/useResponsiveColumns.ts` : 100% de couverture (branches incluses)
- ☑ Rendu grille testé sur les 3 écrans : 1/2/3 colonnes, cas liste vide, cas 1 élément
- ☑ Non-régression Thermostat : drag/tap corrects à `dialSize=180` ET `dialSize=240` (test dédié même-valeur-aux-deux-tailles)
- ☑ `npm test -- --watchAll=false --coverage` vert, aucune régression de couverture globale
- ☑ `npm run typecheck` et `npm run lint` verts

**Bloqueurs :** aucun.
**Prochaine Phase :** Phase 5 (Documentation DOCly — ARCHITECTURE.md + ADR), après validation présente phase (Gate #3)

---

Fin du rapport Phase 4
