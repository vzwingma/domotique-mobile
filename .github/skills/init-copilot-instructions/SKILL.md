---
name: init-copilot-instructions
description: "Initialise les instructions Copilot pour un nouveau projet. Utiliser pour : \"initialise les instructions Copilot\", \"génère les instructions pour ce projet\", \"crée un copilot-instructions.md\", \"configure Copilot pour ce projet\". Prend en paramètre le type de projet et extrait les informations du code source."
disable-model-invocation: true
---
# Initialisation des Instructions Copilot

> **Prérequis** : Avant lancer prompt, fichiers suivants doivent exister projet cible (copiés depuis dépôt transverse) :
> - `.github/agents/` — 4 agents génériques (`Arcos.agent.md`, `Devon.agent.md`, `Qalvin.agent.md`, `Docly.agent.md`)
> - `.github/prompts/` — prompts réutilisables
> - `.github/PLANS.md` — guide Plans d'Action
>
> Prompt initialise uniquement fichiers **spécifiques projet** : `copilot-instructions.md` et 4 fichiers `instructions/`.
> Pour copier prérequis, utiliser d'abord prompt `migrate-to-template`.

Mission : **générer et initialiser** fichier `.github/copilot-instructions.md` pour nouveau projet, basé sur :

1. **Template générique** (`.github/copilot-instructions.template.md`) présent dans dépôt transverse
2. **Analyse code source** projet cible
3. **Conventions réelles** appliquées dans code

## 📋 Étapes

### 1. Lire le template générique

Lire intégralement `.github/copilot-instructions.template.md` pour comprendre structure base.

### 2. Analyser le projet cible

Parcourir dépôt et identifier :

- **Structure projet** : Explorer dossiers principaux (src/, app/, lib/, etc.)
- **Stack technologique** : Identifier langage (TypeScript, Python, Go, etc.), framework principal (React, Vue, Django, Spring, etc.)
- **Type projet** : Catégoriser (frontend, backend, fullstack, mobile, CLI, lib, etc.)
- **Plateforme** : Web, mobile (iOS/Android), desktop, CLI, API, etc.
- **Gestion état** : Context API, Redux, Zustand, MobX, etc. (si pertinent)
- **Patterns architecturaux** : Couches (components, services, models), DDD, MVVM, etc.
- **Conventions existantes** : Naming files, imports, styling, testing patterns, etc.

### 3. Remplir les sections du template

Pour chaque placeholder `[...]` du template, fournir valeur adaptée :

| Placeholder | Source d'information | Exemple |
|---|---|---|
| `[NOM_DU_PROJET]` | Nom repo ou package.json name | "Domoticz Mobile", "API-Gateway", "Design System" |
| **Présentation du Projet** | README, description, package.json, main.swift, etc. | Stack tech, domaine métier, plateformes |
| **Commandes** | package.json scripts, Makefile, build scripts, etc. | `npm start`, `npm test`, `go build`, etc. |
| **Architecture** | Structure dossiers + patterns observés | Diagram ASCII ou description hiérarchique |
| **Conventions Clés** | Fichiers existants du code | Nommage, TypeScript config, ESLint, Prettier, etc. |
| **État du Projet** | Code analysis + notes | État maintenance, patterns erreur, dépendances clés |

> 💡 **Parallélisation possible** : Étapes 4 et 5 (génération `copilot-instructions.md` et 4 fichiers `instructions/`) peuvent être exécutées en parallèle avec `/fleet` si infos analyse (étape 2) disponibles.

### 4. Générer le fichier

Créer `.github/copilot-instructions.md` en :
1. Copiant template
2. Remplaçant tous placeholders par valeurs projet
3. Supprimant sections `[📌 À COMPLÉTER : ...]` si remplies
4. Conservant sections génériques (agents, workflow, plans d'action, diagrammes)

### 5. Générer ou fusionner les fichiers d'instructions agents

Lire les instructions existantes dans `.github/instructions/` du projet cible pour les cinq rôles :
`orchestrator`, `architect`, `dev`, `qa`, `doc`. Conserver leurs spécificités vérifiées, puis les compléter avec
les conventions observées à l'étape 2. Ne pas dépendre de fichiers `*.instructions.template.md` ; s'ils existent,
les utiliser uniquement comme référence complémentaire.

Vérifier notamment :
- `dev.instructions.md` : stack, versions, fichiers de constantes, service HTTP, structure et commandes réelles
- `qa.instructions.md` : framework, commandes CI, rapport de couverture, mocks et cas d'erreur
- `doc.instructions.md` : chemins de documentation, diagrammes et versions maintenues
- `architect.instructions.md` : couches, état partagé, service réseau, routing et intégrations
- `orchestrator.instructions.md` : sources de contexte, plans persistés, gates et contenu des délégations

Créer ou mettre à jour les cinq fichiers dans `.github/instructions/`. Remplacer les placeholders déterminables ;
signaler séparément toute valeur qui ne peut pas être vérifiée.

### 6. Auditer et enrichir (optionnel)

Si projet dispose autres fichiers référence (CONTRIBUTING.md, ARCHITECTURE.md, BEST_PRACTICES.md, etc.), les lire et enrichir sections correspondantes fichier généré.

## ✅ Checklist de Livraison

- [ ] Fichier `.github/copilot-instructions.md` créé
- [ ] Les cinq fichiers `.github/instructions/*.instructions.md` sont créés ou fusionnés avec les conventions réelles
- [ ] Tous placeholders `[...]` remplacés par valeurs réelles
- [ ] Placeholders critiques remplacés (minimum : NOM_DU_PROJET, stack technique)
- [ ] Sections `[📌 À COMPLÉTER : ...]` supprimées ou complétées
- [ ] Structure sections conservée (ordre, hiérarchie)
- [ ] Sections génériques intactes (Agents, Workflow, Plans d'Action, Diagrammes)
- [ ] Exemples code issus codebase réel (si pertinent)
- [ ] Pas références fichiers inexistants
- [ ] Langue française conservée pour tout texte narratif
- [ ] Fichier lisible et bien formaté (Markdown)
- [ ] `.github/agents/` contient 4 fichiers (`Arcos.agent.md`, `Devon.agent.md`, `Qalvin.agent.md`, `Docly.agent.md`)
- [ ] `.github/skills/` contient 4 skills partagés (`plan-phase-execution/SKILL.md`, `plan-creation/SKILL.md`, `fleet-guide/SKILL.md`, `adr-writing/SKILL.md`)
- [ ] `.github/PLANS.md` accessible
- [ ] `docs/ARCHITECTURE.md` existe (créer depuis template : `cp docs/ARCHITECTURE.template.md docs/ARCHITECTURE.md`)
- [ ] `docs/adr/` existe (créer si absent : `mkdir -p docs/adr`)

## 💡 Conseils

1. **Soyez précis** : Observer et décrire ce qui existe réellement, pas hypothèses
2. **Soyez concis** : Instructions Copilot lues régulièrement ; rester synthétique
3. **Soyez pratiques** : Inclure commandes réelles, patterns réels observés
4. **Conservez la structure** : Pas réorganiser sections template, sauf si très pertinent
5. **Exemples du code** : Quand utile, inclure patterns extraits code source réel

## 🎯 Résultat

À fin, fichier `.github/copilot-instructions.md` doit être **source de vérité** pour Copilot :
- Décrit fidèlement état projet
- Fournit conventions claires et appliquées
- Guide agents dans contexte projet spécifique
- Reste à jour et maintenu par projet