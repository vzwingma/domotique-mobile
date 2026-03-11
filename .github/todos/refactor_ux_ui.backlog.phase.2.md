# Backlog UX/UI concret par écran
Version : v2
Périmètre : application mobile Domoticz React Native / Expo  
Modèle de navigation retenu : **par type d’équipement** + accès rapide **Favoris**

> Principes directeurs : rendre l’état du système visible, clarifier l’action principale, conserver des contrôles cohérents, et ne pas faire reposer l’information uniquement sur la couleur. Selon NN/g, la visibilité de l’état système, la cohérence et les signifiants clairs sont des bases de l’utilisabilité. Les exigences d’accessibilité minimales incluent aussi une taille de cible minimale et un contraste suffisant. 

---

## 0. Hors périmètre actuel

Les sujets suivants sont **explicitement hors périmètre de ce backlog** pour cette itération :

- Phase 3 initiale : gestion avancée des états système, erreurs détaillées, retry, dernière valeur connue
- refonte complète du design system
- changement du modèle de navigation
- changement du modèle de données Domoticz

---

## 1. Règles globales de conception et de recette

### 1.1 Règles UX/UI globales
- Le contrôle principal d’une carte doit être identifiable en moins d’1 seconde.
- Une icône interactive doit ressembler à un bouton interactif, pas à une illustration.
- Les écrans doivent utiliser un pattern cohérent pour le statut de connexion.
- Les groupes doivent afficher un **résumé métier utile**, pas seulement un état générique.
- Les écrans Favoris ne doivent afficher que des **actions rapides**.

### 1.2 Règles accessibilité minimales
- Taille de cible minimale : **24×24 CSS px** minimum.
- Contraste texte normal : **4.5:1** minimum.
- Contraste non textuel des composants utiles : **3:1** minimum.
- L’état ne doit jamais être transmis par la couleur seule ; ajouter texte, icône, badge ou libellé systématique. 

### 1.3 Définition de done globale
Un ticket est considéré comme terminé si :
- la maquette ou spec de conception est fournie ;
- le comportement interactif est spécifié ;
- le développement est conforme ;
- les critères de recette sont passés ;
- les règles accessibilité minimales sont validées.

---

# 2. Backlog transversal

## EPIC-T01 — Header et statut de connexion unifié

### Ticket T01-01 — Réduire légèrement la taille des titres dans le header
**Type** : UI  
**Priorité** : Haute

**Objectif**  
Gagner un peu d’espace vertical sans remettre en cause la structure actuelle.

**Travail attendu**
- réduire légèrement la taille du titre sur tous les écrans ;
- conserver la hiérarchie visuelle actuelle ;
- ne pas modifier la navigation basse ;
- ne pas modifier le placement du badge de connexion.

**Éléments de conception à fournir à l’agent de développement**
- taille typographique cible du titre ;
- hauteur du header ;
- marge haute/basse ;
- captures de référence pour 1 écran standard et 1 écran long ;
- états Android avec et sans notch / barre système.

**Critères de recette**
- le titre reste lisible sans troncature sur les écrans principaux ;
- au moins un item supplémentaire est visible plus haut dans la zone utile si applicable ;
- la cohérence visuelle est identique sur Favoris, Lumières, Volets, Températures, Maison.

---

### Ticket T01-02 — Créer un composant de badge de connexion unifié
**Type** : UX/UI  
**Priorité** : Haute

**Objectif**  
Afficher le statut de connexion de façon constante, compacte et compréhensible.

**Travail attendu**
- définir un badge compact dans le header ;
- prévoir 4 états :
  - `Connecté`
  - `Synchronisation`
  - `Déconnecté`
  - `Erreur`
- définir un pattern identique sur tous les écrans ;
- laisser le détail technique dans le bloc `À propos`.

**Éléments de conception à fournir à l’agent de développement**
- design du composant `ConnectionBadge` ;
- couleurs, icônes, labels et ordre d’affichage ;
- états visuels normal / loading / error ;
- mapping fonctionnel :
  - API status -> label affiché
  - API status -> icône
  - API status -> style
- règle de placement exacte dans le header ;
- spec accessibilité :
  - label lecteur d’écran
  - rôle
  - texte alternatif

