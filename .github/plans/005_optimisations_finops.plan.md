# AP-005 — Optimisations FinOps (post AP-004)

**Document :** AP-005  
**Date création :** 2026-06-01  
**Statut :** ⏳ PLANIFIÉ  
**Source :** `.github/plans/004_reports/FINNOPS_REPORT.md`

---

## 🎯 Objectif Global

Appliquer les 3 recommandations FinOps actionnables identifiées suite au plan AP-004 :
1. Réduire coût DEVon (Sonnet → Haiku pour tâches simples)
2. Corriger désynchronisation table modèles dans `copilot-instructions.md`
3. Compresser `copilot-instructions.md` (503 lignes, seuil >500 dépassé)

---

## Phase 1 — 🟣 DOCly : Mise à jour modèles agents

### Contexte

Le rapport FinOps AP-004 identifie un usage surdimensionné : DEVon (Sonnet 4.6) utilisé pour 3 call sites atomiques. Recommandation : basculer DEVon sur Haiku 4.5 pour réduire coût 40–70% sur tâches < 20 modifications.

Par ailleurs, la table modèles dans `copilot-instructions.md` est désynchro :
- DOCly : affiche `Sonnet 4.6` → réel `GPT-5 mini`
- QUALvin : affiche `Haiku 4.5` → réel `GPT-5.3-Codex`

### Critères de Réussite

- ✅ Devon.agent.md : `model: Claude Haiku 4.5 (copilot)` + version incrémentée v3.2
- ✅ Table modèles dans `copilot-instructions.md` synchronisée avec fichiers agents réels

### Tâches

#### T1.1 — Basculer DEVon sur Claude Haiku 4.5
- **Fichier :** `.github/agents/Devon.agent.md`
- **Modifier :** `model: Claude Sonnet 4.6 (copilot)` → `model: Claude Haiku 4.5 (copilot)`
- **Incrémenter version** : `[v3.1]` → `[v3.2]` dans description + ajouter entrée changelog interne
- **Acceptation :** Fichier modifié, version incrémentée

#### T1.2 — Synchroniser table modèles copilot-instructions.md
- **Fichier :** `.github/copilot-instructions.md`
- **Section :** `## Agents et modèles` (dans `finops.instructions.md`) ou table équivalente
- **Corriger :**
  - DOCly : `Claude Sonnet 4.6` → `GPT-5 mini`
  - QUALvin : `Claude Haiku 4.5` → `GPT-5.3-Codex`
- **Acceptation :** Table cohérente avec fichiers `.github/agents/*.agent.md`

#### T1.3 — Corriger instructions FINNops : limitation /chronicle
- **Fichier :** `.github/agents/FinnOps.agent.md`
- **Contexte :** `/chronicle` est une commande Copilot Chat UI — **non accessible depuis un sous-agent** (outils disponibles : `execute/runInTerminal`, `read`, `edit`, `search`, `todo`). Les instructions actuelles demandent d'exécuter `/chronicle` sans documenter ce cas d'échec → génère une recommandation circulaire invalide dans les rapports.
- **Modifier :** Section "Étape 1 — Collecte données" → ajouter bloc après les commandes `/chronicle` :
  ```
  > ⚠️ Si /chronicle inaccessible (contexte sous-agent VS Code Copilot) :
  > Passer en mode estimation manuelle. Documenter limitation dans rapport section "Stats session".
  > Ne pas recommander "activer /chronicle" — limitation plateforme, pas config manquante.
  ```
- **Incrémenter version** : `[v3.0]` → `[v3.1]`
- **Acceptation :** Fallback documenté, pas de recommandation circulaire dans les futurs rapports

**Agent responsable :** 🟣 DOCly  
**Dépendances :** aucune

---

## Phase 2 — 🟣 DOCly : Compression copilot-instructions.md

### Contexte

`copilot-instructions.md` atteint 503 lignes (seuil d'alerte FinOps : >500). Contient du contenu verbeux (descriptions agents, workflow, diagramme Mermaid, section plans détaillée) qui peut être allégé sans perte de substance technique.

### Critères de Réussite

- ✅ `copilot-instructions.md` réduit sous 400 lignes
- ✅ Toutes les conventions techniques préservées (nommage fichiers, patterns, commandes)
- ✅ Backup `copilot-instructions.original.md` créé

### Tâches

#### T2.1 — Compresser copilot-instructions.md via caveman-compress
- **Fichier :** `.github/copilot-instructions.md`
- **Méthode :** Invoquer skill `caveman-compress` sur le fichier
- **Préserver impérativement :**
  - Section commandes (`npm start`, `eas build`, etc.)
  - Architecture technique (structure répertoires, flux de données)
  - Conventions de code (nommage, TypeScript, composants)
  - Conventions UX/UI (labels FR, header unifié, etc.)
  - Section tests (stack, objectifs couverture)
  - Section CI/CD
- **Acceptation :** < 400 lignes, backup .original.md présent, conventions techniques intactes

**Agent responsable :** 🟣 DOCly  
**Dépendances :** T1.2 (phase 1 doit être terminée avant compression pour éviter revert)

---

## Phase 3 — 💰 FINNops : Validation et rapport

### Tâches

#### T3.1 — Rapport FinOps AP-005
- **Fichier :** `.github/plans/005_reports/FINNOPS_REPORT.md`
- **Couvrir :** Réduction lignes copilot-instructions.md, changement modèle DEVon, gains estimés
- **Acceptation :** Rapport produit dans dossier 005_reports/

**Agent responsable :** 💰 FINNops  
**Dépendances :** T2.1

---

## Résumé des Tâches par Agent

| Agent | Tâches | Livrable |
|-------|--------|---------|
| 🟣 DOCly | T1.1, T1.2, T2.1 | Devon.agent.md mis à jour, copilot-instructions.md compressé |
| 💰 FINNops | T3.1 | Rapport `.github/plans/005_reports/FINNOPS_REPORT.md` |

---

## Dépendances entre Phases

```
Phase 1 (T1.1 + T1.2) ──▶ Phase 2 (T2.1) ──▶ Phase 3 (T3.1)
```

Phase 1 et Phase 2 séquentielles (T2.1 dépend de T1.2 pour éviter revert).  
Phase 3 après Phase 2.

---

## Critères de Succès Globaux

- ✅ Devon.agent.md : modèle Haiku 4.5
- ✅ Table modèles copilot-instructions.md : 4 agents synchronisés
- ✅ copilot-instructions.md : < 400 lignes (réduction ≥ 20%)
- ✅ Backup original conservé
- ✅ Rapport FinOps AP-005 produit

---

## Plan d'Exécution

1. 🟣 DOCly → Phase 1 (T1.1 + T1.2) — simultané
2. 🟣 DOCly → Phase 2 (T2.1) — après Phase 1
3. 💰 FINNops → Phase 3 (T3.1) — après Phase 2

---

**Fin AP-005**
