import React, { useContext, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ThemedText } from "../../components/ThemedText";
import { Colors } from "../enums/Colors";
import { DomoticzContext } from "../services/DomoticzContextProvider";
import DomoticzThermostat from "../models/domoticzThermostat.model";
import { DomoticzThermostatLevelValue } from "../enums/DomoticzEnum";
import { updateThermostatPoint } from "../controllers/thermostats.controller";

// ── Constantes du cadran ──────────────────────────────────────────────────────
/** Taille de référence (défaut, rétrocompatible) et valeurs géométriques associées */
const DEFAULT_DIAL_SIZE = 180;
const REF_TRACK_R = 85;
const REF_TRACK_W = 12;
const REF_KNOB_R = 8;
/** Angle de départ de la piste (7h30, sens horaire depuis le haut) */
const START_ANGLE = 225;
/** Arc total de la piste en degrés */
const TOTAL_SPAN = 270;

/** Convertit un angle (sens horaire depuis le haut) en coordonnées SVG, relatif au centre (cx, cy) donné */
function polarToXY(cx: number, cy: number, angleDeg: number, r: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Génère un chemin SVG d'arc à partir d'un angle de départ et d'une amplitude, relatif au centre (cx, cy) donné */
function describeArc(cx: number, cy: number, startAngle: number, span: number, r: number): string {
  if (span <= 0) return '';
  const s = span >= 360 ? 359.99 : span;
  const start = polarToXY(cx, cy, startAngle, r);
  const end = polarToXY(cx, cy, startAngle + s, r);
  const largeArc = s > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

/**
 * Convertit une position tactile (relative au SVG) en valeur de température,
 * en projetant l'angle sur la plage de l'arc (arrondi au 0,5°C le plus proche).
 * Le centre (cx, cy) DOIT être celui utilisé pour le rendu visuel de l'arc/curseur
 * de l'instance courante, sous peine de désynchronisation tap-cible/rendu.
 */
function touchToTemp(cx: number, cy: number, x: number, y: number): number {
  const dx = x - cx;
  const dy = y - cy;
  const angleDeg = ((Math.atan2(dy, dx) * 180 / Math.PI) + 90 + 360) % 360;
  const relAngle = (angleDeg - START_ANGLE + 360) % 360;
  // Zone morte (gap du bas) : snap vers l'extrémité la plus proche
  const deadZoneThreshold = TOTAL_SPAN + (360 - TOTAL_SPAN) / 2;
  const snapToMax = relAngle < deadZoneThreshold ? 1 : 0;
  const pct = relAngle > TOTAL_SPAN
    ? snapToMax
    : relAngle / TOTAL_SPAN;
  const range = DomoticzThermostatLevelValue.MAX - DomoticzThermostatLevelValue.MIN;
  return Math.round((DomoticzThermostatLevelValue.MIN + pct * range) * 2) / 2;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type DomoticzThermostatProps = {
  thermostat: DomoticzThermostat;
  /** Taille (largeur/hauteur en dp) du cadran circulaire. Optionnel, défaut 180 (rétrocompatible). */
  dialSize?: number;
};

// ── Composant ─────────────────────────────────────────────────────────────────

/**
 * Cadran circulaire pour afficher et piloter la consigne d'un thermostat Domoticz.
 * L'arc actif (jaune) indique visuellement le niveau de consigne sur la piste de fond.
 */
export const ViewDomoticzThermostat: React.FC<DomoticzThermostatProps> = ({ thermostat, dialSize = DEFAULT_DIAL_SIZE }) => {
  const [nextValue, setNextValue] = useState<number>(thermostat.temp);
  /** Valeur courante pendant le drag, lue dans onEnd sans dépendre du state React */
  const draggingValue = useRef<number>(thermostat.temp);
  const { setDomoticzThermostatData, domoticzTemperaturesData } = useContext(DomoticzContext)!;

  const measuredTemp = domoticzTemperaturesData.find(t => t.name.toLowerCase().includes('salon'));

  // Géométrie du cadran dérivée du dialSize courant (scale=1 exact à DEFAULT_DIAL_SIZE → rendu par défaut inchangé)
  const cx = dialSize / 2;
  const cy = dialSize / 2;
  const scale = dialSize / DEFAULT_DIAL_SIZE;
  const trackR = REF_TRACK_R * scale;
  const trackW = REF_TRACK_W * scale;
  const knobR = REF_KNOB_R * scale;

  const handleDecrease = () => {
    if (!thermostat.isActive) return;
    const newValue = Math.max(DomoticzThermostatLevelValue.MIN, Math.round((nextValue - 0.5) * 10) / 10);
    draggingValue.current = newValue;
    setNextValue(newValue);
    updateThermostatPoint(thermostat.idx, thermostat, newValue, setDomoticzThermostatData);
  };

  const handleIncrease = () => {
    if (!thermostat.isActive) return;
    const newValue = Math.min(DomoticzThermostatLevelValue.MAX, Math.round((nextValue + 0.5) * 10) / 10);
    draggingValue.current = newValue;
    setNextValue(newValue);
    updateThermostatPoint(thermostat.idx, thermostat, newValue, setDomoticzThermostatData);
  };

  /** Gesture pan sur l'arc : mise à jour visuelle en temps réel, appel API au relâchement */
  // Faux positif reconnu de la règle `react-hooks/refs` (seule occurrence du projet, cf. `npm run lint`) :
  // les callbacks `.onBegin/.onUpdate/.onEnd` de `Gesture.Pan()` (react-native-gesture-handler) sont définis
  // pendant le render mais ne s'exécutent jamais pendant celui-ci — ils sont invoqués plus tard, en réponse aux
  // événements tactiles (avec `runOnJS(true)`), au même titre qu'un gestionnaire d'événement classique. C'est le
  // pattern documenté par react-native-gesture-handler pour lire/écrire une valeur de drag sans dépendre du cycle
  // de render React (cf. https://docs.swmansion.com/react-native-gesture-handler/). La règle générique ne sait
  // pas distinguer "callback différé" de "accès synchrone pendant le render".
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    // eslint-disable-next-line react-hooks/refs -- cf. justification ci-dessus (callback différé, hors render)
    .onBegin((e) => {
      if (!thermostat.isActive) return;
      const temp = touchToTemp(cx, cy, e.x, e.y);
      draggingValue.current = temp;
      setNextValue(temp);
    })
    // eslint-disable-next-line react-hooks/refs -- cf. justification ci-dessus (callback différé, hors render)
    .onUpdate((e) => {
      if (!thermostat.isActive) return;
      const temp = touchToTemp(cx, cy, e.x, e.y);
      draggingValue.current = temp;
      setNextValue(temp);
    })
    // eslint-disable-next-line react-hooks/refs -- cf. justification ci-dessus (callback différé, hors render)
    .onEnd(() => {
      if (!thermostat.isActive) return;
      updateThermostatPoint(thermostat.idx, thermostat, draggingValue.current, setDomoticzThermostatData);
    });

  // Calcul de la progression de l'arc actif
  const range = DomoticzThermostatLevelValue.MAX - DomoticzThermostatLevelValue.MIN;
  const pct = thermostat.isActive ? (nextValue - DomoticzThermostatLevelValue.MIN) / range : 0;
  const activeSpan = TOTAL_SPAN * pct;
  const knobAngle = START_ANGLE + activeSpan;
  const knob = polarToXY(cx, cy, knobAngle, trackR);

  const trackPath = describeArc(cx, cy, START_ANGLE, TOTAL_SPAN, trackR);
  const activePath = activeSpan > 1 ? describeArc(cx, cy, START_ANGLE, activeSpan, trackR) : null;

  // Affichage de la valeur de consigne : partie entière (blanc) + décimale (accent)
  const intPart = thermostat.isActive ? Math.floor(nextValue).toString() : "−";
  const frac = nextValue % 1;
  const fracStr = frac === 0 ? "0" : Math.round(frac * 10).toString();
  const decPart = thermostat.isActive
    ? "." + fracStr + "°"
    : "";

  return (
    <View style={styles.container}>
      <ThemedText style={styles.name}>{thermostat.name}</ThemedText>

      {/* Cadran circulaire */}
      <View style={[styles.dialWrapper, { width: dialSize, height: dialSize }, !thermostat.isActive && styles.disabledOpacity]}>
        <GestureDetector gesture={panGesture}>
          <Svg width={dialSize} height={dialSize}>
          <Defs>
            <RadialGradient id="innerGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#2a3350" stopOpacity="1" />
              <Stop offset="100%" stopColor="#1a2240" stopOpacity="1" />
            </RadialGradient>
          </Defs>

          {/* Disque intérieur */}
          <Circle cx={cx} cy={cy} r={trackR - trackW / 2 - 2} fill="url(#innerGrad)" />

          {/* Piste de fond */}
          <Path d={trackPath} stroke="#1a2a4a" strokeWidth={trackW} strokeLinecap="round" fill="none" />

          {/* Arc actif (consigne) */}
          {activePath && (
            <Path d={activePath} stroke={Colors.domoticz.color} strokeWidth={trackW} strokeLinecap="round" fill="none" />
          )}

          {/* Curseur avec halo lumineux */}
          <Circle cx={knob.x} cy={knob.y} r={knobR + 7} fill={Colors.domoticz.color} opacity={0.15} />
          <Circle cx={knob.x} cy={knob.y} r={knobR + 3} fill={Colors.domoticz.color} opacity={0.3} />
          <Circle cx={knob.x} cy={knob.y} r={knobR} fill={Colors.domoticz.color} />
          </Svg>
        </GestureDetector>

        {/* Contenu superposé : étiquette + température centrées sur le disque, boutons en dessous */}
        <View style={[styles.dialOverlay, { width: dialSize, height: dialSize }]}>
          {/* CONSIGNE + valeur : centrés sur le centre géométrique du disque (cy) */}
          <View style={[styles.innerGroup, { top: cy - 60 }]}>
            <ThemedText style={styles.consigneLabel}>Consigne</ThemedText>
            <View style={styles.tempRow}>
              <ThemedText style={styles.tempInt}>{intPart}</ThemedText>
              {thermostat.isActive && (
                <ThemedText style={styles.tempDec}>{decPart}</ThemedText>
              )}
            </View>
          </View>
          {/* Boutons positionnés sous la valeur */}
          <View style={[styles.controls, { top: cy + 46 }]}>
            <TouchableOpacity
              style={styles.ctrlBtn}
              onPress={handleDecrease}
              disabled={!thermostat.isActive}
              accessibilityRole="button"
              accessibilityLabel="Diminuer la consigne"
            >
              <ThemedText style={styles.ctrlText}>−</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctrlBtn}
              onPress={handleIncrease}
              disabled={!thermostat.isActive}
              accessibilityRole="button"
              accessibilityLabel="Augmenter la consigne"
            >
              <ThemedText style={styles.ctrlText}>+</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Section Mesure */}
      {measuredTemp && (
        <View style={styles.measureRow}>
          <ThemedText style={styles.measureLabel}>Mesure</ThemedText>
          <ThemedText style={styles.measureValue}>{measuredTemp.temp}°C</ThemedText>
        </View>
      )}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.background,
    width: '100%',
    borderRadius: 12,
  },
  name: {
    fontSize: 14,
    color: Colors.dark.tint,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  dialWrapper: {
    // width/height calculés dynamiquement (prop dialSize) et fusionnés inline — cf. rendu du composant
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledOpacity: {
    opacity: 0.3,
  },
  dialOverlay: {
    position: 'absolute',
    // width/height calculés dynamiquement (prop dialSize) et fusionnés inline — cf. rendu du composant
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  /** Groupe CONSIGNE + température : positionné pour centrer la valeur sur cy (calculé, fusionné inline) */
  innerGroup: {
    position: 'absolute',
    // top calculé dynamiquement (cy - 60) et fusionné inline — cf. rendu du composant
    // tempRow center ≈ cy : 60 = lineHeight/2 (36) + consigneLabel (~14) + gap (2)
    alignItems: 'center',
  },
  consigneLabel: {
    fontSize: 11,
    color: '#7a8aaa',
    letterSpacing: 3,
    marginBottom: 2,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tempInt: {
    fontSize: 68,
    fontWeight: '800',
    color: '#f0f0f0',
    lineHeight: 72,
    includeFontPadding: false,
  },
  tempDec: {
    fontSize: 26,
    fontWeight: '600',
    color: Colors.domoticz.color,
    marginBottom: 10,
    marginLeft: 2,
    includeFontPadding: false,
  },
  controls: {
    position: 'absolute',
    // top calculé dynamiquement (cy + 46) et fusionné inline — cf. rendu du composant
    // sous la valeur : cy + lineHeight/2 (36) + gap (10)
    flexDirection: 'row',
    gap: 40,
  },
  ctrlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.domoticz.color,
    backgroundColor: Colors.dark.surface,
  },
  ctrlText: {
    fontSize: 28,
    color: '#7a8aaa',
    fontWeight: '300',
    lineHeight: 32,
  },
  measureRow: {
    alignItems: 'center',
    marginTop: 3,
  },
  measureLabel: {
    fontSize: 12,
    color: Colors.dark.labelSecondary,
    letterSpacing: 2,
  },
  measureValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.labelSecondary,
    marginTop: 4,
  },
});