**Critères de recette**
- le badge apparaît sur tous les écrans principaux ;
- le badge a le même emplacement et la même structure partout ;
- chaque état a un libellé texte visible ;
- l’utilisateur peut distinguer les 4 états sans dépendre de la couleur seule ;
- le badge est lisible sur fond sombre. 

---

### Ticket T01-03 — Déplacer le détail technique de connexion dans “À propos”
**Type** : UX/UI  
**Priorité** : Moyenne

**Objectif**  
Séparer l’information opérationnelle rapide du diagnostic détaillé.

**Travail attendu**
- conserver en header uniquement le badge de connexion ;
- conserver dans `À propos` :
  - version app
  - version Domoticz
  - statut détaillé de connexion
- harmoniser les libellés.

**Éléments de conception à fournir à l’agent de développement**
- maquette de la section `À propos` ;
- ordre des lignes ;
- libellés exacts ;
- règles de retour à la ligne ;
- comportement sur petit écran.

**Critères de recette**
- le header n’affiche plus de détail technique long ;
- le bloc `À propos` contient toutes les informations techniques convenues ;
- les labels sont homogènes entre écrans.

---

# 3. Backlog par écran

---

## ÉCRAN MAISON

## EPIC-M01 — Uniformiser les contrôles globaux

### Ticket M01-01 — Convertir “Moment” en chips / segmented control
**Type** : UX/UI  
**Priorité** : Haute

**Objectif**  
Rendre le choix de moment directement manipulable, cohérent avec `Mode`.

**Travail attendu**
- remplacer le composant actuel par des chips ou un segmented control ;
- afficher toutes les options utiles directement ;
- définir un état sélectionné clair ;
- garder le libellé de section `Moment`.

**Éléments de conception à fournir à l’agent de développement**
- liste des options métier ;
- ordre des options ;
- maquette des états :
  - par défaut
  - sélectionné
  - pressed
  - disabled
- espacement horizontal et comportement si le contenu déborde ;
- textes exacts.

**Critères de recette**
- l’utilisateur peut modifier `Moment` en 1 tap ;
- le contrôle suit le même pattern visuel que `Mode` ;
- l’état actif est identifiable par texte + style, pas seulement par couleur ;
- la cible tactile de chaque option respecte le minimum WCAG. 

---

### Ticket M01-02 — Convertir “Présence” en chips / segmented control
**Type** : UX/UI  
**Priorité** : Haute

**Objectif**  
Rendre `Présence` cohérent avec `Mode` et `Moment`.

**Travail attendu**
- remplacer le composant actuel par des chips/segmented control ;
- rendre le choix actif immédiatement visible ;
- conserver un libellé simple et métier.

**Éléments de conception à fournir à l’agent de développement**
- options finales à afficher ;
- wording exact ;
- états visuels ;
- comportement si une valeur est indisponible ;
- accessibilité des libellés.

**Critères de recette**
- `Présence` a le même langage visuel que `Mode` et `Moment` ;
- une seule valeur peut être active à la fois ;
- le composant est lisible et actionnable sur mobile.

---

### Ticket M01-03 — Harmoniser la hiérarchie visuelle de l’écran Maison
**Type** : UI  
**Priorité** : Moyenne

**Objectif**  
Faire de `Maison` un écran global cohérent : pilotage en haut, informations techniques en bas.

**Travail attendu**
- conserver `Mode`, `Moment`, `Présence` dans la zone de pilotage ;
- conserver `À propos` sous la zone de pilotage ;
- vérifier les espacements entre cartes ;
- vérifier les alignements des icônes et labels.

**Éléments de conception à fournir à l’agent de développement**
- maquette complète finale de l’écran ;
- grille d’espacement ;
- tailles des icônes ;
- alignements horizontaux/verticaux ;
- spec responsive Android.

**Critères de recette**
- la zone de pilotage global apparaît avant `À propos` ;
- l’écran est cohérent visuellement ;
- les composants de pilotage utilisent le même pattern.

---

## ÉCRAN LUMIÈRES

## EPIC-L01 — Clarifier les contrôles principaux

### Ticket L01-01 — Distinguer lumières on/off simples et lumières dimmables
**Type** : UX/UI  
**Priorité** : Haute

**Objectif**  
Utiliser le bon contrôle selon la nature de l’équipement.

