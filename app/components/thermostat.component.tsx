import React, { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { ThemedText } from "../../components/ThemedText";
import { Colors } from "../enums/Colors";
import { DomoticzContext } from "../services/DomoticzContextProvider";
import DomoticzThermostat from "../models/domoticzThermostat.model";
import { DomoticzThermostatLevelValue } from "../enums/DomoticzEnum";
import { updateThermostatPoint } from "../controllers/thermostats.controller";

// ── Constantes du cadran ──────────────────────────────────────────────────────
const DIAL_SIZE = 180;
const CX = DIAL_SIZE / 2;
const CY = DIAL_SIZE / 2;
const TRACK_R = 85;
const TRACK_W = 12;
const KNOB_R = 8;
/** Angle de départ de la piste (7h30, sens horaire depuis le haut) */
const START_ANGLE = 225;
/** Arc total de la piste en degrés */
const TOTAL_SPAN = 270;

/** Convertit un angle (sens horaire depuis le haut) en coordonnées SVG */
function polarToXY(angleDeg: number, r: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

/** Génère un chemin SVG d'arc à partir d'un angle de départ et d'une amplitude */
function describeArc(startAngle: number, span: number, r: number): string {
  if (span <= 0) return '';
  const s = span >= 360 ? 359.99 : span;
  const start = polarToXY(startAngle, r);
  const end = polarToXY(startAngle + s, r);
  const largeArc = s > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type DomoticzThermostatProps = {
  thermostat: DomoticzThermostat;
};

// ── Composant ─────────────────────────────────────────────────────────────────

/**
 * Cadran circulaire pour afficher et piloter la consigne d'un thermostat Domoticz.
 * L'arc actif (jaune) indique visuellement le niveau de consigne sur la piste de fond.
 */
export const ViewDomoticzThermostat: React.FC<DomoticzThermostatProps> = ({ thermostat }) => {
  const [nextValue, setNextValue] = useState<number>(thermostat.temp);
  const { setDomoticzThermostatData, domoticzTemperaturesData } = useContext(DomoticzContext)!;

  const measuredTemp = domoticzTemperaturesData.find(t => t.name.toLowerCase().includes('salon'));

  const handleDecrease = () => {
    if (!thermostat.isActive) return;
    const newValue = Math.max(DomoticzThermostatLevelValue.MIN, Math.round((nextValue - 0.5) * 10) / 10);
    setNextValue(newValue);
    updateThermostatPoint(thermostat.idx, thermostat, newValue, setDomoticzThermostatData);
  };

  const handleIncrease = () => {
    if (!thermostat.isActive) return;
    const newValue = Math.min(DomoticzThermostatLevelValue.MAX, Math.round((nextValue + 0.5) * 10) / 10);
    setNextValue(newValue);
    updateThermostatPoint(thermostat.idx, thermostat, newValue, setDomoticzThermostatData);
  };

  // Calcul de la progression de l'arc actif
  const range = DomoticzThermostatLevelValue.MAX - DomoticzThermostatLevelValue.MIN;
  const pct = thermostat.isActive ? (nextValue - DomoticzThermostatLevelValue.MIN) / range : 0;
  const activeSpan = TOTAL_SPAN * pct;
  const knobAngle = START_ANGLE + activeSpan;
  const knob = polarToXY(knobAngle, TRACK_R);

  const trackPath = describeArc(START_ANGLE, TOTAL_SPAN, TRACK_R);
  const activePath = activeSpan > 1 ? describeArc(START_ANGLE, activeSpan, TRACK_R) : null;

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
      <View style={[styles.dialWrapper, !thermostat.isActive && styles.disabledOpacity]}>
        <Svg width={DIAL_SIZE} height={DIAL_SIZE}>
          <Defs>
            <RadialGradient id="innerGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#2a3350" stopOpacity="1" />
              <Stop offset="100%" stopColor="#1a2240" stopOpacity="1" />
            </RadialGradient>
          </Defs>

          {/* Disque intérieur */}
          <Circle cx={CX} cy={CY} r={TRACK_R - TRACK_W / 2 - 2} fill="url(#innerGrad)" />

          {/* Piste de fond */}
          <Path d={trackPath} stroke="#1a2a4a" strokeWidth={TRACK_W} strokeLinecap="round" fill="none" />

          {/* Arc actif (consigne) */}
          {activePath && (
            <Path d={activePath} stroke={Colors.domoticz.color} strokeWidth={TRACK_W} strokeLinecap="round" fill="none" />
          )}

          {/* Curseur avec halo lumineux */}
          <Circle cx={knob.x} cy={knob.y} r={KNOB_R + 7} fill={Colors.domoticz.color} opacity={0.15} />
          <Circle cx={knob.x} cy={knob.y} r={KNOB_R + 3} fill={Colors.domoticz.color} opacity={0.3} />
          <Circle cx={knob.x} cy={knob.y} r={KNOB_R} fill={Colors.domoticz.color} />
        </Svg>

        {/* Contenu superposé : étiquette + température centrées sur le disque, boutons en dessous */}
        <View style={styles.dialOverlay}>
          {/* CONSIGNE + valeur : centrés sur le centre géométrique du disque (CY) */}
          <View style={styles.innerGroup}>
            <ThemedText style={styles.consigneLabel}>Consigne</ThemedText>
            <View style={styles.tempRow}>
              <ThemedText style={styles.tempInt}>{intPart}</ThemedText>
              {thermostat.isActive && (
                <ThemedText style={styles.tempDec}>{decPart}</ThemedText>
              )}
            </View>
          </View>
          {/* Boutons positionnés sous la valeur */}
          <View style={styles.controls}>
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
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledOpacity: {
    opacity: 0.3,
  },
  dialOverlay: {
    position: 'absolute',
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    alignItems: 'center',
  },
  /** Groupe CONSIGNE + température : positionné pour centrer la valeur sur CY */
  innerGroup: {
    position: 'absolute',
    top: CY - 60,   // tempRow center ≈ CY : 52 = lineHeight/2 (36) + consigneLabel (~14) + gap (2)
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
    top: CY + 46,   // sous la valeur : CY + lineHeight/2 (36) + gap (10)
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
    color: '#7a8aaa',
    letterSpacing: 2,
  },
  measureValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6fc8e8',
    marginTop: 4,
  },
});
