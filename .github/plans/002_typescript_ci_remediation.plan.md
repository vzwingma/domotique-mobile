# Plan d'Action : Remédiation CI TypeScript (`npx tsc --noEmit`)

**Document :** `.github/plans/002_typescript_ci_remediation.plan.md`  
**Date de création :** 2026-05-07  
**Statut :** ⏳ Planifié  
**Objectif Prioritaire :** HIGH

---

## 🎯 Objectif Global

Résoudre durablement l'échec CI sur `npx tsc --noEmit` en rétablissant un typage compilable, stable et vérifiable en continu dans `domoticz-mobile`.  
Le plan couvre l'analyse des erreurs, la remédiation ciblée, la validation qualité, puis la documentation de la décision d'architecture autour du garde-fou TypeScript en CI.

Ce plan est aligné avec l'architecture documentée (`docs/ARCHITECTURE.md`) : React Native/Expo, TypeScript strict, séparation Controllers → Services → Models, état global via `DomoticzContextProvider`, appels Domoticz via `ClientHTTP.service.ts`.

---

## 📋 Phase 1 : Diagnostic TypeScript & Cadrage de Remédiation

### Contexte
- La CI échoue sur l'étape `npx tsc --noEmit`.
- Les erreurs doivent être regroupées par domaine (app/components/controllers/services/models/tests/config).
- La correction doit rester cohérente avec les patterns existants du projet.

### Critères de Réussite
✅ Un inventaire exhaustif des erreurs TS est produit (0 erreur non classée).  
✅ Les causes racines sont identifiées et reliées à des fichiers précis.  
✅ Un backlog de corrections priorisé est défini et validable.

### Tâches

#### T1.1 - Établir baseline des erreurs TypeScript
- **Agent :** 🔵 DEVon
- **Fichier(s) :** `package.json`, `.github/workflows/ci.yml` (lecture), logs locaux
- **Couvrir / Implémenter :**
  - Exécuter `npx tsc --noEmit` et capturer la liste des erreurs.
  - Regrouper les erreurs par type (`TS2322`, `TS2339`, etc.) et par couche.
- **Acceptation :** 100% des erreurs TS listées avec code, fichier, ligne.

#### T1.2 - Produire une matrice de remédiation par lot
- **Agent :** 🟠 ARCos
- **Fichier(s) :** `.github/plans/002_typescript_ci_remediation.plan.md` (mise à jour si besoin)
- **Couvrir / Implémenter :**
  - Définir lots de correction ordonnés (types partagés, models, services/controllers, UI/tests).
  - Identifier les dépendances de correction (ex: types partagés avant composants consommateurs).
- **Acceptation :** 1 matrice priorisée avec chemin critique explicite.

#### T1.3 - Préparer le reporting de phase
- **Agent :** 🟠 ARCos
- **Fichier(s) :** `.github/plans/002_reports/PHASE_1_COMPLETION_REPORT.md`
- **Couvrir / Implémenter :**
  - Initialiser le rapport phase 1 au format standard AP.
  - Pré-remplir les tâches T1.1-T1.3.
- **Acceptation :** rapport créé avec sections complètes et placeholders mesurables.

---

## 📋 Phase 2 : Remédiation du Code TypeScript

### Contexte
- Les erreurs identifiées en phase 1 doivent être corrigées sans introduire de dette.
- Les conventions d'architecture imposent de préserver la séparation des couches et l'unicité des points d'accès API.

### Critères de Réussite
✅ Toutes les erreurs TypeScript détectées en phase 1 sont corrigées (0 restante sur même périmètre).  
✅ Aucune régression d'architecture (pas de `fetch` direct hors service HTTP, pas de nouveau context non validé).  
✅ Aucune augmentation d'usage de `any` non justifié.

### Tâches

#### T2.1 - Corriger les types partagés et modèles de domaine
- **Agent :** 🔵 DEVon
- **Fichier(s) :** `app/models/**/*.ts`, `app/enums/**/*.ts`, éventuels types communs
- **Couvrir / Implémenter :**
  - Aligner signatures, nullability, unions et valeurs par défaut.
  - Supprimer/justifier explicitement les `any` ajoutés pour contourner des erreurs.
