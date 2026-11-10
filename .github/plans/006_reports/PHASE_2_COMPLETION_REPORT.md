# Phase 2 : Tests et recette

**Plan :** `.github/plans/006_echelle_segmentee_slider_volets.plan.md`
**Responsable Agent :** 🟢 QALvin ; reprise directe par ⚫ MAINa après blocage des outils du sous-agent
**Date Début :** 2026-11-10
**Dernière validation :** 2026-11-10
**Statut :** 🔄 Tests automatisés terminés — recette Android humaine en attente

## Tâches

- T2.1 : ✅ tests exhaustifs du module de conversion ; couverture 100 %.
- T2.2 : ✅ tests du slider segmenté et resynchronisation du niveau ; couverture 100 %.
- T2.3 : ✅ tests d'intégration et isolation des profils, commandes en pourcentages.
- T2.4 : recette Android avec 👤 — en attente ; ne pas assimiler aux tests automatisés.

## Fichiers créés

- `app/services/__tests__/BlindLevelScale.service.test.ts`
- `app/components/__tests__/segmentedBlindSlider.component.test.tsx`
- `app/components/__tests__/blindDevice.profiles.test.tsx`

Aucun code de production ni test préexistant modifié pendant cette reprise.
Les rapports générés sous `coverage/` ont été actualisés par Jest.

## Preuves

- Tests ciblés des trois nouveaux fichiers avec couverture : **3 suites, 38 tests réussis**.
- Commande ciblée : `npm test -- --watchAll=false --runInBand --runTestsByPath app\services\__tests__\BlindLevelScale.service.test.ts app\components\__tests__\segmentedBlindSlider.component.test.tsx app\components\__tests__\blindDevice.profiles.test.tsx --coverage --collectCoverageFrom=app/services/BlindLevelScale.service.ts --collectCoverageFrom=app/components/segmentedBlindSlider.component.tsx`.
- Suite du dépôt : `npm test -- --watchAll=false --runInBand --coverage --testPathIgnorePatterns='\\.claude\\worktrees'` : **50 suites, 1 056 tests, 12 snapshots réussis**.
- Couverture globale : statements **83,65 %**, branches **81,50 %**, fonctions **83,18 %**, lignes **84,67 %**. Seuil 80 % atteint.
- `BlindLevelScale.service.ts` : **100 %** statements, branches, fonctions et lignes.
- `segmentedBlindSlider.component.tsx` : **100 %** statements, branches, fonctions et lignes.
- `npm run typecheck` : exit 0.
- `npm run lint` : exit 0.
- `npm run validate:expo` : exit 0, **20/20 vérifications réussies**.
- `git diff --check` : exit 0.

### Protection contre les régressions

- Les 101 entiers 0..100 effectuent un aller-retour exact, avec ordre strictement croissant ; jonctions et arrondis vérifiés.
- La sentinelle 0,1, les valeurs non finies et les bornes sont couvertes.
- Le test de resynchronisation reçoit 50 puis 60, vérifie l'annonce accessible à 60 et exige une émission à 50 lorsque le curseur revient à 50. Il détecte le défaut relevé par la revue de Phase 1 (accessibilité périmée et émission supprimée).
- Les tests d'intégration rendent le véritable slider segmenté avec les véritables conversions et `overrideNextValue`, tout en mockant l'envoi de commande.
- Les tests de profils pilotent explicitement `PROFILE` et fournissent `PROFILES_ENV.V` au mock ; ils ne reposent pas sur les variables d'environnement ignorées par les anciens mocks.
- Aux positions 0, 1/6, 1/3, 2/3, 11/15 et 1, les commandes reçues sont respectivement 0,1 (sentinelle fermée), 5, 10, 50, 60 et 100.
- previewC, production et profil absent restent linéaires ; ONOFF sans slider et volet inactif sont couverts.
- Tests lumières et favoris inchangés et réussis dans la suite globale.

### Historique du blocage d'outils

QALvin n'a pu écrire lors des deux tentatives : outils disponibles limités à
`view`, `powershell`, `read_powershell`, `stop_powershell`, `list_powershell`, `grep`, `glob`.
La reprise directe utilise l'outil `apply_patch` de MAINa, sans écriture de fichiers via terminal.

## Recette Android à réaliser par 👤

Sur un build **previewV**, vérifier :

1. Repères 0 / 10 / 50 / 100 % alignés avec la piste aux quatre positions prévues ; le retrait initial `TRACK_INSET=10` n'est pas encore calibré sur appareil.
2. Niveaux 1 à 9 % atteignables et commande conforme au niveau affiché.
3. Niveau 60 % placé vers 73 % de la course.
4. TalkBack annonce des pourcentages et non une position entre 0 et 1.
5. Hauteur et lisibilité des cartes acceptables, notamment en grille tablette.

Aucun appareil ni résultat de recette manuelle revendiqué. Si un défaut apparaît, revenir vers l'implémentation avant Gate #3.

## Synthèse

Gate #2 approuvé. Aucun changement de production autorisé pendant cette phase.
T2.1 à T2.3 terminées ; T2.4 nécessite toujours une recette humaine sur appareil Android.
Gate #3 requis avant documentation.
