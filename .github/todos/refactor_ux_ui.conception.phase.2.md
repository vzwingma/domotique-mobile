# Conception détaillée — Refactor UX/UI Phase 2

## 1) Vue d'ensemble de l'architecture

Objectif: implémenter le backlog `refactor_ux_ui.backlog.phase.2.md` en conservant l'architecture actuelle (Expo Router + Context) et en introduisant des composants UI réutilisables, sans modifier la logique métier Domoticz.

Architecture cible (UI):

- `AppHeader` (nouveau): structure header unifiée, titre compact, emplacement standard du statut.
- `ConnectionBadge` (nouveau): composant de statut connexion (4 états visuels).
- `PrimaryIconAction` (nouveau): icône principale activable pour lumières/volets.
- `GroupCard` (nouveau): carte groupe (résumé + commandes groupées visibles).
- `FavoriteQuickActionCard` (nouveau): variante simplifiée dédiée Favoris (sans slider).
- `DisconnectedState` (nouveau): variante visuelle standard de l'état déconnecté.
- `SegmentedControl` (consolidation): extraction/normalisation du pattern chips déjà présent sur Maison.
- `ThermostatCard` (consolidation): stabilisation UX Mesure/Consigne + contrôles +/-.

Intégration:

- Les controllers/services restent inchangés en responsabilité.
- Les écrans orchestrent l'affichage par type via composants partagés.
- Les règles d'accessibilité (tailles cibles, contraste, non-dépendance à la couleur) sont traitées de façon transversale.

---

## 2) Décisions de conception

1. **Conserver la structure de navigation actuelle**
   - Justification: limiter le risque de régression; backlog demande une évolution UX/UI, pas une refonte de navigation.

2. **Introduire des composants UI dédiés plutôt que multiplier les conditions dans les écrans**
   - Justification: meilleure maintenabilité et cohérence inter-écrans.

3. **Prioriser un socle transversal (header + badge + accessibilité) avant les variantes métier**
   - Justification: évite des implémentations divergentes entre onglets.

4. **Favoris devient explicitement un mode “actions rapides”**
   - Justification: cohérent avec le backlog (max 8, sans slider, 1 tap).

5. **Standardiser les états (connecté/déconnecté/mixte/actif) via texte + icône + style**
   - Justification: conformité accessibilité et lisibilité en thème sombre.

6. **Volets: conserver le slider comme contrôle secondaire**
   - Justification: décision produit validée; l'icône reste l'action principale, le slider sert au réglage fin.

---

## 3) Découpage du travail et dépendances

### Wave A — Fondations transversales

- A1: spécifier le mapping fonctionnel des états du `ConnectionBadge`.
- A2: créer `ConnectionBadge`.
- A3: créer `AppHeader` et l'intégrer aux onglets principaux.
- A4: consolider `À propos` pour le détail technique.

Dépendances: A1 -> A2 -> A3 ; A4 dépend de A3.

### Wave B — Variantes de cartes métier

- B1: créer `PrimaryIconAction`.
- B2: créer `GroupCard` (lumières/volets).
- B3: différencier rendu lumières on/off vs dimmables.
- B4: clarifier hiérarchie de contrôle volet (icône principale + slider secondaire si conservé).
- B5: standardiser `DisconnectedState`.

Dépendances: B1 -> B2 ; B3 dépend B1+B2 ; B4 dépend B1+B2 ; B5 dépend B3+B4.

### Wave C — Favoris et températures

- C1: limiter Favoris à 8.
- C2: créer `FavoriteQuickActionCard`.
- C3: retirer sliders sur Favoris et appliquer mapping actions rapides.
- C4: valider/ajuster `ThermostatCard` (Mesure/Consigne, lisibilité contrôles).

Dépendances: C2 -> C3 ; C1 peut être parallèle ; C4 parallèle.

### Wave D — Accessibilité globale

- D1: audit tailles cibles interactives.
- D2: audit contraste (texte/composants/états).
- D3: audit non-dépendance à la couleur.
- D4: corrections et harmonisation finale.

Dépendances: D1+D2+D3 -> D4.

---

## 4) Tâches Agent Dev

### DEV-01 — Socle header/statut
- Implémenter `ConnectionBadge` et `AppHeader`.
- Intégrer sur Favoris, Lumières, Volets, Températures, Maison.
- Déporter les détails techniques uniquement dans `À propos`.

DoD:
- 4 états visibles et cohérents.
- Même structure/placement sur tous les onglets.