- **Acceptation :** 0 erreur TS dans models/enums/types ; 0 `any` non justifié ajouté.

#### T2.2 - Corriger services et controllers
- **Agent :** 🔵 DEVon
- **Fichier(s) :** `app/services/**/*.ts*`, `app/controllers/**/*.ts*`
- **Couvrir / Implémenter :**
  - Harmoniser les contrats de retour (`Promise<T>`), erreurs typées et payload Domoticz.
  - Garantir la compatibilité avec `DomoticzContextProvider` sans rupture API.
- **Acceptation :** 0 erreur TS dans services/controllers ; signature publique stable.

#### T2.3 - Corriger composants et écrans impactés
- **Agent :** 🔵 DEVon
- **Fichier(s) :** `app/components/**/*.tsx`, `app/(tabs)/**/*.tsx`, `components/**/*.tsx`
- **Couvrir / Implémenter :**
  - Corriger props, handlers et typage d'états.
  - Assurer compatibilité avec les controllers/services typés après T2.2.
- **Acceptation :** 0 erreur TS dans composants/écrans ; rendu buildable.

---

## 📋 Phase 3 : Validation Qualité & Robustesse CI

### Contexte
- Une remédiation TS n'est valide que si les contrôles qualité passent en environnement local et CI.
- Les tests unitaires doivent confirmer qu'aucune régression fonctionnelle n'a été introduite.

### Critères de Réussite
✅ `npx tsc --noEmit` passe en local et en CI (0 erreur).  
✅ Tests pertinents passent (`npm test` sur périmètre impacté, idéalement complet).  
✅ Le rapport de phase documente résultats chiffrés et écarts.

### Tâches

#### T3.1 - Valider le périmètre corrigé avec tests et compilation
- **Agent :** 🟢 QUALvin
- **Fichier(s) :** `app/**/__tests__/*`, `components/**/__tests__/*`, configuration Jest/TS si nécessaire
- **Couvrir / Implémenter :**
  - Exécuter `npx tsc --noEmit`.
  - Exécuter les tests liés aux zones modifiées + suite complète si stable.
  - Documenter pass/fail, volumes et éventuelles régressions.
- **Acceptation :** `tsc` ✅ ; tests critiques 100% passants ; 0 régression bloquante non traitée.

#### T3.2 - Vérifier la robustesse du job CI TypeScript
- **Agent :** 🔵 DEVon
- **Fichier(s) :** `.github/workflows/ci.yml`, scripts npm liés à la vérification type
- **Couvrir / Implémenter :**
  - Confirmer que la commande CI utilise le même contrat local (`npx tsc --noEmit`).
  - S'assurer que le job échoue explicitement sur erreur de type.
- **Acceptation :** job CI TypeScript déterministe ; échec reproductible en cas d'erreur.

---

## 📋 Phase 4 : Documentation, ADR et Handover

### Contexte
- La stratégie de remédiation TypeScript doit rester traçable pour les prochaines itérations.
- Une décision d'architecture majeure est prise : conserver `tsc --noEmit` comme quality gate bloquant CI.

### Critères de Réussite
✅ Le plan et les rapports AP sont à jour.  
✅ La documentation projet est synchronisée avec la stratégie CI TypeScript.  
✅ Un ADR est créé pour la décision de quality gate TypeScript.

### Tâches

#### T4.1 - Mettre à jour la documentation des plans et du suivi
- **Agent :** 🟣 DOCly
- **Fichier(s) :** `.github/plans/README.md`, `.github/plans/002_reports/*.md`
- **Couvrir / Implémenter :**
  - Mettre à jour statut des phases et synthèses.
  - Ajouter les points d'exploitation pour prochaines remédiations TS.
- **Acceptation :** index des plans cohérent ; rapports complets et lisibles.

