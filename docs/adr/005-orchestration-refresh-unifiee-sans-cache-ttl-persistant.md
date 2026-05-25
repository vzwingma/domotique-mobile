# ADR 005 — Orchestration de refresh unifiée sans cache TTL persistant

- **Statut** : Acceptée
- **Date** : 2026-05-25
- **Décideurs** : Équipe domoticz-mobile
- **Portée** : Synchronisation des données Domoticz en contexte réseau distant (5G)

## Contexte

En usage distant (notamment 5G), les variations de latence et les micro-coupures réseau exposent deux risques simultanés :

1. **Stale data côté UI** quand un cache TTL global persistant sert des données trop anciennes.
2. **Burst d’appels réseau** quand plusieurs triggers de refresh se déclenchent en parallèle (changement d’onglet, retour foreground, pull-to-refresh, actions utilisateur).

Le besoin validé est de conserver des données fraîches tout en évitant les rafales de requêtes, sans réintroduire de cache TTL persistant global.

## Décision

Nous avons décidé de mettre en place une **orchestration réseau unifiée sans cache TTL persistant**, avec :

- un orchestrateur central de refresh (`refreshDomoticzData`),
- un timeout réseau explicite (15s),
- une stratégie **single-flight** pour coalescer les requêtes identiques en vol,
- un **cooldown anti-burst** (5s) sur les triggers de refresh UI.

## Alternatives considérées

### Option 1 — Orchestration unifiée + timeout + single-flight + cooldown (retenue ✅)

- **Avantages** : données fraîches, réduction des appels dupliqués, meilleure robustesse en latence élevée, comportement déterministe.
- **Inconvénients** : complexité de coordination légèrement supérieure (orchestrateur + garde anti-burst).

### Option 2 — Réintroduire un cache TTL global persistant

- **Avantages** : baisse apparente du volume réseau.
- **Inconvénients** : risque élevé de données obsolètes en UI, incohérence métier pour une app domotique temps réel.
- **Raison du rejet** : incompatible avec l’exigence de fraîcheur des états.

### Option 3 — Garder des refresh non orchestrés (sans single-flight/cooldown)

- **Avantages** : implémentation plus simple.
- **Inconvénients** : duplication d’appels, contention réseau, dégradation perçue en contexte distant.
- **Raison du rejet** : ne traite pas les rafales de requêtes ni les effets de latence 5G.

## Conséquences

### Positives

- Synchronisation plus stable des données sur réseau distant.
- Diminution des requêtes redondantes via single-flight.
- Protection anti-burst grâce au cooldown de refresh.
- Gestion explicite des requêtes lentes via timeout.
- Aucune dépendance à un cache TTL persistant global.

### Négatives / compromis

- Un refresh peut être ignoré pendant la fenêtre de cooldown si non forcé.
- Les timeouts peuvent produire davantage d’erreurs visibles sur réseau fortement dégradé.
- L’architecture de refresh est plus structurée, donc un peu plus exigeante à maintenir.

## Mise en œuvre

**Fichiers impactés :**

| Fichier | Nature de la modification |
|---|---|
| `app/services/RefreshOrchestrator.service.ts` | Centralisation du refresh (GET_DEVICES partagé + GET_TEMPS en parallèle) |
| `app/(tabs)/_layout.tsx` | Déclenchement centralisé des refresh (tab switch/foreground) + cooldown anti-burst |
| `app/services/ClientHTTP.service.ts` | Timeout 15s + single-flight des requêtes identiques |
| `app/services/__tests__/RefreshOrchestrator.service.test.ts` | Validation de l’orchestration unifiée |
| `app/services/__tests__/ClientHTTP.service.test.ts` | Validation timeout et single-flight |
| `docs/ARCHITECTURE.md` | Alignement sur la stratégie de refresh réelle |
| `docs/API.md` | Alignement sur la politique réseau côté client |

**Date d’effet :** 2026-05-25

## Références

- ADR 004 — [Suppression du cache HTTP 30s et rafraîchissement via AppState](./004-suppression-cache-http-et-rafraichissement-appstate.md)
