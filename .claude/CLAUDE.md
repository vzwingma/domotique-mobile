# Instructions Claude — Système Multi-Agents

> Configuration pour Claude Code (claude.ai/code, CLI, IDEs).
> Infrastructure orchestrée pour développement via 5 agents spécialisés.

## 🗿 Mode communication

Mode caveman **full** actif par défaut. Règles :
- Supprimer : articles, remplissage, formules de politesse, hedging
- Fragments OK. Synonymes courts. Termes techniques exacts. Code inchangé.
- Désactiver uniquement : `stop caveman` ou `normal mode`

---

## 📱 Présentation du Projet

**domoticz-mobile** — app mobile React Native/Expo pilotant équipements domotiques via serveur [Domoticz](https://www.domoticz.com/). Cible Android + Web. UI français.

**Stack** : Expo SDK ~56.0.13 · React 19.2.3 · React Native 0.85.3 · TypeScript strict · expo-router ~56.2.12 · Jest 29 + jest-expo · ESLint 9.39.1 (flat config)

### Commandes courantes

```bash
npm start                                   # Metro Expo Go (sans SSL)
npm run android                             # Build natif Android + lancement (avec SSL)
npm run web                                 # Lancer navigateur
npm test                                    # Jest mode watch
npm test -- path/to/file.test.tsx           # Un fichier précis
npm test -- --watchAll=false --coverage     # CI + couverture
npm run lint                                # ESLint via Expo
npm run typecheck                           # Vérif TypeScript stricte
npm run validate:expo                       # Gate obligatoire pré-PR (expo-doctor)
```

### Architecture (résumé)

Flux : `UI (5 onglets) → Controllers → Services (ClientHTTP) → Serveur Domoticz`, état global via `DomoticzContextProvider`.

```
app/
  (tabs)/          # 5 écrans : Favoris, Lumières, Volets, Températures, Maison
  components/      # *.component.tsx — composants écran
  controllers/     # *.controller.tsx — pont UI/services
  services/        # ClientHTTP.service.ts, DataUtils, DomoticzContextProvider
  models/          # Classes TS immuables (Device, Light, Blind, Thermostat...)
  enums/           # APIconstants, Colors, DomoticzEnum, TabsEnums
```

Détails complets : `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/TESTING.md`.

### Conventions clés

- Nommage : `*.component.tsx`, `*.controller.tsx`, `*.service.ts`, `*.model.ts`, `*.enum.ts`
- Modèles = classes TS `readonly`, pas interfaces
- État global via `useContext(DomoticzContext)` — jamais prop drilling
- Labels métier UI FR : "Allumé/Éteint", "Ouvert/Fermé", "Déconnecté", "Mixte" — jamais "On/Off"
- Thème sombre uniquement

Conventions détaillées par rôle → `.claude/instructions/*.instructions.md`.

### État du projet

- CI : GitHub Actions (lint + tests + coverage), SonarQube gate ≥80%
- Couverture cible : controllers 100%, services ≥90%, composants ≥70%, modèles ≥85%
- Pas de tests E2E/intégration actuellement
- Renovate : patches auto-merge, majors en draft PR

---

## Règle obligatoire MAINa — Plan + ADR

Initiative architecturale/infrastructure doit produire **avant** marquer tâche terminée :
1. Fichier `Plan d'Action` dans `.claude/plans/NNN_nom.plan.md`
2. ADR dans `docs/adr/NNN-titre-court.md` si décision majeure
3. Mise à jour `.claude/plans/README.md`

Créés dans même lot que implémentation, pas après coup.

---

## 👋 Agents Claude et Rôles

5 agents spécialisés, orchestrés par développeur humain.

### **⚫ MAINa** [v1.4]

**Rôle** : Maître orchestrateur, créateur du Plan d'Action et point d'entrée principal

**Responsabilités** :
- Comprendre demande, cadrer flux travail
- Consulter ARCos (et autres agents) pour analyse solutions avant créer le plan
- Créer Plan d'Action complet (skill plan-creation)
- Orchestrer délégations : DEVon → QALvin → DOCly
- Imposer validations humaines entre phases
- Fournir aide via `/maina-help`
- Lire `.claude/instructions/orchestrator.instructions.md` au démarrage

**Quand l'utiliser** : Workflow complet, orchestration multi-agents

**Livrable** : Plan d'Action validé + orchestration complète, séquencée, traçable

---

### **🟠 ARCos** [v4.7]

**Rôle** : Expert architecture consulté par MAINa

**Responsabilités** :
- Analyser problèmes complexes et concevoir solutions architecturales
- Présenter ≥2 options comparées avec recommandation motivée
- Prendre décisions stratégiques concernant techno, structure et approche
- Préparer contenu ADR après décisions architecturales majeures
- Lire `.claude/instructions/architect.instructions.md` au démarrage
- Lire `docs/ARCHITECTURE.md` au démarrage
- Exécuter tâches T*.* assignées dans le Plan d'Action créé par MAINa

**Quand l'utiliser** : "Analyse les options pour...", "Conçois architecture pour...", "Quelle approche pour..."

**Livrable** : Analyse comparative solutions + recommandation motivée

---

### **🔵 DEVon** [v4.3]

**Rôle** : Implémentateur code production

**Responsabilités** :
- Traduire exigences en code fonctionnel testé
- Respecter patterns architecturaux + conventions projet
- Code propre, maintenable, compilant
- Lire `.claude/instructions/dev.instructions.md` au démarrage

**Quand l'utiliser** : "Implémente cette fonctionnalité", "Code selon architecture"

**Livrable** : Code propre, compilant sans erreurs

---

### **🟢 QALvin** [v4.4]

**Rôle** : Expert assurance qualité et tests

**Responsabilités** :
- Écrire tests unitaires complets (composants, services)
- Couverture test ≥80%
- Tester cas limites, scénarios erreur
- Lire `.claude/instructions/qa.instructions.md` au démarrage

**Quand l'utiliser** : "Écris tests pour...", "Génère tests unitaires"

**Livrable** : Tests passants, rapports couverture

---

### **🟣 DOCly** [v4.3]

**Rôle** : Gardien documentation

**Responsabilités** :
- Mettre à jour README, `docs/`, guides
- Maintenir `docs/ARCHITECTURE.md` à jour
- Créer ADRs dans `docs/adr/` sur délégation ARCos
- Lire `.claude/instructions/doc.instructions.md` au démarrage

**Quand l'utiliser** : "Mets à jour doc", "Garde docs en sync"

**Livrable** : Documentation à jour, claire, complète

---

## 🔄 Workflow strict

1. **Cadrage** (développeur) → Besoin + critères
2. **Orchestration** (MAINa) → Déclencher mode PLAN, consulter ARCos
3. **Analyse solutions** (ARCos) → ≥2 options + recommandation
4. **Gate #0** → Choix solution par développeur
5. **Plan d'Action** (MAINa) → Créer plan complet (skill plan-creation)
6. **Gate #1** → Validation plan avant implémentation
7. **Implémentation** (DEVon) → Code tâches assignées
8. **Gate #2** → Validation code avant tests
9. **Tests** (QALvin) → Écrire tests nominaux + erreurs + limites
10. **Gate #3** → Validation tests avant doc
11. **Documentation** (DOCly) → Mettre à jour docs
12. **Gate #4** → Validation doc + clôture initiative

Parallélisation possible après Gate #2 : QALvin + DOCly peuvent travailler en parallèle si tâches indépendantes.

---

## 📋 Plans d'Action

Initiatives majeures orchestrées via Plan d'Action :

- **Fichier plan** : `.claude/plans/<NO>_<nom>.plan.md`
- **Rapports phase** : `.claude/plans/<NO>_reports/PHASE_N_...md`
- **Index** : `.claude/plans/README.md`
- **Guide complet** : `.claude/PLANS.md`

Plans coordonnent travail multi-phases, garantissent traçabilité.

---

## 📐 Instructions Projet (`.claude/instructions/`)

Chaque agent lit au démarrage son fichier instructions spécifique :

| Fichier | Agent | Contenu |
|---|---|---|
| `orchestrator.instructions.md` | ⚫ MAINa | Orchestration, gates humains, délégations |
| `architect.instructions.md` | 🟠 ARCos | Conventions archi, couches, protocoles |
| `dev.instructions.md` | 🔵 DEVon | Stack technique, versions, conventions |
| `qa.instructions.md` | 🟢 QALvin | Framework test, commandes, cas à couvrir |
| `doc.instructions.md` | 🟣 DOCly | Fichiers `/docs`, conventions documentation |

Fichiers déjà personnalisés pour ce projet (générés depuis templates `*.instructions.template.md` du dépôt transverse).

---

## 🛠️ Skills Partagés (`.claude/skills/`)

Procédures réutilisables, incluses auto dans contexte tous agents :

| Skill | Contenu |
|---|---|
| `plan-phase-execution` | Procédure exécution phase (avant/pendant/après, rapports) |
| `plan-creation` | Création Plan d'Action (MAINa — orchestrateur) |
| `fleet-guide` | Guide parallélisation `/fleet` |
| `adr-writing` | Rédaction ADR (ARCos prépare, DOCly rédige) |
| `caveman-default` | Mode caveman règles par défaut |
| `compact-context` | Compression contexte mémoire |
| `maina-help` | Aide MAINa + workflow |
| `copilotignore` | Respect fichier `.copilotignore` |
| `safety-rules` | Sécurité : opérations destructives interdites |

---

## 📚 Fichiers clés

### `.claude/agents/`

- `README.md` — Index agents, workflow, exemples
- `Maina.agent.md` — Orchestrateur
- `Arcos.agent.md` — Architecte
- `Devon.agent.md` — Implémentateur
- `Qalvin.agent.md` — Expert QA
- `Docly.agent.md` — Gardien docs

### `.claude/instructions/`

Instructions personnalisées par agent (générées depuis templates dépôt transverse).

### `.claude/prompts/`

Prompts d'initialisation/mise à jour instructions.

### `.claude/skills/`

Skills partagés tous agents.

### `.claude/plans/`

Index plans + rapports phases.

---

## 🚀 Démarrage rapide

### Travail simple

Invoquer agent directement :

```
@ARCos "Conçois architecture pour..."
@DEVon "Implémente cette fonctionnalité..."
@QALvin "Écris tests pour..."
@DOCly "Mets à jour documentation..."
```

### Travail complexe (multi-phases)

Utiliser MAINa orchestrateur :

```
@MAINa "J'ai ce besoin : [description]"

# MAINa :
# 1. Clarifie
# 2. Active ARCos pour plan
# 3. Attend validation
# 4. Active DEVon pour code
# ... jusqu'à clôture
```

---

## 🔐 Règles absolues

Tous agents respectent :

- ⛔ JAMAIS supprimer fichiers/répertoires
- ⛔ JAMAIS commandes SQL destructives
- ⛔ JAMAIS `git clean`, `git reset --hard`
- ⛔ JAMAIS modifier fichiers hors périmètre
- ⛔ **Respect ABSOLU `.copilotignore`**

En cas doute → demander confirmation développeur.

---

## 📖 Références

- [ARCos](./agents/Arcos.agent.md) — Architecture (analyse solutions)
- [DEVon](./agents/Devon.agent.md) — Implémentation
- [QALvin](./agents/Qalvin.agent.md) — Tests
- [DOCly](./agents/Docly.agent.md) — Documentation
- [MAINa](./agents/Maina.agent.md) — Orchestration + Plan d'Action
- [Plans d'Action](./PLANS.md) — Guide complet
