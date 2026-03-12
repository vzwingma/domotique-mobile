import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "../enums/Colors";
import { useContext, useState } from "react";
import { DomoticzContext } from "../services/DomoticzContextProvider";
import DomoticzThermostat from "../models/domoticzThermostat.model";
import IconDomoticzThermostat from "@/components/IconDomoticzThermostat";
import { DomoticzThermostatLevelValue } from "../enums/DomoticzEnum";
import { updateThermostatPoint } from "../controllers/thermostats.controller";
import { stylesListsDevices } from "./device.component";

// Définition des propriétés d'un équipement Domoticz
export type DomoticzThermostatProps = {
  thermostat: DomoticzThermostat;
};



/**
 * Composant pour afficher un thermostat Domoticz avec boutons +/- et mesure vs consigne.
 */
export const ViewDomoticzThermostat: React.FC<DomoticzThermostatProps> = ({ thermostat }: DomoticzThermostatProps) => {

  const [nextValue, setNextValue] = useState<number>(thermostat.temp);
  const { setDomoticzThermostatData, domoticzTemperaturesData } = useContext(DomoticzContext)!;

  // T12 — mesure du salon
  const measuredTemp = domoticzTemperaturesData.find(t => t.name.toLowerCase().includes('salon'));

  // T11 — boutons +/- 0.5°C
  const handleDecrease = () => {
    if (!thermostat.isActive) return;
    const newValue = Math.max(DomoticzThermostatLevelValue.MIN, nextValue - 0.5);
    setNextValue(newValue);
    updateThermostatPoint(thermostat.idx, thermostat, newValue, setDomoticzThermostatData);
  };

  const handleIncrease = () => {
    if (!thermostat.isActive) return;
    const newValue = Math.min(DomoticzThermostatLevelValue.MAX, nextValue + 0.5);
    setNextValue(newValue);
    updateThermostatPoint(thermostat.idx, thermostat, newValue, setDomoticzThermostatData);
  };

  return (
    <View key={thermostat.idx} style={thermostat.isActive ? thermostatStyles.viewBox : thermostatStyles.viewBoxDisabled}>
      <View key={thermostat.idx} style={stylesListsDevices.iconBox}>
        <IconDomoticzThermostat/>
      </View>
        <View style={stylesListsDevices.contentBox}>
          <View style={thermostatStyles.titleControlBox}>
            <View style={thermostatStyles.libelleBox}>
              <ThemedText style={{ fontSize: 16, color: 'white' }}>{thermostat.name}</ThemedText>
            </View>
            {/* T11 — boutons +/- autour de la valeur consigne */}
            <View style={thermostatStyles.controlBox}>
              <TouchableOpacity
                style={[thermostatStyles.adjustButton, !thermostat.isActive && thermostatStyles.adjustButtonDisabled]}
              activeOpacity={0.7}
              onPress={handleDecrease}
              disabled={!thermostat.isActive}
              accessibilityRole="button"
              accessibilityLabel="Diminuer la consigne"
              >
                <ThemedText style={thermostatStyles.adjustButtonText}>−</ThemedText>
              </TouchableOpacity>
              <View style={thermostatStyles.consigneControlBox}>
                <ThemedText style={thermostatStyles.consigneControlLabel}>Consigne</ThemedText>
                <ThemedText style={thermostatStyles.textLevel}>{getStatusLabel(thermostat, nextValue)} {thermostat.unit}</ThemedText>
              </View>
              <TouchableOpacity
                style={[thermostatStyles.adjustButton, !thermostat.isActive && thermostatStyles.adjustButtonDisabled]}
                activeOpacity={0.7}
                onPress={handleIncrease}
                disabled={!thermostat.isActive}
              accessibilityRole="button"
              accessibilityLabel="Augmenter la consigne"
            >
              <ThemedText style={thermostatStyles.adjustButtonText}>+</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        {/* T12 — mesure vs consigne */}
        {measuredTemp && (
          <View style={thermostatStyles.measuredRow}>
            <View style={thermostatStyles.measuredSection}>
              <ThemedText style={thermostatStyles.measuredLabel}>Mesure : </ThemedText>
              <ThemedText style={thermostatStyles.measuredValue}>{measuredTemp.temp}°C</ThemedText>
            </View>
            <View style={thermostatStyles.consigneSection}>
              <ThemedText style={thermostatStyles.consigneLabel}>Consigne : </ThemedText>
              <ThemedText style={thermostatStyles.consigneValue}>{thermostat.temp}°C</ThemedText>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};




/**
 * Label du statut du thermostat (consigne courante).
 */
function getStatusLabel(device: DomoticzThermostat, nextValue: number): string {
  if (!device.isActive) return "-";
  return nextValue + "";
}

const thermostatStyles = StyleSheet.create({
  viewBox: {
    flexDirection: 'row',
    width: '100%',
    padding: 10,
    margin: 1,
    borderColor: '#3A3A3A',
    borderWidth: 1,
    backgroundColor: '#0b0b0b',
    minHeight: 84,
  },
  viewBoxDisabled: {
    flexDirection: 'row',
    width: '100%',
    padding: 10,
    margin: 1,
    opacity: 0.2,
    minHeight: 84,
  },
  titleControlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 4,
  },
  consigneControlBox: {
    minWidth: 70,
    alignItems: 'center',
  },
  consigneControlLabel: {
    fontSize: 11,
    color: '#9BA1A6',
  },
  adjustButton: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#1f1a08',
    borderWidth: 1,
    borderColor: Colors.domoticz.color,
    paddingHorizontal: 10,
  },
  adjustButtonDisabled: {
    opacity: 0.35,
  },
  adjustButtonText: {
    color: Colors.domoticz.color,
    fontSize: 20,
    fontWeight: 'bold',
  },
  textLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.domoticz.color,
    textAlign: "right",
  },  
  measuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 2,
  },
  measuredSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  consigneSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  libelleBox: {
    flex: 1,
  },
  measuredLabel: {
    fontSize: 12,
    color: '#9BA1A6',
  },
  measuredValue: {
    fontSize: 12,
    color: '#d5d5d5',
    fontWeight: 'bold',
  },
  consigneLabel: {
    fontSize: 12,
    color: '#9BA1A6',
  },
  consigneValue: {
    fontSize: 12,
    color: Colors.domoticz.color,
    fontWeight: 'bold',
  },
});
