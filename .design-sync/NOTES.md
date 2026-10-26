# design-sync notes — domoticz-mobile

## Repo shape

domoticz-mobile is a React Native/Expo **app**, not a design-system package: no `build` script, no shipped `dist/`/`.d.ts`. Synced via synth-entry mode with a hand-authored `--entry .design-sync/entry.ts` (barrel re-exporting only the 5 scoped components) instead of the converter's default "scan every file under srcRoot" fallback — that default would have pulled in every screen/controller in the app.

## Scope: 5 of the app's ~11 UI components

Synced (zero native-only dependency, pure props-driven, no Context coupling):
`ThemedText`, `PrimaryIconAction`, `DisconnectedState`, `DeviceCard`, `ViewDomoticzTemperature`.

**Deliberately excluded** — depend on native libraries with no plain-esbuild web path:
- `ViewLightDevice` (lightDevice.component.tsx), `BlindDevice`, `FavoriteCard` — use `@react-native-community/slider`, which resolves via Metro's `.web.js` platform file + internal native-component registration; not reachable with a generic bundler.
- `Thermostat` — uses `react-native-svg` + `react-native-gesture-handler`, same class of problem.
- `IconDomoticzDevice` / `IconVoletSVG` — transitively pull in `react-native-svg`.
- These also all read `DomoticzContext` (would need a mocked provider) and take real `DomoticzDevice` model instances — more setup either way.

If a future sync wants to add these: try the same rnWebPlugin approach first, but expect `.web.js`-suffixed internals inside `@react-native-community/slider`/`react-native-svg` to need explicit resolution rules beyond what's forked here (their web builds aren't a single-file swap like `react-native-web`).

## Forks (both required — the RN app doesn't fit the converter's assumed "web package" shape)

- **`.design-sync/overrides/bundle.mjs`** (declared in `cfg.libOverrides`): adds to `sharedBuildOptions`:
  - `alias: {'react-native': 'react-native-web'}`
  - `resolveExtensions` prioritizing `.web.tsx/.web.ts/.web.js/.web.jsx` (Metro's platform-suffix resolution, needed for `expo-modules-core`'s internal `requireNativeModule.web.ts`)
  - `.ttf: 'dataurl'` and `.js: 'jsx'` loaders (`@expo/vector-icons` ships vendored JSX in plain `.js` + `.ttf` glyph fonts via `require()`)
  - a `banner.js` shimming `global`/`__DEV__`/`process.env` — Metro's `InitializeCore` normally injects these before any module runs; a raw esbuild IIFE has nothing, so `expo-modules-core`/`react-native-web` threw `ReferenceError` the instant they touched any of the three, before `window.DomoticzMobileDS` was ever assigned (killed EVERY component, not just one).
- **`.design-sync/overrides/story-imports.mjs`** (declared in `cfg.libOverrides`): adds `rnWebPlugin` (same alias + `.web.*` resolution) to the preview-compile plugin list — the `.ttf`/`.js→jsx` loaders were already covered by upstream `STORY_LOADERS`.

## Re-sync risks — read before the next sync

- **Upstream diff on next sync**: `bundle.mjs` and `story-imports.mjs` are both on the skill's "don't fork" list (they're the output-contract surface) — this repo forks them anyway because there's no other way to bundle React Native for a browser. On re-sync, diff both forks against the bundled `lib/*.mjs` before trusting `[OVERRIDE]` — an upstream change to `sharedBuildOptions` or `storyImportPlugins` needs manual re-merge into the fork, not a blind overwrite.
- **Render check never machine-verified**: playwright was declined (user chose not to install it). All 5 components / 16 preview cells were verified by hand in a live browser (Claude's own Browser tool) instead of `package-validate.mjs`'s automated screenshot check, and grade files under `.design-sync/.cache/review/*.grade.json` were written manually (not produced by `package-capture.mjs`, which also needs playwright and never ran). If playwright gets installed later, re-run `package-validate.mjs` (no `--no-render-check`) and `package-capture.mjs` once to get real machine-verified grades/screenshots.
- **Icon substitution**: `DeviceCard`'s "Volets" story uses `MaterialCommunityIcons name="window-shutter"` as a stand-in for the app's real bespoke `IconVoletSVG` (excluded — see above). If `IconVoletSVG` is ever added to scope, this preview should switch to the real icon.
- **No shipped CSS/tokens file**: this is a `StyleSheet.create` (CSS-in-JS) app — there's nothing to point `cfg.cssEntry` at. The palette is documented as a static hex table in `.design-sync/conventions.md` / the README header instead. If `app/enums/Colors.ts` changes, that table goes stale — no automated check catches it.