**Travail attendu**
- pour les lumières strictement binaires :
  - afficher un contrôle principal simple ;
  - masquer le slider ;
- pour les lumières dimmables :
  - conserver le niveau si nécessaire ;
  - garder une hiérarchie claire entre action principale et réglage fin.

**Éléments de conception à fournir à l’agent de développement**
- tableau de mapping type d’équipement -> composant UI ;
- liste des devices concernés ;
- règle de rendu :
  - on/off simple
  - dimmable
  - groupe
- maquettes de chaque variante ;
- états `allumé`, `éteint`, `mixte`, `déconnecté`.

**Critères de recette**
- une lumière on/off simple n’affiche pas de slider ;
- une lumière dimmable affiche un contrôle adapté ;
- le contrôle principal est identifiable sans ambiguïté.

---

### Ticket L01-02 — Mettre en valeur l’icône activable comme contrôle principal
**Type** : UI  
**Priorité** : Haute

**Objectif**  
Assumer le choix d’une icône interactive comme action principale.

**Travail attendu**
- transformer l’icône en bouton visuellement identifiable ;
- ajouter des états :
  - normal
  - pressé
  - actif
  - inactif
  - disabled
- augmenter la perception de cliquabilité.

**Éléments de conception à fournir à l’agent de développement**
- composant `PrimaryIconAction`;
- dimensions exactes ;
- zone tappable réelle ;
- style actif/inactif ;
- retour visuel au tap ;
- animation éventuelle ;
- libellé lecteur d’écran.

**Critères de recette**
- l’icône ressemble à un bouton interactif ;
- l’utilisateur peut comprendre qu’il faut appuyer dessus sans aide ;
- la zone tappable respecte le minimum WCAG ;
- l’état actif/inactif est compréhensible sans couleur seule. 

---

### Ticket L01-03 — Refaire les cartes de groupe Lumières
**Type** : UX/UI  
**Priorité** : Haute

**Objectif**  
Donner un résumé utile et des commandes groupées visibles.

**Travail attendu**
- remplacer les statuts trop génériques quand possible ;
- afficher un résumé du type :
  - `3/5 allumées`
  - `0/4 allumées`
  - `État mixte`
- ajouter les commandes groupées visibles ;
- conserver l’icône de groupe comme action principale si c’est le pattern retenu.

**Éléments de conception à fournir à l’agent de développement**
- structure de carte de groupe ;
- wording exact des résumés ;
- règles métier de calcul du résumé ;
- comportement si le groupe est mixte ;
- comportement si un membre est déconnecté ;
- états visuels complets.

**Critères de recette**
- chaque groupe affiche un résumé actionnable ;
- les commandes groupées sont visibles sans ouvrir un détail ;
- le groupe n’utilise pas uniquement une couleur pour signaler son état.

---

### Ticket L01-04 — Standardiser l’état “Déconnecté” sur les lumières
**Type** : UI  
**Priorité** : Moyenne

**Objectif**  
Rendre l’état déconnecté lisible sans le rendre ambigu avec “disabled”.

**Travail attendu**
- conserver la carte visible ;
- afficher un libellé `Déconnecté` clair ;
- éviter un contraste trop faible ;
- garder l’icône et le nom lisibles.

**Éléments de conception à fournir à l’agent de développement**
- variante visuelle `disconnected` ;
- couleurs de texte et d’icône ;
- badge éventuel ;
- règle d’opacité ;
- comportement tactile éventuel.

**Critères de recette**
- une lumière déconnectée reste lisible ;
- le libellé `Déconnecté` est visible ;
- l’état n’est pas confondu avec un simple élément désactivé ;
- le contraste reste acceptable. 

---

## ÉCRAN VOLETS

## EPIC-V01 — Renforcer l’action métier principale

### Ticket V01-01 — Mettre en valeur l’icône activable Ouvrir/Fermer
**Type** : UI  
**Priorité** : Haute

**Objectif**  
Faire comprendre que l’icône est la commande principale des volets.

**Travail attendu**
- transformer l’icône en bouton principal ;
- clarifier visuellement `ouvrir` / `fermer` ou `0% / 100%` ;
- ajouter un feedback visuel au tap ;
- conserver l’état texte du volet.

