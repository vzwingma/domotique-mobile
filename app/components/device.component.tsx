import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { updateDeviceLevel } from "../controllers/devices.controller";
import { Colors, getGroupColor } from "../enums/Colors";
import { DomoticzDeviceStatus, DomoticzSwitchType, DomoticzType } from "../enums/DomoticzEnum";
import { useState } from "react";
import IconDomoticzDevice from "@/components/IconDomoticzDevice";

// Définition des propriétés d'un équipement Domoticz
export type DomoticzDeviceProps = {
  device: DomoticzDevice;
  storeDeviceData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>;
};



/**
 * Composant pour afficher un équipement Domoticz.
 * @param device équipement Domoticz
 * @param storeDeviceData setter pour les données des équipements
 */
export const ViewDomoticzDevice: React.FC<DomoticzDeviceProps> = ({ device, storeDeviceData } : DomoticzDeviceProps) => {

  const [flagLabel, setFlagLabel] = useState<boolean>(false);
  const [nextValue, setNextValue] = useState<number>(getLevel(device));


  return (
    <View key={device.idx} style={device.isActive ? stylesLists.viewBox : stylesLists.viewBoxDisabled}>
      <View key={device.idx} style={stylesLists.iconBox}>
          <IconDomoticzDevice device={device} storeDeviceData={storeDeviceData}/>
      </View>
      <View style={{ flexDirection: "column" }}>
        <View style={device.consistantLevel ? stylesLists.labelsBox : stylesLists.labelsBoxUnconsistent}>
          <ThemedText style={{ fontSize: 16, color: getGroupColor(device) }}>{device.name}</ThemedText>
          <ThemedText style={stylesLists.textLevel}>{getStatusLabel(device, nextValue, flagLabel)}</ThemedText>
        </View>
        {device.switchType === DomoticzSwitchType.SLIDER ?
          <Slider
            disabled={!device.isActive}
            style={device.isActive ? stylesLists.slider : stylesLists.sliderDisabled}
            minimumValue={0} value={getLevel(device)} maximumValue={100}
            step={1}
            minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#606060" thumbTintColor={Colors.domoticz.color}
            onValueChange={(value) => { overrideNextValue(value, setNextValue) }}
            onResponderStart={() => { setFlagLabel(true) }}
            onResponderEnd={() => {
              updateDeviceLevel(device.idx, device, nextValue, storeDeviceData);
              setFlagLabel(false);
            }}
          /> : <Slider disabled style={stylesLists.sliderDisabled} />}
      </View>
    </View>
  );
};



/**
 * retourrne le niveau de l'équipement
 * @param device  équipement Domoticz
 * @returns niveau de l'équipement :
 */
function getLevel(device: DomoticzDevice): number {
  return device.status === DomoticzDeviceStatus.OFF ? 0.1 : device.level
}


/**
 * Surcharge de la valeur du slider pour la mettre à jour
 * @param value prochain niveau de l'équipement
 * @param setNextValue  fonction pour mettre à jour le prochain niveau de l'équipement
 */
function overrideNextValue(value: number, setNextValue: React.Dispatch<React.SetStateAction<number>>) {
  if (value <= 0) {
    value = 0.1;
  }
  else if (value >= 99) {
    value = 100;
  }
  setNextValue(value);
}

/**
 * Fonction pour le label du statut de l'équipement. Si on est en mode édition, on affiche le prochain état entre parenthèses.
 */
function getStatusLabel(device: DomoticzDevice, nextValue: number, flagLabel: boolean): string {


  let getStatusLabel = "";
  // Si l'équipement est désactivé
  if (!device.isActive) {
    getStatusLabel = "-";
  }
  // Si on est en mode édition
  else if (flagLabel) {
    let nextLabel = "(";
    if (nextValue <= 0.1) {
      nextLabel += DomoticzDeviceStatus.OFF;
    }
    else {
      nextLabel += nextValue + "%";
    }
    nextLabel += ")";
    getStatusLabel = nextLabel;
  }
  // Si c'est un interrupteur
  else if (device.switchType === DomoticzSwitchType.ONOFF) {
    getStatusLabel = device.status;
  }
  // Si c'est un variateur
  else {
    getStatusLabel = device.status === DomoticzDeviceStatus.OFF ? DomoticzDeviceStatus.OFF : device.level + "%";
  }
  // Si le groupe n'est pas cohérent
  if (!device.consistantLevel) {
    getStatusLabel += " ?";
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
    width: 60,
  },
  labelsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2
  },
  labelsBoxUnconsistent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    opacity: 0.5
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
