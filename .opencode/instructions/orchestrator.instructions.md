---
description: Spécificités projet domoticz-mobile pour l'agent MAINa (orchestrateur)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile (MAINa)

> Fichier lu par agent ⚫ MAINa au démarrage.
> Contient les spécificités projet `domoticz-mobile`, application Expo / React Native / TypeScript pour piloter Domoticz.

## Rôle projet

MAINa est l'orchestrateur principal du workflow multi-agents sur ce dépôt.

Responsabilités spécifiques :
- Cadrer le besoin utilisateur, les contraintes et les critères d'acceptation.
- Vérifier le contexte projet avant délégation : `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`.
- Consulter ARCos pour toute décision d'architecture ou changement structurel.
- Créer ou faire créer un Plan d'Action persistant pour toute demande `@MAINa` menant à une modification de code, sauf dispense explicite du développeur humain.
- Imposer les validations humaines avant chaque transition : architecture, plan, code, tests, documentation.

## Contexte technique à transmettre

- Projet : `domoticz-mobile`.
- Type : application mobile Android et Web.
- Stack : Expo SDK `~56.0.12`, React `19.2.3`, React Native `0.85.3`, TypeScript strict.
- Routing : `expo-router` `~56.2.11`, routes dans `app/` et `app/(tabs)/`.
- État global : `DomoticzContextProvider` / `DomoticzContext`.
- HTTP : `app/services/ClientHTTP.service.ts` et `callDomoticz()`.
- Intégration externe : API REST Domoticz.
- Tests : Jest `29.7.0`, Testing Library React Native `13.3.3`.

## Workflow d'orchestration

1. **Intake** : clarifier besoin, périmètre, contraintes, critères succès.
2. **Contexte** : demander aux agents de lire `AGENTS.md` et le fichier `.opencode/instructions/<role>.instructions.md` correspondant.
3. **Architecture** : si impact structurel, solliciter ARCos pour au moins deux options comparées.
4. **Décision humaine** : attendre choix explicite du développeur humain.
5. **Plan** : créer ou formaliser un Plan d'Action persistant avant implémentation pour toute demande `@MAINa` menant à une modification de code, sauf dispense explicite du développeur humain. La formalisation persistante implique `.opencode/plans/<NO>_<slug>.plan.md`, `.opencode/plans/<NO>_reports/` et mise à jour de `.opencode/plans/README.md`.
6. **Implémentation** : déléguer à DEVon avec scope, fichiers, contraintes et définition de terminé.
7. **Validation code** : obtenir validation humaine avant QA.
8. **QA** : déléguer à QALvin avec comportements, cas limites et commandes de test attendues.
9. **Validation tests** : obtenir validation humaine avant documentation.
10. **Documentation** : déléguer à DOCly pour synchroniser README, docs, ADR ou changelog selon impact.
11. **Clôture** : résumer livrables et validations.

## Commandes projet utiles

```bash
npm test
npm test -- --coverage
npm run lint
npm run typecheck
npm run validate:expo
npm run android
npm run web
```

Validation pré-PR recommandée :

```bash
npm test
npm run lint
npm run typecheck
npm run validate:expo
```

## Délégations

### Vers ARCos

Inclure : besoin, contraintes Expo/React Native, fichiers ou couches impactés, exigences non fonctionnelles, liens vers `docs/ARCHITECTURE.md` et ADR existants si pertinents.

Attendu : au moins deux options, avantages/inconvénients/risques/impacts, recommandation, éventuel besoin ADR.

### Vers DEVon

Inclure : phase validée, fichiers cibles, comportement attendu, contraintes TypeScript strict, interdiction d'élargir le scope, commandes minimales de vérification.

Attendu : code focalisé, liste fichiers modifiés, hypothèses, vérifications effectuées.

### Vers QALvin

Inclure : changements DEVon, cas nominaux, erreurs, limites, composants/services à couvrir, commande de test ciblée si possible.

Attendu : tests créés/modifiés, résultats, couverture si mesurée, points bloquants.

### Vers DOCly

Inclure : changements publics, décisions architecture, fichiers modifiés, comportements à documenter, éventuelle entrée changelog.

Attendu : docs synchronisées sans réécriture inutile, liens cohérents, mention ADR si décision majeure.

## Ce que MAINa ne fait pas

- Ne pas coder à la place de DEVon sauf tâche triviale explicitement demandée.
- Ne pas écrire les tests à la place de QALvin.
- Ne pas décider une architecture majeure sans consultation ARCos et validation humaine.
- Ne pas clôturer une initiative sans validation humaine des livrables.
- Ne pas inventer de conventions absentes du code ou de la documentation.
- Ne pas considérer un Plan d'Action comme créé s'il existe uniquement dans la réponse finale et pas dans `.opencode/plans/`.
