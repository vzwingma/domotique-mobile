# ADR 009 — Seuil de couverture en CI : blocage réel vs délégation SonarCloud

- **Statut** : Proposé (en attente de validation Gate#0)
- **Date** : 2026-07-07
- **Décideurs** : Équipe domoticz-mobile
- **Portée** : `.github/workflows/ci.yml` (étape "Check coverage threshold"), `sonar-project.properties`

## Contexte

Dans `ci.yml`, le job `test` contient :

```yaml
- name: Check coverage threshold (≥80%)
  run: |
    npx nyc report --check-coverage --lines 80 --functions 80 --branches 80 || true
  continue-on-error: true
```

Le `|| true` **et** `continue-on-error: true` sont **redondants et cumulatifs** : même si `nyc` échoue, le shell renvoie 0 (`|| true`), et même si l'étape échouait malgré tout, `continue-on-error` empêcherait le job de passer en échec. Le seuil de 80 % affiché dans le nom de l'étape **n'est donc jamais réellement bloquant** en CI GitHub Actions — c'est un contrôle cosmétique.

En parallèle, `sonar-project.properties` active `sonar.qualitygate.wait=true` (timeout 300s) : c'est le **seul mécanisme réellement bloquant** aujourd'hui, piloté par le Quality Gate configuré côté SonarCloud (hors repo, non visible dans le code source). Le seuil appliqué par ce Quality Gate n'est pas nécessairement 80 % ni calculé de la même façon (SonarCloud applique par défaut le Quality Gate "Sonar Way", qui cible la couverture du **nouveau code**, pas la couverture globale du projet).

### Mesure de couverture réelle effectuée

Exécution de `npm test -- --watchAll=false --coverage` à la racine du repo (869 tests, 40 suites, tous passants) :

| Métrique | Résultat global mesuré | Seuil `nyc` du YAML |
|---|---|---|
| **Statements** | 69.58 % | 80 % |
| **Branches** | 71.53 % | 80 % |
| **Functions** | 70.00 % | 80 % |
| **Lines** | 70.27 % | 80 % |

Détail notable par couche (cf. `CLAUDE.md`, objectifs de couverture cible : controllers 100 %, services ≥90 %, composants ≥70 %, modèles ≥85 %) :

| Couche | Couverture mesurée (lines) | Cible documentée | Écart |
|---|---|---|---|
| `app/controllers` | 81.44 % | 100 % | Non atteint |
| `app/services` | 84.89 % | ≥90 % | Non atteint |
| `app/components` | 46.85 % | ≥70 % | Fortement non atteint |
| `app/models` | 100 % | ≥85 % | Atteint |

**Conclusion factuelle :** la couverture globale actuelle (~70 %) est **significativement sous le seuil de 80 %** inscrit dans le YAML, et plusieurs couches sont également sous leurs cibles documentées dans `CLAUDE.md` (notamment `app/components` à 46.85 %, loin de la cible ≥70 %).

## Décision

Nous retenons l'**Option B** : documenter explicitement que le blocage réel est délégué au Quality Gate SonarCloud, et retirer l'ambiguïté du YAML.

## Alternatives considérées

### Option A — Retirer `continue-on-error`/`|| true` pour bloquer réellement en CI GitHub Actions

- **Avantages** : le seuil de 80 % annoncé dans le nom de l'étape deviendrait réellement contraignant, sans dépendre d'une configuration externe (SonarCloud) non versionnée dans le repo.
- **Inconvénients** : au vu de la mesure ci-dessus (couverture globale ~70 %, jusqu'à 46.85 % sur `app/components`), retirer l'échappatoire **casserait immédiatement la CI sur `main`/`develop`** dès le prochain push, sans plan de remédiation préalable. Bloquerait tout merge tant que la couverture globale n'atteint pas 80 % sur les 4 dimensions (lignes, fonctions, branches, statements) — un chantier de couverture non cadré par ce plan.
- **Risques** : rupture brutale du flux de contribution ; pression à écrire des tests de complaisance juste pour satisfaire le seuil plutôt que pour la valeur métier.
- **Impacts** : nécessiterait un chantier de couverture préalable (hors périmètre de ce plan) avant d'être actionnable sans casser la CI.
- **Effort** : Faible pour le changement YAML lui-même, mais Élevé si l'on compte le rattrapage de couverture nécessaire pour ne pas casser la CI immédiatement.

### Option B — Documenter la délégation au Quality Gate SonarCloud, clarifier le YAML (retenue ✅)

- **Avantages** : cohérent avec l'état réel du pipeline (SonarCloud est déjà le seul mécanisme bloquant via `sonar.qualitygate.wait=true`) ; ne casse rien immédiatement ; supprime l'ambiguïté trompeuse du nom d'étape "Check coverage threshold (≥80%)" qui laisse croire à un blocage GitHub Actions inexistant ; laisse la possibilité de faire évoluer progressivement le Quality Gate SonarCloud (configuré côté plateforme) sans dépendre d'un seuil figé en dur dans le YAML.
- **Inconvénients** : le seuil réellement appliqué (Quality Gate SonarCloud) n'est pas versionné dans le repo — sa configuration vit côté plateforme SonarCloud, hors visibilité Git. L'étape `nyc` devient purement informative (rapport de couverture visible dans les logs), pas un gate.
- **Risques** : si le Quality Gate SonarCloud n'est pas correctement configuré côté plateforme (ou reste sur le gate par défaut "Sonar Way" qui cible le nouveau code), l'équipe pourrait croire à tort qu'un seuil de 80 % global est appliqué quelque part alors que ce n'est pas le cas — à mitiger par la documentation explicite de cette ADR.
- **Impacts** : renommage de l'étape (ex. "Coverage report (informational — gate réel délégué à SonarCloud)"), ajout d'un commentaire dans `ci.yml`, suppression de la redondance `|| true` + `continue-on-error` (garder une seule mécanique explicite, ex. `continue-on-error: true` seul, avec commentaire).
- **Effort** : Faible (changement de commentaire/libellé, aucun risque de casse).

**Justification du choix :** la mesure factuelle (couverture globale ~70 %, jusqu'à 46.85 % sur les composants) rend l'Option A immédiatement disruptive sans travail de rattrapage préalable, non cadré par ce plan. L'Option B aligne la documentation sur la réalité opérationnelle du pipeline (SonarCloud déjà bloquant via `sonar.qualitygate.wait=true`) sans casser la CI, et lève l'ambiguïté trompeuse actuelle.

## Conséquences

### Positives

- Fin de l'ambiguïté : un seul mécanisme de blocage clairement documenté (Quality Gate SonarCloud), pas de faux signal GitHub Actions.
- Aucune rupture de CI immédiate.
- Le rapport `nyc` reste visible en CI à titre informatif, utile pour suivre la tendance de couverture sans bloquer.

### Négatives / compromis

- Le seuil réel n'est pas versionné dans le repo (configuration SonarCloud externe) — dépendance à documenter et à vérifier périodiquement côté plateforme.
- Ne résout pas le déficit de couverture actuel (~70 % vs 80 % visé) : reste un chantier distinct, non traité par cet ADR ni par ce plan.

## Mise en œuvre

**Fichiers impactés (délégué à DEVon — T3.2) :**

| Fichier | Nature de la modification |
|---|---|
| `.github/workflows/ci.yml` | Renommage de l'étape (retrait de la mention "≥80%" trompeuse), commentaire explicite renvoyant au Quality Gate SonarCloud, suppression de la redondance `\|\| true` + `continue-on-error` |

**Critère d'acceptation T3.2 :** comportement CI cohérent avec la politique documentée ici — aucune ambiguïté entre l'étape `nyc` (informative) et le Quality Gate SonarCloud (bloquant réel).

## Références

- `.github/workflows/ci.yml` (étape "Check coverage threshold")
- `sonar-project.properties` (`sonar.qualitygate.wait=true`)
- Mesure de couverture : `npm test -- --watchAll=false --coverage` exécuté le 2026-07-07 (869 tests, 40 suites)
- `CLAUDE.md` — cibles de couverture par couche
- Plan d'Action : [`.claude/plans/001_modernisation-technique-frontend.plan.md`](../../.claude/plans/001_modernisation-technique-frontend.plan.md)
