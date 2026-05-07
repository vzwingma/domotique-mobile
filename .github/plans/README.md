# 📋 Plans d'Action (Action Plans)

Bienvenue dans le répertoire des Plans d'Action (AP) du projet.

Chaque plan orchestre une initiative multi-phases coordonnée entre plusieurs agents (🔵 DEVon, 🟢 QUALvin, 🟠 ARCos, 🟣 DOCly) et produit des rapports de suivi documentant l'exécution, avec validation explicite du 👤 Développeur humain à chaque jalon.

---

## 📂 Plans Actifs / En Cours

### AP-001 : Modernisation Complète

**Fichier :** [`001_modernisation_complète.plan.md`](./001_modernisation_complète.plan.md)  
**Objectif :** Moderniser l'application domoticz-mobile en améliorant la couverture de test, les dépendances à jour, l'architecture du code et la performance.

**Phases :**
1. 🔄 **Phase 1 : Couverture de Test (🟢 QUALvin)** — En cours
2. ⏳ **Phase 2 : Mise à Jour des Dépendances (🔵 DEVon)** — À démarrer
3. ⏳ **Phase 3 : Architecture & Services (🔵 DEVon)** — À démarrer
4. ⏳ **Phase 4 : Performance & Optimisations (🔵 DEVon)** — À démarrer
5. ⏳ **Phase 5 : CI/CD & Infrastructure (🟠 ARCos)** — À démarrer
6. ⏳ **Phase 6 : Documentation & Guides (🟣 DOCly)** — À démarrer

**Statut Global :** 🔄 EN_COURS

**Critères de Succès Globaux :**
- ✅ Couverture de test ≥80%
- ✅ 0 dépendances dépréciées
- ✅ 0 `any` non-justifiés en TypeScript
- ✅ Bundle size stable ou ↓
- ✅ CI/CD robuste + auto-merge
- ✅ Documentation exhaustive & à jour

### AP-002 : Remédiation CI TypeScript (`npx tsc --noEmit`)

**Fichier :** [`002_typescript_ci_remediation.plan.md`](./002_typescript_ci_remediation.plan.md)  
**Objectif :** Restaurer un pipeline CI TypeScript stable en supprimant les erreurs de compilation (`tsc --noEmit`) et en documentant la décision de quality gate.

**Phases :**
1. ⏳ **Phase 1 : Diagnostic TypeScript & Cadrage** — Planifiée
2. ⏳ **Phase 2 : Remédiation du Code TypeScript** — À démarrer
3. ⏳ **Phase 3 : Validation Qualité & Robustesse CI** — À démarrer
4. ⏳ **Phase 4 : Documentation, ADR et Handover** — À démarrer

**Statut Global :** ⏳ PLANIFIÉ

**Critères de Succès Globaux :**
- ✅ `npx tsc --noEmit` passe local + CI (0 erreur)
- ✅ 100% des erreurs de baseline traitées
- ✅ Aucun `any` non-justifié introduit
- ✅ Documentation AP complète (plan + rapports)
- ✅ ADR déposé dans `docs/adr/`

---

## 📋 Plans Archivés / Complétés

_(Aucun plan archivé pour l'instant)_

---

## 🚀 Comment Créer un Nouveau Plan

1. **Créer le fichier plan** : `.github/plans/<NO>_<nom>.plan.md`
   - Utiliser le numéro séquentiel suivant (ex: 002 après 001)
   - Suivre le format défini dans [`.github/PLANS.md`](../PLANS.md)

2. **Créer le dossier reporting** : `.github/plans/<NO>_reports/`
   - Contiendra les rapports de phase complétées

3. **Soumettre pour validation** au 👤 Développeur humain ou lead du projet

**Guide complet :** 📖 [`.github/PLANS.md`](../PLANS.md)

---

## 📚 Documentation Associée

- **Guide complet des Plans d'Action** : [`.github/PLANS.md`](../PLANS.md)
- **Instructions agent DEVon (🔵 DEV)** : [`.github/agents/Devon.agent.md`](../agents/Devon.agent.md)
- **Instructions agent QUALvin (🟢 QUAL)** : [`.github/agents/Qalvin.agent.md`](../agents/Qalvin.agent.md)
- **Instructions agent DOCly (🟣 DOC)** : [`.github/agents/Docly.agent.md`](../agents/Docly.agent.md)
- **Instructions agent ARCos (🟠 ARC)** : [`.github/agents/Arcos.agent.md`](../agents/Arcos.agent.md)
- **Instructions Copilot globales** : [`.github/copilot-instructions.md`](../copilot-instructions.md)

---

## ✅ Checklist pour un Plan Bien Structuré

Avant de créer un nouveau plan, vérifier :

- [ ] Titre explicite et objectif global clair
- [ ] Phases bien séparées (3-6 phases généralement)
- [ ] Chaque phase a contexte, critères de réussite, tâches
- [ ] Chaque tâche est numérotée T<N>.<M> avec :
  - [ ] Verbe d'action + objet
  - [ ] Fichiers précis
  - [ ] Scope explicite
  - [ ] Critères d'acceptation mesurables
  - [ ] Agent assigné
- [ ] Dépendances explicites et diagramme
- [ ] Critères de succès globaux (5-7 items)
- [ ] Plan d'exécution avec triggers

---

## 🤝 Contribution aux Plans

Pour contribuer ou modifier un plan existant :

1. **Ne pas modifier le fichier plan après son lancement** — créer un nouveau plan pour les changements majeurs
2. **Documenter dans le rapport** : Tout changement de scope ou nouvelle tâche découverte
3. **Notifier l'équipe** : Si un bloqueur ou risque est identifié
4. **Mettre à jour ce README** : Refléter le statut actuel des phases

---

**Dernière mise à jour :** 2026-05-07  
**Gestionnaire des Plans :** ARCos (🟠 ARC) & 👤 Développeur humain




