# Processus de veille des versions majeures (Expo / React / React Native)

**Document Version:** 1.0.0
**Last Updated:** 2026-07-08
**Audience:** Mainteneur(s) du projet
**Référence :** [ADR-007 — Processus de veille des montées de version majeures](./adr/007-processus-veille-majors-expo-react.md) (Option B retenue)

---

## 🎯 Objectif

Garantir un suivi régulier et non-oublié des montées de version majeures d'Expo SDK, React et React Native, **sans déclencher d'upgrade automatique**. Ce document décrit uniquement le *processus* de revue — pas de décision d'upgrade en soi.

## 🧭 Dispositif technique existant (Renovate)

`renovate.json` fournit déjà :

- **Dependency Dashboard** (`dependencyDashboard: true`) : une issue GitHub centralisant l'état de toutes les mises à jour de dépendances, y compris les majeures.
- **PR draft pour les majors** : les mises à jour majeures de `react-native`, `expo*`, `react` sont créées en **PR draft**, sans automerge (`prCreation: "draft"`, `automerge: false`).
- **Verrouillage des dépendances liées au SDK** : `react`, `react-dom`, `react-native-svg`, `react-test-renderer` ne sont pas mises à jour automatiquement (versions imposées par le SDK Expo).

Ce dispositif ne définit **aucune cadence de revue humaine** — c'est l'objet de ce document.

## 📅 Cadence de revue

### Revue trimestrielle (formelle)

À chaque trimestre (ex. calée sur une release mineure de l'app, ou sur une date fixe du calendrier) :

1. Ouvrir l'issue **"Dependency Dashboard"** (Renovate) sur le dépôt GitHub.
2. Lister toutes les PR draft majeures en attente (`react`, `react-native`, `expo*`).
3. Pour chaque major en attente, évaluer :
   - Changelog / breaking changes de la version cible
   - Effort de migration estimé
   - Bénéfice (sécurité, nouvelles fonctionnalités, fin de support de la version actuelle)
   - Impact sur les dépendances verrouillées (`react-native-svg`, etc.)
4. Décider, par major :
   - **Reporter** — documenter pourquoi (ex. effort/bénéfice défavorable pour l'instant)
   - **Planifier** — ouvrir un futur Plan d'Action dédié (`.claude/plans/`)
   - **Fermer** — si la mise à jour n'est plus pertinente

### Alerte automatisée mensuelle (filet de sécurité)

Un rappel léger, mensuel, pointant vers l'issue "Dependency Dashboard" (sans dupliquer son contenu), pour garantir qu'aucun trimestre entier ne s'écoule sans qu'un humain n'ait au moins consulté l'état des majors.

> Note : l'implémentation technique de ce rappel (ex. job planifié GitHub Actions) est hors périmètre de l'ADR-007 et de ce document — c'est un livrable de *processus*. Si son automatisation est retenue, elle fait l'objet d'un Plan d'Action dédié.

## 🚦 Grille de décision (par major en attente)

| Critère | Poids | Question |
|---|---|---|
| Breaking changes | Élevé | Combien de fichiers/patterns du projet sont impactés ? |
| Sécurité | Élevé | La version actuelle a-t-elle une faille connue ? |
| Fin de support | Élevé | La version actuelle SDK Expo est-elle encore maintenue ? |
| Besoin fonctionnel | Moyen | Une fonctionnalité du projet nécessite-t-elle la nouvelle version ? |
| Effort de migration | Moyen | Estimation en jours/semaines de développeur |
| Stabilité de la nouvelle version | Faible | Version récente avec retours d'expérience limités ? |

## ⚡ Critères de déclenchement d'un upgrade SDK (hors cadence trimestrielle)

Un upgrade peut être déclenché **en dehors** du cycle trimestriel si :

1. **Faille de sécurité critique** publiée sur une dépendance majeure verrouillée.
2. **Fin de support annoncée** de la version SDK Expo actuellement utilisée.
3. **Blocage fonctionnel avéré** — ex. besoin d'une API disponible uniquement dans une version majeure supérieure.

Dans ces cas, l'upgrade suit le même processus d'analyse (grille de décision ci-dessus) mais sans attendre la prochaine revue trimestrielle.

## ✅ Ce que ce processus ne fait PAS

- Ne déclenche **aucun** upgrade SDK automatique.
- Ne modifie pas le comportement Renovate existant (PR draft + Dependency Dashboard conservés tels quels).
- Ne remplace pas une revue par un simple rappel : le rappel mensuel est un filet de sécurité contre l'oubli, pas une revue de plus.

## 🔗 Références

- [ADR-007 — Processus de veille des montées de version majeures](./adr/007-processus-veille-majors-expo-react.md)
- `renovate.json` (configuration `packageRules`, `dependencyDashboard`)
- [docs/ARCHITECTURE.md](./ARCHITECTURE.md)
- [README.md](../README.md) — section Maintenance
