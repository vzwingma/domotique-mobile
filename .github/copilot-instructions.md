# Instructions Copilot pour domoticz-mobile

## Présentation du projet

Application mobile React Native / Expo pour piloter des équipements domotiques via un serveur [Domoticz](https://www.domoticz.com/). Cible principalement Android et le web. L'interface utilisateur est en français.

## Commandes

```bash
npm start               # Démarrer le serveur de développement Expo
npm run android         # Lancer sur émulateur/appareil Android
npm run web             # Lancer sur le web
npm test                # Lancer Jest en mode watch
npm test -- path/to/file.test.tsx          # Lancer un fichier de test précis
npm test -- --testNamePattern="test name"  # Lancer les tests correspondant à un nom
npm run lint            # ESLint via Expo
```

Builds EAS (distribution APK Android) :
```bash
eas build --profile development
eas build --profile preview      # APK à distribution interne
eas build --profile production
```

## Architecture

```
app/
  _layout.tsx             # Layout racine : ThemeProvider (dark) + DomoticzContextProvider + Stack
  (tabs)/
    _layout.tsx           # Barre d'onglets personnalisée (5 onglets : accueil, lumières, volets, températures, maison)
    index.tsx             # Accueil / état de la connexion
    lumieres.tsx          # Lumières
    volets.tsx            # Volets/stores
    temperatures.tsx      # Capteurs de température + thermostats
    parametres.tab.tsx    # Maison (paramètres interactifs + section À propos)
  components/             # Composants de niveau écran (device, temperature, thermostat, liste de paramètres, barre d'actions volets)
  controllers/            # Fonctions de chargement des données ; pont entre l'UI et les services
  services/               # ClientHTTP.service.ts (client HTTP), fournisseur de contexte, utilitaires
  models/                 # Modèles TypeScript sous forme de classes (DomoticzDevice, DomoticzConfig, …)
  enums/                  # Constantes et enums (Colors, DomoticzEnum, APIconstants, TabsEnums)

components/               # Composants UI génériques partagés (ThemedText, ParallaxScrollView, icônes)
hooks/                    # Hooks React personnalisés (useColorScheme, useThemeColor, AndroidToast)
assets/                   # Polices, icônes, images
```

**Routing :** Expo Router avec routage basé sur les fichiers. Routes typées activées (`experiments.typedRoutes: true`).

**Gestion d'état :** React Context API via `DomoticzContextProvider` (global : état de la connexion, appareils, températures, thermostats, paramètres). `useState` local pour l'état purement UI.

**Flux de données :**
```
Onglet UI → fonction controller → callDomoticz() (HTTP GET) → serveur Domoticz
                                          ↓
                            Mise à jour du Context → re-rendu UI
```

## API / Backend

Toutes les requêtes passent par `app/services/ClientHTTP.service.ts` :
- `callDomoticz(SERVICES_URL, params?)` — fonction fetch unique avec Basic Auth
- URL de base depuis `EXPO_PUBLIC_DOMOTICZ_URL` ; authentification depuis `EXPO_PUBLIC_DOMOTICZ_AUTH` (Base64)
- Modèle d'URL : `{BASE_URL}/json.htm?type=command&param=...`
- Remplacement de paramètres dans les URLs : `<IDX>`, `<CMD>`, `<LEVEL>`, `<TEMP>`
- Réponses validées sur le champ `status: "OK"` / `"ERR"` du JSON Domoticz
- Les requêtes sont tracées avec un UUID (`traceId`) loggué en console

Les variables d'environnement doivent être préfixées `EXPO_PUBLIC_` pour être accessibles dans le bundle client.

## Conventions clés

### Nommage des fichiers
- Composants de niveau écran : `*.component.tsx` (dans `app/components/`)
- Services : `*.service.ts`
- Controllers : `*.controller.tsx`
- Modèles : `*.model.ts`
- Tests : `*-test.tsx` ou `*.test.tsx` (dans `__tests__/`)

### TypeScript
- Mode strict activé.
- **Modèles sous forme de classes** — utiliser des classes (pas de simples interfaces) pour les modèles de données Domoticz.
- `readonly` pour les propriétés de modèle qui ne doivent pas changer après la construction.
- Props typées sous la forme `export type XxxProps = { ... }`, composants typés `React.FC<XxxProps>`.

### Composants
- Composants fonctionnels avec hooks uniquement (pas de composants classe).
- Accès à l'état global via `useContext(DomoticzContext)` — éviter le prop drilling.
- Styles via `StyleSheet.create()` défini en bas du fichier.
- Thème sombre uniquement (`userInterfaceStyle: "dark"` dans app.json).
- **Labels métier pour les états des appareils** : utiliser "Allumé"/"Éteint" (lumières), "Ouvert"/"Fermé" (volets), "Déconnecté" (inactif), "Mixte" (groupe à niveaux incohérents) — jamais "On"/"Off" ou "-" dans l'UI.
- **Chips/boutons segmentés** pour les paramètres interactifs (présence, phase) — ne pas utiliser de `Dropdown`.
- **Volets** : les volets utilisent le slider + `onClickDeviceIcon` dans `IconDomoticzDevice.tsx` — ne pas remplacer ce mécanisme par une barre de boutons dédiée.

### Controllers
- Reçoivent un callback setter (depuis le Context) plutôt que d'appeler setState directement.
- Utilisent des chaînes de promesses (`.then().catch()`) — pas d'async/await.
- Afficher `AndroidToast` en cas d'erreur plutôt qu'une UI d'erreur inline.

### Enums & constantes
- Les types d'appareils, types de switches, commandes et endpoints API sont définis sous forme d'enums TypeScript dans `app/enums/`.
- Couleurs centralisées dans `app/enums/Colors.ts`.

## Tests

- Framework : Jest avec le preset `jest-expo`.
- Les tests existants utilisent le snapshot testing via `react-test-renderer`.
- Pas de tests d'intégration ou E2E pour l'instant.
