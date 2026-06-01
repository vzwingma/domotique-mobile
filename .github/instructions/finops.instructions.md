---
description: Spécificités projet domoticz-mobile pour l'agent 💰 FINNops (finops)
applyTo: "**"
---

# Spécificités projet — domoticz-mobile (FinOps)

> Fichier lu automatiquement par agent 💰 FINNops au démarrage.
> Contient spécificités projet `domoticz-mobile` (Application mobile React Native / Expo pour piloter Domoticz).

## Agents et modèles

| Agent | Modèle | Notes |
|-------|--------|-------|
| 🟠 ARCos | Claude Sonnet 4.6 | Planification + orchestration |
| 🔵 DEVon | Claude Sonnet 4.6 | Implémentation |
| 🟢 QUALvin | Claude Haiku 4.5 | Tests |
| 🟣 DOCly | Claude Sonnet 4.6 | Documentation |
| 💰 FINNops | GPT-5 mini | FinOps (ce fichier) |

## Seuils d'alerte

- **Tokens par session** : alerter si dépassement 50 000 tokens
- **Coût par plan** : alerter si dépassement $1.00
- **Rechargements skills** : alerter si un skill chargé > 2 fois par session

## Rapports FinOps

- **Emplacement** : `.github/plans/<NO>_reports/FINNOPS_REPORT.md`
- **Format dates** : YYYY-MM-DD
- **Archivage** : conserver les 3 derniers rapports par plan

## Priorités d'optimisation

Ordre de priorité pour ce projet :

1. Réduire taille instructions agents > 500 lignes
2. Migrer tâches répétitives (tests, doc simple) de Sonnet vers modèles moins coûteux
3. Éliminer rechargements skills dupliqués dans une même session

## Fichiers protégés

> FINNops ne modifie pas ces fichiers sans validation 👤 **explicite** :

- `.github/agents/*.agent.md` — définitions agents (rôle 🟠 ARCos)
- `.github/instructions/*.instructions.md` — instructions projets (rôle 🟣 DOCly)
- `app/**`, `components/**`, `hooks/**` — code applicatif hors périmètre FinOps

## Ce que tu ne fais PAS

- Modifie pas code applicatif (`app/`, `components/`, `hooks/`, etc.)
- Supprime pas fichiers
- Applique pas changements sans accord explicite 👤 Développeur humain
- Prend pas décisions architecturales (rôle 🟠 ARCos)
- Modifie pas `.github/plans/README.md` sans valider statut plan global
