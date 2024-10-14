import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { Colors } from "../enums/Colors";
import { useContext, useState } from "react";
import { DomoticzContext } from "../services/DomoticzContextProvider";
import DomoticzThermostat from "../models/domoticzThermostat.model";
import IconDomoticzThermostat from "@/components/IconDomoticzThermostat";
import { DomoticzThermostatLevelValue } from "../enums/DomoticzEnum";
import { evaluateThermostatPoint } from "../controllers/thermostats.controller";

// Définition des propriétés d'un équipement Domoticz
export type DomoticzThermostatProps = {
  device: DomoticzThermostat;
};



/**
 * Composant pour afficher un équipement Domoticz.
 * @param device équipement Domoticz
 * @param storeDeviceData setter pour les données des équipements
 */
export const ViewDomoticzThermostat: React.FC<DomoticzThermostatProps> = ({ device }: DomoticzThermostatProps) => {

  const [flagLabel, setFlagLabel] = useState<boolean>(false);
  const [nextValue, setNextValue] = useState<number>(device.temp);
  const { setDomoticzDevicesData } = useContext(DomoticzContext)!;

  return (
    <View key={device.idx} style={device.isActive ? stylesLists.viewBox : stylesLists.viewBoxDisabled}>
      <View key={device.idx} style={stylesLists.iconBox}>
        <IconDomoticzThermostat size={60} />
      </View>
      <View style={{ flexDirection: "column" }}>
        <View style={stylesLists.labelsBox}>
          <ThemedText style={{ fontSize: 16, color: 'white'}}>{device.name}</ThemedText>
          <ThemedText style={stylesLists.textLevel}>{getStatusLabel(device, nextValue, flagLabel)}</ThemedText>
        </View>
          <Slider
            disabled={!device.isActive}
            style={device.isActive ? stylesLists.slider : stylesLists.sliderDisabled}
            minimumValue={DomoticzThermostatLevelValue.MIN} value={device.temp} maximumValue={DomoticzThermostatLevelValue.MAX}
            step={1}
            minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#606060" thumbTintColor={Colors.domoticz.color}
            onValueChange={(value) => { overrideNextValue(value, setNextValue) }}
            onResponderStart={() => { setFlagLabel(true) }}
            onResponderEnd={() => {
          //    updateDeviceLevel(device.idx, device, nextValue, setDomoticzDevicesData);
              setFlagLabel(false);
            }}
          />
      </View>
    </View>
  );
};




/**
 * Surcharge de la valeur du slider pour la mettre à jour
 * @param value prochain niveau de l'équipement
 * @param setNextValue  fonction pour mettre à jour le prochain niveau de l'équipement
 */
function overrideNextValue(value: number, setNextValue: React.Dispatch<React.SetStateAction<number>>) {
  setNextValue(evaluateThermostatPoint(value));
}

/**
 * Fonction pour le label du statut de l'équipement. Si on est en mode édition, on affiche le prochain état entre parenthèses.
 */
function getStatusLabel(device: DomoticzThermostat, nextValue: number, flagLabel: boolean): string {


  let getStatusLabel = "";
  // Si l'équipement est désactivé
  if (!device.isActive) {
    getStatusLabel = "-";
  }
  // Si on est en mode édition
  else if (flagLabel) {
    let nextLabel = "(" + nextValue + "°C)";
    getStatusLabel = nextLabel;
  }
  // Si c'est un variateur
  else {
    getStatusLabel = device.temp + "°C";
  }
  return getStatusLabel;

}





export const stylesLists = StyleSheet.create({
  viewBox: {
    flexDirection: 'row',
    height: 84,
    width: '98%',
    padding: 10,
    margin: 1,
    borderColor: '#3A3A3A',
    borderWidth: 1,
    backgroundColor: '#0b0b0b',
  },
  viewBoxDisabled: {
    flexDirection: 'row',
    height: 64,
    width: '98%',
    padding: 1,
    margin: 1,
    borderColor: '#FF0000',
    borderWidth: 1,
    opacity: 0.2,
  },
  iconBox: {
    marginRight: 10,
    height: 60,
    width: 60
  },
  labelsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2
  },
  slider: {
    width: 270,
    height: 40,
    marginTop: -10
  },
  sliderDisabled: {
    width: 270,
    height: 50,
    marginTop: -10,
    opacity: 0
  },
  textLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.domoticz.color,
    paddingBottom: 7,
    paddingRight: 15
  },
  textName: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 200,
  }
});
