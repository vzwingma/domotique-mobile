# 📋 Index des Plans d'Action (AP)

Cet index liste uniquement les plans et leur **statut global**.

> **Règle d'indexation :** ne pas détailler les phases dans ce fichier.  
> Les détails de phases restent dans les fichiers `*.plan.md` et les rapports `*_reports/`.

---

## Plans actifs / en cours

| AP | Fichier | Objectif | Statut global |
|---|---|---|---|
| AP-005 | [`005_optimisations_finops.plan.md`](./005_optimisations_finops.plan.md) | Optimisations FinOps : modèle DEVon Haiku, sync table modèles, compression copilot-instructions | ⏳ PLANIFIÉ |

---

## Plans archivés / complétés

| AP | Fichier | Objectif | Statut global |
|---|---|---|---|
| AP-001 | [`001_modernisation_complète.plan.md`](./001_modernisation_complète.plan.md) | Modernisation globale (tests, dépendances, architecture, performance, CI/CD, doc) | ✅ COMPLÉTÉ |
| AP-002 | [`002_typescript_ci_remediation.plan.md`](./002_typescript_ci_remediation.plan.md) | Remédiation CI TypeScript (`tsc --noEmit`) | ✅ COMPLÉTÉ |
| AP-003 | [`003_sonarcloud_remediation.plan.md`](./003_sonarcloud_remediation.plan.md) | Remédiation SonarCloud (Reliability + Maintainability) | ✅ COMPLÉTÉ |
| AP-004 | [`004_fix_race_condition_post_commande.plan.md`](./004_fix_race_condition_post_commande.plan.md) | Fix race condition affichage état post-commande (volet/lumière/thermostat) | ✅ COMPLÉTÉ |

---

## Règles de maintenance (obligatoires)

1. Ce fichier est un **index synthétique** : plans + statuts globaux uniquement.
2. **Aucun statut de phase** ne doit apparaître ici.
3. À chaque changement de statut d'un plan (`PLANIFIÉ`, `EN_COURS`, `BLOQUÉ`, `COMPLÉTÉ`), ce fichier doit être mis à jour dans le même changement.

---

**Dernière mise à jour :** 2026-06-01