**Éléments de conception à fournir à l’agent de développement**
- composant réutilisable pour volets ;
- états normal / pressé / sélectionné / disabled ;
- dimensions + padding + hit area ;
- mapping état texte <-> icône ;
- labels accessibilité.

**Critères de recette**
- l’action principale est identifiable immédiatement ;
- la carte de volet reste lisible ;
- l’état `Ouvert` / `Fermé` reste visible en texte ;
- la zone interactive respecte le minimum WCAG. 

---

### Ticket V01-02 — Refaire les cartes de groupe Volets
**Type** : UX/UI  
**Priorité** : Haute

**Objectif**  
Afficher des groupes exploitables sans devoir ouvrir chaque détail.

**Travail attendu**
- afficher un résumé clair :
  - `2/4 ouverts`
  - `4/4 fermés`
  - `État mixte`
- rendre visibles les commandes groupées ;
- conserver le pattern graphique des volets individuels.

**Éléments de conception à fournir à l’agent de développement**
- structure de carte ;
- règles de calcul du résumé ;
- wording exact ;
- règles pour groupe mixte ;
- règles si un équipement du groupe est déconnecté ;
- maquette finalisée.

**Critères de recette**
- le résumé d’un groupe est immédiatement compréhensible ;
- les commandes groupées sont directement accessibles ;
- le comportement est homogène avec les groupes Lumières.

---

### Ticket V01-03 — Clarifier le rôle éventuel du slider sur les volets
**Type** : UX/UI  
**Priorité** : Moyenne

**Objectif**  
Éviter que le slider soit perçu comme le contrôle principal si ce n’est plus le cas.

**Travail attendu**
- si le slider est conservé :
  - le reléguer visuellement au second plan ;
  - réserver son usage au réglage fin ;
- sinon :
  - le supprimer des cartes liste.

**Éléments de conception à fournir à l’agent de développement**
- décision produit finale par type de volet ;
- maquette avec ou sans slider ;
- hiérarchie visuelle du composant ;
- note de comportement utilisateur.

**Critères de recette**
- le slider ne concurrence pas visuellement l’action principale ;
- l’utilisateur comprend d’abord comment ouvrir/fermer ;
- le geste principal reste évident.

---

## ÉCRAN FAVORIS

## EPIC-F01 — Transformer Favoris en télécommande rapide

### Ticket F01-01 — Limiter Favoris à 8 éléments maximum
**Type** : UX/UI  
**Priorité** : Haute

**Objectif**  
Faire de Favoris un écran rapide et scannable.

**Travail attendu**
- limiter l’écran à 8 éléments max ;
- définir la règle de sélection des favoris ;
- prévoir le comportement si plus de 8 favoris existent.

**Éléments de conception à fournir à l’agent de développement**
- règle métier de tri/priorisation ;
- comportement au-delà de 8 ;
- maquette vide / 1 favori / 8 favoris / >8 favoris ;
- wording éventuel d’information.

**Critères de recette**
- l’écran n’affiche jamais plus de 8 éléments ;
- la liste reste scannable sans scroll excessif ;
- le comportement est défini si l’utilisateur a plus de 8 favoris.

---

### Ticket F01-02 — Supprimer les sliders des cartes Favoris
**Type** : UI  
**Priorité** : Haute

**Objectif**  
Réserver Favoris aux actions immédiates uniquement.

**Travail attendu**
- supprimer tous les sliders de l’écran Favoris ;
- afficher uniquement des commandes rapides ;
- garder le statut courant si utile.

**Éléments de conception à fournir à l’agent de développement**
- variante de carte `FavoriteQuickActionCard` ;
- structure simplifiée ;
- liste des actions visibles ;
- règle d’affichage du statut.

**Critères de recette**
- aucune carte Favoris n’affiche de slider ;
- chaque favori présente une action rapide directe ;
- l’écran est plus rapide à parcourir que les écrans métiers.

---

### Ticket F01-03 — Concevoir une carte Favoris simplifiée par type d’équipement
**Type** : UX/UI  
**Priorité** : Haute

**Objectif**  
Afficher seulement l’essentiel pour une action en 1 tap.

**Travail attendu**
- pour une lumière : `Allumer / Éteindre`
- pour un volet : `Ouvrir / Fermer`
- éventuellement conserver le nom + état courant
- retirer les éléments de détail non essentiels

