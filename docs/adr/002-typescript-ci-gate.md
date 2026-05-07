# ADR 002 — Conserver un gate TypeScript strict en CI

- **Statut** : Accepté
- **Date** : 2026-05-07
- **Décideurs** : Équipe domoticz-mobile

## Contexte

La remédiation AP-002 a réduit les erreurs de typage et confirmé le rôle de `tsc --noEmit` comme contrôle de cohérence transversal (modèles, services, controllers, composants).
Le pipeline CI exécute déjà ce contrôle dans le job lint/type-check ; la décision à formaliser est de le **conserver et renforcer comme gate bloquant**.

## Décision

Nous conservons `npx tsc --noEmit` en contrôle **strict et bloquant** en CI.

- Aucune tolérance de type via baisse de sévérité globale.
- Aucune exclusion de périmètre (notamment tests) pour “faire passer” la CI.
- Les corrections de typage sont traitées comme prérequis à la fusion.

## Alternatives évaluées et rejetées

1. **Desserrer la configuration stricte TypeScript** (`strict` partiel, options assouplies)  
   Rejetée : augmente la dette, masque des incohérences inter-couches.
2. **Exclure des zones du type-check (ex. tests ou dossiers ciblés)**  
   Rejetée : crée des angles morts et des régressions tardives.
3. **Rendre le check non bloquant / le skipper ponctuellement**  
   Rejetée : supprime la garantie de qualité attendue par AP-002.

## Conséquences

### Positives

- Détection précoce des régressions de typage avant merge.
- Cohérence renforcée entre modèles, services, controllers et UI.
- Signal CI clair et reproductible pour l’équipe.

### Négatives / trade-offs

- Coût de correction immédiat plus élevé lors des PR.
- Temps de remédiation potentiellement plus long sur branches en dérive.
- Exige une discipline continue sur la qualité des types.

## Références

- Pipeline CI : [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- Règles QA : [`.github/instructions/qa.instructions.md`](../../.github/instructions/qa.instructions.md)
- Plan AP-002 : [`.github/plans/002_typescript_ci_remediation.plan.md`](../../.github/plans/002_typescript_ci_remediation.plan.md)
