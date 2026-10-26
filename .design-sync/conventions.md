## domoticz-mobile — how to build with these components

This design system is a **React Native (Expo) app**, not a web component library. The bundle you're importing (`window.DomoticzMobileDS`) is compiled from the app's real source with `react-native` aliased to `react-native-web` — every component renders through React Native Web's DOM output, styled with `StyleSheet.create` objects, not CSS classes.

**Dark theme only.** The app has no light theme. Always render on a dark ground — wrap your composition root in a `View` with `backgroundColor: '#0b1326'` (the app's own page background). Components style their own internal surfaces (cards, pills, buttons) but never the page behind them.

### Styling idiom: no CSS classes, no `var(--*)` tokens

Styling comes from plain hex values baked into each component's `StyleSheet.create` call — there is no shipped stylesheet or token file to `@import`. Reuse these exact values (from the app's `Colors.dark` / `Colors.domoticz` palette) when composing new layout around the synced components:

| Role | Hex | Use |
|---|---|---|
| Page background | `#0b1326` | root wrapper behind every composition |
| Card / row surface | `#222a3d` | container background for a device row or card |
| Card border | `#3A3A3A` | 1px border on surfaces |
| Primary text | `#ECEDEE` | body text |
| Secondary label | `#9BA1A6` | meta / description text |
| Brand accent | `#f5c727` (yellow) | status values, active state, primary CTA — this is the dominant accent seen throughout the app |
| Disconnected bg / border / icon / label | `#382132` / `#7f2b2b` / `#ff8a80` / `#ffd7d7` | the `DisconnectedState` badge and any "offline" card variant |
| Group accents (per-room) | e.g. `#4AA3A2` (lumières salon), `#B19CD9` (volets salon), `#5FACD3` (tous volets) | `accentColor` prop on `DeviceCard`, icon `color` — one per Domoticz group, not a fixed palette |

Components take explicit color/style **props** (`accentColor`, `color`) rather than variant enums — pick a hex per the table above, don't invent new ones.

### Composition pattern

`DeviceCard` is the layout shell for one equipment row: `title`, `accentColor`, `statusLabel`, optional `summary`/`unit`, `isActive`, and a `primaryAction` slot (typically a `PrimaryIconAction` wrapping a `@expo/vector-icons` `MaterialCommunityIcons` glyph). When `isActive` is false, compose nothing for the status — `DeviceCard` shows `DisconnectedState` itself internally.

```tsx
<DeviceCard
  title="Lumières Salon"
  accentColor="#4AA3A2"
  statusLabel="Allumées"
  isActive
  primaryAction={
    <PrimaryIconAction accessibilityLabel="Éteindre les lumières du salon" active onPress={() => {}}>
      <MaterialCommunityIcons name="lightbulb-multiple-outline" size={28} color="#4AA3A2" />
    </PrimaryIconAction>
  }
/>
```

`ViewDomoticzTemperature` takes a `temperature` model instance (`{ idx, name, isActive, temp, humidity, ... }`), not loose props — construct a plain object matching that shape.

### Where the truth lives

Each component's `.d.ts` is the authoritative prop contract; `.prompt.md` carries its JSDoc + composed examples. There is no separate stylesheet to read — the hex table above is the complete palette these 5 components use.

### Scope note

Only 5 presentational components are synced (`ThemedText`, `PrimaryIconAction`, `DisconnectedState`, `DeviceCard`, `ViewDomoticzTemperature`). The app has more device-row components (sliders, thermostat dial, SVG shutter icon) that depend on native-only libraries (`@react-native-community/slider`, `react-native-svg`, `react-native-gesture-handler`) which don't bundle for a browser outside Metro's resolver — they are not part of this sync.