**Éléments de conception à fournir à l’agent de développement**
- maquettes de cartes Favoris par type :
  - lumière
  - volet
  - groupe lumière
  - groupe volet
- règle de hauteur ;
- labels ;
- icônes ;
- états pressé / actif / déconnecté ;
- mapping données -> UI.

**Critères de recette**
- une action rapide peut être déclenchée en 1 tap ;
- la carte affiche clairement le nom et l’état ;
- la carte n’est pas une copie de la carte standard ;
- le temps de lecture est réduit.

---

### Ticket F01-04 — Prioriser l’affichage des favoris par fréquence ou importance
**Type** : UX  
**Priorité** : Moyenne

**Objectif**  
Afficher en premier les équipements les plus utiles au quotidien.

**Travail attendu**
- définir une stratégie :
  - ordre manuel
  - fréquence d’usage
  - importance métier
- documenter la règle ;
- l’appliquer à l’affichage.

**Éléments de conception à fournir à l’agent de développement**
- règle de tri ;
- cas limites ;
- affichage d’un ordre personnalisé si prévu ;
- spec fonctionnelle.

**Critères de recette**
- l’ordre d’affichage est prévisible ;
- la règle de tri est documentée ;
- l’utilisateur retrouve ses commandes rapides les plus utiles en haut de liste.

---

## ÉCRAN TEMPÉRATURES

## EPIC-C01 — Consolider l’écran sans refonte majeure

### Ticket C01-01 — Appliquer le nouveau badge de connexion au header
**Type** : UI  
**Priorité** : Haute

**Objectif**  
Aligner Températures avec le pattern global.

**Travail attendu**
- intégrer le badge de connexion unifié ;
- réduire légèrement le titre comme défini au niveau transversal.

**Éléments de conception à fournir à l’agent de développement**
- header spec ;
- spacing ;
- badge state mapping.

**Critères de recette**
- le header Températures suit le pattern global ;
- le statut est visible au premier regard.

---

### Ticket C01-02 — Vérifier la lisibilité thermostat : Mesure / Consigne
**Type** : UI  
**Priorité** : Moyenne

**Objectif**  
Conserver le progrès déjà réalisé et éviter les régressions.

**Travail attendu**
- garder `Mesure` et `Consigne` bien distingués ;
- vérifier les alignements ;
- vérifier la lisibilité des boutons `-` et `+`.

**Éléments de conception à fournir à l’agent de développement**
- maquette finale du bloc thermostat ;
- style des boutons ;
- taille des cibles ;
- règles de priorité visuelle.

**Critères de recette**
- `Mesure` et `Consigne` ne peuvent pas être confondues ;
- les boutons `-` et `+` sont visiblement actionnables ;
- les cibles tactiles respectent le minimum WCAG. 

---

## ÉCRAN FAVORIS / LUMIÈRES / VOLETS / MAISON / TEMPÉRATURES

## EPIC-A11Y01 — Accessibilité minimale obligatoire

### Ticket A11Y-01 — Vérifier les tailles de cible sur toutes les zones tappables
**Type** : Accessibilité UI  
**Priorité** : Haute

**Objectif**  
S’assurer que tous les éléments interactifs sont suffisamment faciles à toucher.

**Travail attendu**
- auditer :
  - icônes activables
  - chips
  - boutons +/- 
  - items de navigation
  - badges interactifs si applicable
- corriger les zones insuffisantes.

**Éléments de conception à fournir à l’agent de développement**
- tableau des composants avec tailles minimales ;
- hitSlop si nécessaire ;
- dimensions visuelles vs dimensions tactiles ;
- cas particuliers Android.

**Critères de recette**
- toutes les zones interactives critiques respectent le minimum WCAG ;
- les petites icônes disposent d’une zone de hit suffisante ;
- les contrôles principaux sont confortables au pouce. 

---

### Ticket A11Y-02 — Vérifier les contrastes texte et composants
**Type** : Accessibilité UI  
**Priorité** : Haute

**Objectif**  
Garantir la lisibilité des libellés, badges et états.

**Travail attendu**
- auditer les contrastes sur :
  - textes principaux
  - textes secondaires utiles
  - badges
  - états actifs
  - états désactivés
  - états déconnectés
