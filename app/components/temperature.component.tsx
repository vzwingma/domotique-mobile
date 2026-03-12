import IconDomoticzTemperature, { getTemperatureIcon } from "@/components/IconDomoticzTemperature";
import DomoticzTemperature from "../models/domoticzTemperature.model";
import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, View } from "react-native";
import { Colors } from "../enums/Colors";
import { DisconnectedState } from "./disconnectedState.component";

// Définition des propriétés d'une température Domoticz
type DomoticzTempProps = {
  temperature: DomoticzTemperature;
};


/**
* Composant pour afficher une mesure de température Domoticz.
*/
export const ViewDomoticzTemperature: React.FC<DomoticzTempProps> = ({ temperature }) => {
  // T06/T14 — valeur disponible uniquement si actif et temp non-nulle
  const showValue = temperature.isActive && temperature.temp !== null && temperature.temp !== undefined;

  return (
    <View key={temperature.idx} style={temperature.isActive ? temperatureStyles.viewBox : temperatureStyles.viewBoxDisconnected}>
      <View key={temperature.idx} style={temperatureStyles.iconBox}>
        <IconDomoticzTemperature name={getTemperatureIcon(temperature)} color={(temperature.idx === '101' ? "#F8C969" : "white")} size={44} />
      </View>
      <View style={temperatureStyles.titleValueBox}>
        <ThemedText style={temperatureStyles.textName}>{temperature.name}</ThemedText>
      </View>
      <View style={temperatureStyles.valuesBox}>
        {temperature.isActive ? (
          showValue ? (
            <>
              <ThemedText style={temperatureStyles.textLevel}>{temperature.temp}°C</ThemedText>
              {temperature.humidity
                ? <ThemedText style={temperatureStyles.textLevel}>{temperature.humidity}%</ThemedText>
                : null}
            </>
          ) : (
            <ThemedText style={temperatureStyles.textLevel}>Inconnu</ThemedText>
          )
        ) : (
          <DisconnectedState />
        )}
      </View>
    </View>
  );
};

// T13 — styles compacts pour les cartes température
const temperatureStyles = StyleSheet.create({
  viewBox: {
    flexDirection: 'row',
    height: 66,
    width: '100%',
    padding: 10,
    margin: 1,
    borderColor: '#3A3A3A',
    borderWidth: 1,
    backgroundColor: '#0b0b0b',
    alignItems: 'center',
  },
  viewBoxDisconnected: {
    flexDirection: 'row',
    height: 66,
    width: '100%',
    padding: 10,
    margin: 1,
    borderColor: '#7f2b2b',
    borderWidth: 1,
    backgroundColor: '#1a1212',
    alignItems: 'center',
    opacity: 0.5,
  },
  iconBox: {
    marginRight: 10,
    height: 44,
    width: 44,
  },
  titleValueBox: {
    flex: 1,
    justifyContent: 'center',
  },
  valuesBox: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 60,
  },
  textLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.domoticz.color,
  },
  textName: {
    fontSize: 14,
    color: 'white',
  },
});