#### T4.2 - Rédiger ADR sur le gate TypeScript en CI
- **Agent :** 🟣 DOCly
- **Fichier(s) :** `docs/adr/00X-typescript-ci-quality-gate.md`
- **Couvrir / Implémenter :**
  - Contexte, décision, alternatives évaluées, conséquences.
  - Inclure contraintes d'architecture (strict typing, cohérence controllers/services/models).
- **Acceptation :** ADR validé, localisable dans `docs/adr/`, prêt pour revue 👤.

#### T4.3 - Validation finale du plan et passage de relais
- **Agent :** 🟠 ARCos
- **Fichier(s) :** `.github/plans/002_typescript_ci_remediation.plan.md`
- **Couvrir / Implémenter :**
  - Vérifier que toutes les tâches ont un statut et des preuves associées.
  - Soumettre synthèse finale au 👤 Développeur humain pour validation.
- **Acceptation :** décision explicite GO/NOGO documentée pour clôture AP-002.

---

## 📊 Résumé des Tâches par Agent

### 🟠 ARCos
- T1.2, T1.3, T4.3 : cadrage, orchestration AP, validation finale.
- **Livrable :** plan exploitable + coordination inter-agents + décision de clôture.
- **Complexité estimée :** Moyenne.

### 🔵 DEVon
- T1.1, T2.1, T2.2, T2.3, T3.2 : diagnostic technique et remédiation code/CI.
- **Livrable :** code TypeScript compilable + CI type-check robuste.
- **Complexité estimée :** Élevée.

### 🟢 QUALvin
- T3.1 : validation qualité post-remédiation.
- **Livrable :** preuves de non-régression + résultats chiffrés.
- **Complexité estimée :** Moyenne.

### 🟣 DOCly
- T4.1, T4.2 : documentation opérationnelle et ADR.
- **Livrable :** reporting final + ADR `docs/adr/`.
- **Complexité estimée :** Moyenne.

---

## 📍 Dépendances entre Phases

```text
Phase 1 (Diagnostic)
    ↓
Phase 2 (Remédiation code) ← [Phase 1 doit être ✅]
    ↓
Phase 3 (Validation QA & CI) ← [Phase 2 doit être ✅]
    ↓
Phase 4 (Doc + ADR + handover) ← [Phase 3 doit être ✅]
```

Règles d'exécution :
- Pas de parallélisation entre phases dépendantes.
- Après validation code (Phase 3), les tâches doc internes (T4.1/T4.2) peuvent être exécutées en `/fleet` si indépendantes.

---

## ✅ Critères de Succès Globaux

1. `npx tsc --noEmit` passe en local et en CI (0 erreur).
2. 100% des erreurs TS de baseline phase 1 sont traitées.
3. Aucun contournement de type non justifié (`any`, cast aveugle) introduit.
4. Aucun écart architectural majeur avec `docs/ARCHITECTURE.md`.
5. Documentation AP-002 complète (plan + rapports de phase).
6. ADR de décision CI TypeScript présent dans `docs/adr/`.

---

## 🚀 Plan d'Exécution

1. **Démarrage immédiat :** Phase 1 (ARCos + DEVon) pour établir la baseline d'erreurs TS.
2. **Après validation 👤 de phase 1 :** Phase 2 (DEVon) pour corriger par lots.
3. **Après validation 👤 du code phase 2 :** Phase 3 (QUALvin + DEVon) pour vérifier compilation/tests/CI.
4. **Après validation 👤 phase 3 :** Phase 4 (DOCly puis ARCos) pour documentation et ADR.

**Triggers de passage de phase :**
- Rapport de phase créé et rempli.
- Tous les critères de la phase courante marqués ✅.
- Aucun bloqueur critique non résolu.

---

## 👤 Points de Validation Humaine

- ✅ Validation du plan AP-002 avant exécution des phases.
- ✅ Validation du code corrigé (fin phase 2).
- ✅ Validation des preuves QA/CI (fin phase 3).
- ✅ Validation documentation + ADR (fin phase 4).
