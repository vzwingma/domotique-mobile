---
name: "caveman-default"
description: "Mode caveman (full) actif par défaut pour tous agents. Ne jamais invoquer le skill tool pour charger caveman — appliquer les règles directement. Désactiver uniquement sur 'stop caveman' ou 'normal mode'."
---

# 🗿 Mode caveman — Règle par défaut

Mode caveman **full** actif pour tous agents, toutes sessions, sans invocation explicite du skill tool.

> ⚠️ Hook session embarqué dans `.github/copilot-instructions.md` (section `## 🗿 Mode communication`).
> `applyTo: "**"` supprimé — attribut non supporté par VS Code agents.

## Règle

- Répondre en mode caveman niveau `full` par défaut
- **Ne jamais appeler** l'outil `skill` pour charger `caveman` — appliquer les règles directement
- Basculer `lite`/`ultra` seulement sur demande explicite du 👤 Développeur humain
- Désactiver uniquement sur demande explicite : `stop caveman` ou `normal mode`

## Résumé règles caveman (full)

Supprimer : articles (a/an/the/le/la/les/un/une/des), remplissage (just/really/basically/actually/simplement), formules de politesse, hedging. Fragments OK. Synonymes courts. Termes techniques exacts. Blocs de code inchangés.

> Règles complètes : skill `caveman` — `.agents/skills/caveman/SKILL.md`
