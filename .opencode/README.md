# OpenCode — domoticz-mobile

Ce dossier contient la configuration et les artefacts OpenCode du projet `domoticz-mobile` : agents, instructions spécifiques projet, prompts, skills et guides de Plans d'Action.

## Structure

```text
.opencode/
├── agents/                         # Agents OpenCode du projet
│   ├── Maina.agent.md              # Orchestrateur principal
│   ├── Arcos.agent.md              # Architecture
│   ├── Devon.agent.md              # Implémentation
│   ├── Qalvin.agent.md             # Tests
│   └── Docly.agent.md              # Documentation
├── instructions/                   # Instructions projet par agent
│   ├── orchestrator.instructions.md # Spécificités MAINa
│   ├── architect.instructions.md   # Spécificités ARCos
│   ├── dev.instructions.md         # Spécificités DEVon
│   ├── qa.instructions.md          # Spécificités QALvin
│   ├── doc.instructions.md         # Spécificités DOCly
│   ├── architect.instructions.template.md
│   ├── dev.instructions.template.md
│   ├── qa.instructions.template.md
│   └── doc.instructions.template.md
├── prompts/
│   ├── init-copilot-instructions.prompt.md
│   └── update-copilot-instructions.prompt.md
├── skills/                         # Procédures partagées
├── CHANGELOG.md                    # Historique versions agents
├── PLANS.md                        # Guide Plans d'Action
└── README.md                       # Ce fichier
```

Le fichier racine `AGENTS.md` décrit le contexte projet partagé par tous les agents.

## Agents

| Agent | Fichier | Rôle |
|---|---|---|
| MAINa | `agents/Maina.agent.md` | Orchestration, cadrage, Plan d'Action, validations humaines |
| ARCos | `agents/Arcos.agent.md` | Architecture, comparaison de solutions, recommandations, ADR |
| DEVon | `agents/Devon.agent.md` | Implémentation TypeScript / React Native dans le scope validé |
| QALvin | `agents/Qalvin.agent.md` | Tests Jest / Testing Library React Native et couverture |
| DOCly | `agents/Docly.agent.md` | Documentation README, docs, ADR et instructions OpenCode |

Les agents génériques restent focalisés sur leur rôle. Les spécificités du dépôt sont dans `.opencode/instructions/*.instructions.md`.

## Instructions Projet

| Fichier | Lu par | Contenu |
|---|---|---|
| `instructions/orchestrator.instructions.md` | MAINa | Contexte orchestration, gates humains, commandes projet, délégations |
| `instructions/architect.instructions.md` | ARCos | Architecture Expo/React Native, couches, Domoticz, ADR |
| `instructions/dev.instructions.md` | DEVon | Stack, conventions code, HTTP, modèles, état global |
| `instructions/qa.instructions.md` | QALvin | Stack test, localisation tests, commandes et cas à couvrir |
| `instructions/doc.instructions.md` | DOCly | Fichiers doc, conventions, versions, responsabilités |

Les templates historiques restent disponibles pour réinitialiser ou adapter un autre projet :
- `architect.instructions.template.md`
- `dev.instructions.template.md`
- `qa.instructions.template.md`
- `doc.instructions.template.md`

Il n'existe pas de template MAINa dédié dans ce dépôt ; `orchestrator.instructions.md` a été créé à partir du modèle des autres fichiers et du rôle de `Maina.agent.md`.

## Prompts

| Prompt | Usage |
|---|---|
| `prompts/init-copilot-instructions.prompt.md` | Initialiser `AGENTS.md` et les instructions spécifiques projet depuis les templates |
| `prompts/update-copilot-instructions.prompt.md` | Auditer et mettre à jour `AGENTS.md` et les instructions existantes |

## Workflow Nominal

1. MAINa clarifie le besoin, le scope et les critères d'acceptation.
2. MAINa consulte ARCos si la demande touche l'architecture ou une décision structurante.
3. ARCos compare au moins deux options et recommande une solution.
4. Le développeur humain valide le choix.
5. MAINa crée ou formalise le Plan d'Action.
6. Le développeur humain valide le plan.
7. DEVon implémente le scope validé.
8. Le développeur humain valide le code.
9. QALvin écrit/exécute les tests.
10. Le développeur humain valide les tests.
11. DOCly synchronise la documentation.
12. Le développeur humain valide la clôture.

## Références Projet

- `AGENTS.md` : contexte global des agents et règles projet.
- `README.md` : documentation produit et scripts.
- `docs/ARCHITECTURE.md` : architecture réelle du projet.
- `docs/API.md` : intégration API REST Domoticz.
- `docs/TESTING.md` : stratégie de test.
- `docs/adr/` : décisions architecturales.
- `.opencode/PLANS.md` : format et exécution des Plans d'Action.

## Maintenance

- Modifier un agent implique d'incrémenter sa version dans la description frontmatter.
- Reporter les changements d'agents dans `.opencode/CHANGELOG.md`.
- Garder `AGENTS.md` et `.opencode/instructions/*.instructions.md` synchronisés avec la stack réelle.
- Mettre à jour ce README quand un agent, prompt, skill ou fichier d'instructions est ajouté, retiré ou renommé.
- Ne pas documenter de fichiers absents comme s'ils existaient.
