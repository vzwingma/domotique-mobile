# ADR 003 — Formaliser `tsc --noEmit` comme quality gate bloquant en CI

- **Statut** : Accepté
- **Date** : 2026-05-07
- **Décideurs** : Équipe domoticz-mobile
- **Portée** : CI, qualité TypeScript, gouvernance de merge

## Contexte

Le projet `domoticz-mobile` repose sur une architecture TypeScript stricte avec séparation de responsabilités :

- **Models** : contrat de données métier,
- **Services** : accès API Domoticz et transformations,
- **Controllers** : orchestration métier,
- **UI (screens/components)** : rendu et interactions.

La remédiation AP-002 a confirmé qu'un défaut de typage dans une couche peut se propager rapidement aux autres (ex: payload API mal typé, promesse mal contractée, props incohérentes).  
Le contrôle `npx tsc --noEmit` est déjà présent en CI ; cette ADR formalise sa valeur de **garde-fou bloquant**.

## Décision

Nous décidons de maintenir `npx tsc --noEmit` comme **quality gate obligatoire et bloquant** dans le pipeline CI.

### Règles associées

1. Le merge est refusé si le type-check échoue.
2. La commande locale de référence et la commande CI doivent rester identiques :

```bash
npx tsc --noEmit
```

3. Aucun contournement ne doit être introduit pour “faire passer” la CI :
   - pas de baisse globale de sévérité TypeScript,
   - pas d'exclusion opportuniste de dossiers,
   - pas de suppression silencieuse d'erreurs de typage.

## Alternatives évaluées

### Alternative A — Assouplir TypeScript (`strict` partiel)

**Rejetée** : réduit le signal qualité, augmente la dette technique et masque des incohérences inter-couches.

### Alternative B — Exclure certaines zones du type-check

**Rejetée** : crée des angles morts (notamment sur les frontières service/controller/UI) et retarde la détection des régressions.

### Alternative C — Rendre le check non bloquant

**Rejetée** : supprime la garantie de qualité attendue avant merge et rend le pipeline moins fiable comme indicateur de release readiness.

## Conséquences

### Positives

- Détection précoce des régressions de typage.
- Contrats plus stables entre models/services/controllers/UI.
- Cohérence renforcée entre exécution locale et CI.
- Réduction du risque de régressions fonctionnelles liées aux types.

### Coûts / trade-offs

- Effort immédiat de correction plus élevé sur certaines PR.
- Discipline continue requise pour maintenir un typage strict.
- Possibles itérations supplémentaires avant merge sur branches en dérive.

## Mise en œuvre et suivi

- Workflow CI : `../../.github/workflows/ci.yml` (job `Lint & Type Check`, étape `Run TypeScript check`).
- Plan d'action : `../../.github/plans/002_typescript_ci_remediation.plan.md`.
- Reporting : `../../.github/plans/002_reports/PHASE_3_COMPLETION_REPORT.md` et `../../.github/plans/002_reports/PHASE_4_COMPLETION_REPORT.md`.

## Références

- [Plan AP-002](../../.github/plans/002_typescript_ci_remediation.plan.md)
- [Rapport Phase 3 AP-002](../../.github/plans/002_reports/PHASE_3_COMPLETION_REPORT.md)
- [Rapport Phase 4 AP-002](../../.github/plans/002_reports/PHASE_4_COMPLETION_REPORT.md)
