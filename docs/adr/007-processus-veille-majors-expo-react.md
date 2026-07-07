# ADR 007 — Processus de veille des montées de version majeures (Expo/React/React Native)

- **Statut** : Proposé (en attente de validation Gate#0)
- **Date** : 2026-07-07
- **Décideurs** : Équipe domoticz-mobile
- **Portée** : Processus de revue — **aucun upgrade SDK/majeur n'est déclenché par cet ADR**

## Contexte

`renovate.json` configure déjà :

- `dependencyDashboard: true` — un ticket "Dependency Dashboard" centralisant l'état de toutes les mises à jour, y compris majeures.
- Une `packageRule` dédiée : les majors sur `react-native`, `expo*`, `react` sont créées en **PR draft**, sans automerge (`prCreation: "draft"`, `automerge: false`).
- Une autre règle **désactive** les mises à jour automatiques de `react`, `react-dom`, `react-native-svg`, `react-test-renderer` — versions verrouillées par le SDK Expo.

Ce dispositif technique existe, mais **aucun processus humain formel** ne définit : à quelle fréquence ces PR draft/le Dependency Dashboard sont revus, qui les revoit, ni les critères qui déclenchent (ou non) un upgrade. En pratique, une PR draft peut rester ouverte indéfiniment sans être revue, et le Dependency Dashboard peut être ignoré faute de rappel.

**Hors périmètre explicite :** cet ADR ne recommande **aucun upgrade SDK immédiat**. Il livre uniquement un processus de veille.

## Décision

Nous retenons l'**Option B** : revue trimestrielle manuelle **+** alerte automatisée mensuelle.

## Alternatives considérées

### Option A — Revue trimestrielle manuelle uniquement

- **Avantages** : aucune automatisation supplémentaire à construire, cadence simple à retenir (calée par ex. sur chaque nouvelle version mineure de l'app).
- **Inconvénients** : repose entièrement sur la mémoire humaine ; sur une petite équipe/projet perso, un trimestre peut facilement être manqué sans rappel actif, surtout si l'attention est portée sur les fonctionnalités.
- **Risques** : dérive de plusieurs versions majeures Expo/React Native avant qu'un upgrade ne soit even considéré, rendant l'upgrade final plus coûteux et plus risqué (breaking changes cumulés).
- **Impacts** : aucun nouveau fichier/workflow.
- **Effort** : Faible.

### Option B — Revue trimestrielle manuelle + alerte automatisée mensuelle (retenue ✅)

- **Avantages** : la revue trimestrielle reste le moment de décision (analyse, effort, breaking changes), mais un rappel mensuel automatisé (ex. job planifié GitHub Actions qui commente/renouvelle l'attention sur l'issue "Dependency Dashboard", ou notification programmée) réduit le risque d'oubli pur ; coût de mise en place très faible (pas de nouveau secret, réutilise le Dependency Dashboard existant).
- **Inconvénients** : une pièce d'automatisation supplémentaire à maintenir (même minime) ; un rappel mensuel sans action ne remplace pas la revue elle-même — c'est un filet de sécurité, pas une revue de plus.
- **Risques** : rappel perçu comme bruit s'il n'est pas actionnable (à mitiger en le limitant à un lien direct vers le Dependency Dashboard, sans détail dupliqué).
- **Impacts** : ajout d'une tâche planifiée légère (implémentation hors périmètre de cet ADR — processus uniquement, matière à découpage candidat pour MAINa si retenu).
- **Effort** : Faible à Moyen (mise en place initiale de l'alerte, puis coût de maintenance quasi nul).

**Justification du choix :** sur une équipe réduite (mainteneur unique/app perso), le risque dominant n'est pas l'analyse (déjà couverte par le Dependency Dashboard + PR draft de Renovate) mais l'**oubli pur** de revenir sur le sujet. Le coût d'un rappel mensuel automatisé est marginal face au risque de dérive de versions majeures non suivie.

## Processus retenu

1. **Cadence de revue formelle : trimestrielle.**
   - Consulter l'issue "Dependency Dashboard" (Renovate) : lister toutes les PR draft majeures en attente (`react`, `react-native`, `expo*`).
   - Pour chaque major en attente, évaluer : changelog/breaking changes, effort estimé, bénéfice (sécurité, fonctionnalités, fin de support SDK), impact sur les dépendances verrouillées (`react`, `react-native-svg`, etc.).
   - Décision par major : reporter (documenter pourquoi), planifier (créer/ouvrir un futur Plan d'Action dédié), ou fermer si non pertinent.
2. **Rappel automatisé : mensuel.**
   - Notification légère (ex. job planifié) pointant vers le Dependency Dashboard, sans dupliquer son contenu.
   - Objectif : garantir qu'aucun trimestre entier ne s'écoule sans qu'un humain n'ait au moins consulté l'état des majors.
3. **Critères de déclenchement d'un upgrade SDK (hors trimestriel si nécessaire) :**
   - Faille de sécurité critique publiée sur une dépendance majeure verrouillée.
   - Fin de support annoncée de la version SDK Expo actuellement utilisée.
   - Blocage fonctionnel avéré (ex. besoin d'une API disponible uniquement dans une version majeure supérieure).

## Conséquences

### Positives

- Visibilité régulière et non-oubliée sur l'état des majors Expo/React/React Native.
- Décision d'upgrade toujours volontaire et documentée, jamais subie.
- Aucun changement du comportement Renovate existant (PR draft + dashboard conservés tels quels).

### Négatives / compromis

- Charge de revue trimestrielle à assumer par le mainteneur, même en l'absence de changement nécessaire.
- Maintenance minime de l'alerte mensuelle automatisée.

## Références

- `renovate.json` (règles `packageRules` majors Expo/React/RN, `dependencyDashboard`)
- Plan d'Action : [`.claude/plans/001_modernisation-technique-frontend.plan.md`](../../.claude/plans/001_modernisation-technique-frontend.plan.md)
