# ADR 004 — Suppression du cache HTTP 30s et rafraîchissement via AppState

- **Statut** : Acceptée
- **Date** : 2026-05-18
- **Décideurs** : Équipe domoticz-mobile

## Contexte

L'application domoticz-mobile effectuait tous ses appels HTTP via `callDomoticz()` dans `ClientHTTP.service.ts`, avec un cache GET à TTL de 30 secondes (Map en mémoire). Ce mécanisme avait été introduit dans le cadre des optimisations de performance (AP-001, T4.1).

Deux problèmes ont été identifiés :

1. **Cache obsolète à l'affichage** : lors d'un changement d'onglet (Favoris → Lumières → Volets…), le cache retournait des données potentiellement vieilles de jusqu'à 30s, rendant l'UI trompeuse pour une application domotique où la fraîcheur des données est critique.
2. **Pas de rafraîchissement au retour foreground** : lorsque l'application repassait en premier plan après être passée en arrière-plan (multitâche Android), aucune donnée n'était rechargée. L'utilisateur voyait des données figées.

Par ailleurs, la complexité du système `bypassCache`/`forceFresh` propagée dans les 3 controllers rendait la logique difficile à maintenir.

## Décision

Nous avons décidé de **supprimer entièrement le cache HTTP 30s** et de **déclencher un rafraîchissement automatique** des données à chaque changement d'onglet et à chaque retour en foreground, via un listener `AppState` dans `app/(tabs)/_layout.tsx`.

## Alternatives Considérées

### Option 1 : Suppression du cache + AppState dans `(tabs)/_layout.tsx` — retenue ✅

- **Avantages** : réutilise le mécanisme `refreshing` existant (un seul `useEffect`), minimal, cohérent avec l'architecture en place, pas de dépendance supplémentaire.
- **Inconvénients** : toujours un appel réseau à chaque changement d'onglet (charge serveur légèrement plus élevée).

### Option 2 : AppState dans `app/_layout.tsx` (root layout)

- **Avantages** : placement plus haut dans l'arbre de composants.
- **Inconvénients** : oblige à vider le Context ou forcer un re-mount complet, risque de flash de contenu, moins cohérent avec le pattern `refreshing` existant.
- **Raison du rejet** : plus invasif, couplage plus fort avec le Context, pattern différent du reste de l'app.

## Conséquences

### Positives

- Données toujours fraîches lors d'un changement d'onglet.
- Rafraîchissement automatique au retour foreground.
- Code simplifié : suppression de `CacheEntry`, `httpCache`, `isCacheValid`, `getCachedData`, `setCachedData`, `clearHttpCache`, et des paramètres `bypassCache`/`forceFresh` dans 3 controllers.
- Signature de `callDomoticz()` simplifiée : `(path, params?)` sans 3e argument.

### Négatives / Compromis

- Légère augmentation des appels réseau (chaque changement d'onglet déclenche un rechargement).
- La fraîcheur des données dépend désormais entièrement de la réactivité réseau.

### Neutres

- Mise à jour des tests controllers nécessaire (assertions `callDomoticz` sans 3e argument).
- `docs/ARCHITECTURE.md` mis à jour pour retirer la mention du cache HTTP 30s.

## Mise en œuvre

**Fichiers impactés :**

| Fichier | Nature de la modification |
|---|---|
| `app/services/ClientHTTP.service.ts` | Suppression complète du cache (`CacheEntry`, `httpCache`, `isCacheValid`, `getCachedData`, `setCachedData`, `clearHttpCache`) |
| `app/(tabs)/_layout.tsx` | Ajout `AppState` listener + `useRef` pour détecter retour foreground |
| `app/controllers/devices.controller.tsx` | Suppression paramètres `bypassCache`/`forceFresh` |
| `app/controllers/thermostats.controller.tsx` | Suppression paramètres `bypassCache`/`forceFresh` |
| `app/controllers/parameters.controller.tsx` | Suppression paramètres `bypassCache`/`forceFresh` |
| `app/services/__tests__/ClientHTTP.service.test.ts` | Suppression import `clearHttpCache` |
| `app/controllers/__tests__/devices.controller.test.ts` | Mise à jour assertions (sans 3e argument) |
| `app/controllers/__tests__/thermostats.controller.test.ts` | Mise à jour assertions (sans 3e argument) |
| `app/controllers/__tests__/parameters.controller.test.ts` | Mise à jour assertions (sans 3e argument) |

**Date d'effet :** 2026-05-18

## Références

- Aucun Plan d'Action associé (changement ponctuel hors AP)
- ADR 001 — [expo-doctor gate validation](./001-expo-doctor-gate-validation.md)
