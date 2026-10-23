---
name: conventions-orchestrator
description: "Conventions projet domoticz-mobile pour ⚫ MAINa : orchestration, gates humains, contenu des délégations. Prioritaire sur le générique."
user-invocable: false
---

# Conventions projet — domoticz-mobile (orchestration)

> Projet : `domoticz-mobile` — application mobile React Native / Expo (Android + Web) pour piloter un serveur Domoticz.

## Contexte à vérifier avant délégation

- `README.md`, `docs/ARCHITECTURE.md`, ADR existants (`docs/adr/`, ADR-001 → ADR-014)
- `docs/API.md` (contrats Domoticz), `docs/TESTING.md`, `CONTRIBUTING.md`, plans précédents (`.claude/plans/`)

## Règles d'orchestration propres au projet

- Plan d'Action persistant (`.claude/plans/`) obligatoire pour toute demande menant à une modification de
  code, sauf dispense explicite du 👤. Formaliser = `.claude/plans/<NO>_<slug>.plan.md` +
  `.claude/plans/<NO>_reports/` + mise à jour `.claude/plans/README.md` dans le même changement.
- Consulter 🟠 ARCos pour toute décision d'architecture ou changement structurel (nouveau Context, nouvelle
  bibliothèque, nouvelle route, changement responsive).
- Gates #0 → #4 obligatoires ; décisions consignées dans le journal des gates du plan.
- Rendu téléphone (< 600dp) = référence : toute évolution responsive/tablette doit prouver l'absence de
  régression téléphone (ADR-013/014).
- Avant PR : `npm run validate:expo` (expo-doctor) obligatoire (ADR-001), en plus de lint/typecheck/tests.

## Contenu des délégations

### Vers 🟠 ARCos
Inclure : besoin, contraintes Expo SDK ~56 / React Native 0.85 / TypeScript strict, couches impactées
(`app/(tabs)/`, `app/components/`, `app/controllers/`, `app/services/`, `app/models/`, `app/enums/`,
`components/`, `hooks/`), exigences non fonctionnelles, liens `docs/ARCHITECTURE.md` et ADR pertinents.
Attendu : ≥ 2 options, avantages/inconvénients/risques/impacts, recommandation, besoin d'ADR éventuel.

### Vers 🔵 DEVon
Inclure : phase validée, fichiers cibles, comportement attendu, contraintes TypeScript strict, interdiction
d'élargir le scope, commandes de vérification (`npm run typecheck`, `npm run lint`,
`npm test -- --watchAll=false`).
Attendu : code focalisé, liste des fichiers modifiés, hypothèses, preuves de vérification.

### Vers 🟢 QALvin
Inclure : changements DEVon, cas nominaux, erreurs (HTTP 403/404/500), limites, composants/services à
couvrir, commande de test ciblée (`npm test -- --watchAll=false <chemin>`), plus `npm run typecheck` et
`npm run validate:expo`.
Attendu : tests créés/modifiés, résultats, couverture vs cibles, points bloquants.

### Vers 🟣 DOCly
Inclure : changements publics, décisions d'architecture, fichiers modifiés, comportements à documenter,
entrée `CHANGELOG.md` (racine, Keep a Changelog) éventuelle.
Attendu : docs synchronisées sans réécriture inutile, liens cohérents, ADR si décision majeure.

## Ce que MAINa ne fait pas

- Coder, tester ou documenter à la place des agents (sauf tâche triviale explicitement demandée).
- Décider une architecture majeure sans ARCos ni validation 👤.
- Clôturer une initiative sans validation 👤 des livrables.
- Inventer des conventions absentes du code ou de la documentation.
- Considérer un Plan d'Action comme créé s'il n'existe que dans la réponse et pas dans `.claude/plans/`.