- corriger les styles insuffisants.

**Éléments de conception à fournir à l’agent de développement**
- palette finale ;
- tableau de contrastes ;
- spécification des couleurs en hex ;
- variantes day/night si concerné.

**Critères de recette**
- le texte normal atteint 4.5:1 minimum ;
- les composants et états utiles atteignent 3:1 minimum ;
- les états `Déconnecté`, `Mixte`, `Connecté` restent lisibles. 

---

### Ticket A11Y-03 — Ne pas reposer l’état uniquement sur la couleur
**Type** : Accessibilité UX/UI  
**Priorité** : Haute

**Objectif**  
Rendre les états compréhensibles pour tous les utilisateurs.

**Travail attendu**
- ajouter un support non coloriel à chaque état important :
  - texte
  - badge
  - icône
  - libellé
- vérifier les états :
  - connecté
  - déconnecté
  - actif
  - inactif
  - mixte
  - sélectionné

**Éléments de conception à fournir à l’agent de développement**
- matrice `état -> texte -> icône -> couleur` ;
- specs composant par composant ;
- exemples de rendu.

**Critères de recette**
- chaque état important est compréhensible en niveaux de gris ;
- aucun écran ne dépend uniquement d’une couleur pour exprimer l’état ;
- les badges et labels sont cohérents partout. 

---

# 4. Ordre de mise en œuvre recommandé

## Sprint 1
- T01-01 — Réduire légèrement la taille des titres
- T01-02 — Créer le badge de connexion unifié
- T01-03 — Déplacer le détail technique dans À propos
- M01-01 — Convertir Moment en chips
- M01-02 — Convertir Présence en chips
- M01-03 — Harmoniser Maison

## Sprint 2
- L01-01 — Distinguer lumières simples / dimmables
- L01-02 — Mettre en valeur l’icône activable sur Lumières
- L01-03 — Refaire les groupes Lumières
- V01-01 — Mettre en valeur l’icône activable sur Volets
- V01-02 — Refaire les groupes Volets
- V01-03 — Clarifier le rôle du slider sur Volets

## Sprint 3
- F01-01 — Limiter Favoris à 8
- F01-02 — Supprimer les sliders des Favoris
- F01-03 — Créer les cartes Favoris simplifiées
- F01-04 — Définir la logique de priorisation
- C01-01 — Appliquer le nouveau header sur Températures
- C01-02 — Vérifier la lisibilité du thermostat

## Sprint 4
- A11Y-01 — Audit tailles de cible
- A11Y-02 — Audit contrastes
- A11Y-03 — Audit états non dépendants de la couleur

---

# 5. Livrables de conception à fournir au développement

## 5.1 Livrables minimums
- maquette finale par écran ;
- variantes d’état par composant ;
- textes UI finaux ;
- tokens visuels nécessaires ;
- comportement interactif par composant ;
- mapping données Domoticz -> UI ;
- règles d’affichage par type d’équipement.

## 5.2 Liste concrète des composants à documenter
- `AppHeader`
- `ConnectionBadge`
- `SegmentedControl`
- `PrimaryIconAction`
- `GroupCard`
- `FavoriteQuickActionCard`
- `ThermostatCard`
- `DisconnectedState`

## 5.3 Pour chaque composant, fournir
- capture ou frame de référence ;
- dimensions ;
- marges/paddings ;
- typo ;
- couleurs ;
- états ;
- règles d’accessibilité ;
- cas limites ;
- comportement au tap.

---

# 6. Critères de recette globaux de fin d’itération

L’itération est validée si :

- `Maison` utilise un pattern uniforme pour `Mode`, `Moment`, `Présence` ;
- tous les écrans ont le même badge de connexion dans le header ;
- les contrôles principaux de Lumières et Volets sont clairement identifiables ;
- les groupes Lumières et Volets affichent un résumé utile + commandes groupées ;
- `Favoris` n’affiche pas plus de 8 éléments ;
- `Favoris` n’affiche aucun slider ;
- les cartes Favoris sont simplifiées et orientées action rapide ;
- les cibles tactiles minimales sont respectées ;
- les contrastes minimaux sont respectés ;
- les états ne reposent pas uniquement sur la couleur. 