import { ThemedText } from "../../components/ThemedText";
import { View } from "react-native";
import Slider from '@react-native-community/slider';
import { Colors } from "../enums/Colors";
import { useContext, useState } from "react";
import { DomoticzContext } from "../services/DomoticzContextProvider";
import DomoticzThermostat from "../models/domoticzThermostat.model";
import IconDomoticzThermostat from "@/components/IconDomoticzThermostat";
import { DomoticzThermostatLevelValue } from "../enums/DomoticzEnum";
import { evaluateThermostatPoint, updateThermostatPoint } from "../controllers/thermostats.controller";
import { stylesListsDevices } from "./device.component";

// Définition des propriétés d'un équipement Domoticz
export type DomoticzThermostatProps = {
  thermostat: DomoticzThermostat;
};



/**
 * Composant pour afficher un équipement Domoticz.
 * @param device équipement Domoticz
 * @param storeDeviceData setter pour les données des équipements
 */
export const ViewDomoticzThermostat: React.FC<DomoticzThermostatProps> = ({ thermostat }: DomoticzThermostatProps) => {

  const [flagLabel, setFlagLabel] = useState<boolean>(false);
  const [nextValue, setNextValue] = useState<number>(thermostat.temp);
  const { setDomoticzThermostatData } = useContext(DomoticzContext)!;

  return (
    <View key={thermostat.idx} style={thermostat.isActive ? stylesListsDevices.viewBox : stylesListsDevices.viewBoxDisabled}>
      <View key={thermostat.idx} style={stylesListsDevices.iconBox}>
        <IconDomoticzThermostat thermostat={thermostat} />
      </View>
      <View style={{ flexDirection: "column" }}>
        <View style={stylesListsDevices.labelsBox}>
          <ThemedText style={{ fontSize: 16, color: 'white' }}>{thermostat.name}</ThemedText>
          <ThemedText style={stylesListsDevices.textLevel}>{getStatusLabel(thermostat, nextValue, flagLabel)}</ThemedText>
        </View>
        <Slider
          disabled={!thermostat.isActive}
          style={thermostat.isActive ? stylesListsDevices.slider : stylesListsDevices.sliderDisabled}
          minimumValue={DomoticzThermostatLevelValue.MIN} value={thermostat.temp} maximumValue={DomoticzThermostatLevelValue.MAX}
          step={1}
          minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#606060" thumbTintColor={Colors.domoticz.color}
          onValueChange={(value) => { overrideNextValue(value, setNextValue) }}
          onResponderStart={() => { setFlagLabel(true) }}
          onResponderEnd={() => {
            updateThermostatPoint(thermostat.idx, thermostat, nextValue, setDomoticzThermostatData);
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
    let nextLabel = "(" + nextValue + device.unit + ")";
    getStatusLabel = nextLabel;
  }
  // Sinon on affiche le niveau actuel
  else {
    getStatusLabel = device.temp + device.unit;
  }
  return getStatusLabel;

}