### DEV-02 — Maison (consolidation)
- Harmoniser hiérarchie visuelle: pilotage global avant `À propos`.
- Normaliser le pattern segmented/chips (`Mode`, `Moment`, `Présence`).

DoD:
- Pattern unique et cohérent sur les 3 contrôles.

### DEV-03 — Lumières/Volets (actions principales)
- Créer `PrimaryIconAction` et l'utiliser comme contrôle principal.
- Créer `GroupCard` et afficher résumé métier + commandes visibles.
- Différencier on/off vs dimmable (slider conditionnel).
- Formaliser `DisconnectedState`.

DoD:
- Contrôle principal identifiable en <1s.
- États lisibles sans couleur seule.

### DEV-04 — Favoris actions rapides
- Passer la limite de favoris à 8.
- Implémenter `FavoriteQuickActionCard`.
- Retirer tous les sliders de Favoris.
- Garder 1 action principale par carte + état utile.

DoD:
- Écran Favoris sans slider, actionnable en 1 tap.

### DEV-05 — Températures
- Appliquer `AppHeader` + `ConnectionBadge`.
- Stabiliser la lisibilité `Mesure/Consigne` et boutons +/-.

DoD:
- Bloc thermostat lisible et interaction claire.

### DEV-06 — Accessibilité transversale
- Appliquer les corrections issues des audits A11Y.

DoD:
- Cibles conformes, contrastes conformes, états non color-only.

---

## 5) Tâches Agent QA

### QA-01 — Matrice de tests UX/UI par ticket
- Construire une matrice de vérification ticket -> scénario -> résultat attendu.

### QA-02 — Tests composants et snapshots
- Mettre à jour snapshots impactés (`header`, cartes, favoris, maison, thermostat).
- Ajouter tests des nouveaux composants (`ConnectionBadge`, `PrimaryIconAction`, `GroupCard`, `FavoriteQuickActionCard`).

### QA-03 — Tests comportementaux
- Vérifier:
  - Favoris <= 8
  - Absence de slider sur Favoris
  - Rendu on/off vs dimmable
  - Résumés de groupes (normal/mixte/déconnecté)
  - États badge connexion.

### QA-04 — Recette accessibilité
- Vérifier tailles cibles, contraste et compréhension en niveaux de gris.

DoD QA global:
- Tous les critères backlog et critères globaux de fin d'itération passent.

---

## 6) Tâches Agent Doc

### DOC-01 — README
- Mettre à jour sections UX des onglets, pattern header, logique Favoris.

### DOC-02 — Instructions projet
- Mettre à jour `.github/copilot-instructions.md` avec nouveaux patterns UI et conventions d'état.

### DOC-03 — Spécifications de composants
- Documenter contrats visuels/fonctionnels des composants introduits.

DoD Doc global:
- Documentation alignée avec l'implémentation finale et les règles UX/A11Y.

---

## 7) Critères de succès

- Tous les onglets partagent `AppHeader` + `ConnectionBadge` cohérents.
- Favoris n'affiche jamais plus de 8 éléments.
- Favoris n'affiche aucun slider.
- Lumières/Volets: action principale clairement identifiable.
- Groupes Lumières/Volets: résumé métier utile + commandes visibles.
- Maison: pattern uniforme pour `Mode`, `Moment`, `Présence`.
- Températures: Mesure/Consigne non ambiguës, commandes thermostat claires.
- Accessibilité: contrastes conformes, cibles conformes, états non dépendants de la couleur.

---

## 8) Risques et mitigations

- **Ambiguïté mapping des 4 états connexion**
  - Mitigation: valider mapping API -> badge avant implémentation (DEV-01).

- **Complexité de variation des cartes (type/groupe/favori)**
  - Mitigation: introduire des composants dédiés (PrimaryIconAction/GroupCard/FavoriteQuickActionCard) plutôt que conditionnels dispersés.

- **Régressions visuelles sur écrans existants**
  - Mitigation: snapshots ciblés + matrice QA avant merge.

- **Non-conformité A11Y en fin de cycle**
  - Mitigation: audit A11Y dédié (D1-D4) avec critères mesurables.

---

## Annexe — Questions produit ouvertes avant exécution multi-agents

1. Mapping exact des 4 états du `ConnectionBadge` depuis l'état Domoticz existant.
2. Règle canonique de distinction lumière on/off vs dimmable.
3. Format exact des commandes groupées visibles (lumières/volets).
4. Comportement UX explicite quand plus de 8 favoris existent.
5. Palette finale pour corriger les contrastes insuffisants.
