import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { updateDeviceLevel } from "../controllers/devices.controller";
import { Colors, getGroupColor } from "../enums/Colors";
import { DomoticzDeviceStatus, DomoticzSwitchType } from "../enums/DomoticzEnum";
import { useContext, useState } from "react";
import IconDomoticzDevice from "@/components/IconDomoticzDevice";
import { DomoticzContext } from "../services/DomoticzContextProvider";

// Définition des propriétés d'un équipement Domoticz
export type DomoticzDeviceProps = {
  device: DomoticzDevice;
};



/**
 * Composant pour afficher un équipement Domoticz.
 * @param device équipement Domoticz
 * @param storeDeviceData setter pour les données des équipements
 */
export const ViewDomoticzDevice: React.FC<DomoticzDeviceProps> = ({ device }: DomoticzDeviceProps) => {

  const [flagLabel, setFlagLabel] = useState<boolean>(false);
  const [nextValue, setNextValue] = useState<number>(getLevel(device));
  const { setDomoticzDevicesData } = useContext(DomoticzContext)!;

  return (
    <View key={device.idx} style={device.isActive ? stylesListsDevices.viewBox : stylesListsDevices.viewBoxDisabled}>
      <View key={device.idx} style={stylesListsDevices.iconBox}>
        <IconDomoticzDevice device={device} />
      </View>
      <View style={stylesListsDevices.contentBox}>
        <View style={device.consistantLevel ? stylesListsDevices.labelsBox : stylesListsDevices.labelsBoxUnconsistent}>
          <View style={stylesListsDevices.libelleBox}>
            <ThemedText style={{ fontSize: 16, color: getGroupColor(device) }}>{device.name}</ThemedText>
          </View>
          <View style={stylesListsDevices.valueBox}>
            <ThemedText style={stylesListsDevices.textLevel}>{getStatusLabel(device, nextValue, flagLabel)}</ThemedText>
          </View>
          <View style={stylesListsDevices.unitBox}>
            <ThemedText style={stylesListsDevices.textLevel}>{device.unit}</ThemedText>
          </View>
        </View>
        {device.switchType === DomoticzSwitchType.SLIDER ?
          <Slider
            disabled={!device.isActive}
            style={device.isActive ? stylesListsDevices.slider : stylesListsDevices.sliderDisabled}
            minimumValue={0} value={getLevel(device)} maximumValue={100}
            step={1}
            minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#606060" thumbTintColor={Colors.domoticz.color}
            onValueChange={(value) => { overrideNextValue(value, setNextValue) }}
            onResponderStart={() => { setFlagLabel(true) }}
            onResponderEnd={() => {
              updateDeviceLevel(device.idx, device, nextValue, setDomoticzDevicesData);
              setFlagLabel(false);
            }}
          /> : <Slider disabled style={stylesListsDevices.sliderDisabled} />}
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
    else{
      nextLabel += nextValue;
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
    if(device.status !== DomoticzDeviceStatus.OFF){
      getStatusLabel = device.level + "";
      device.unit = "%";
    }
    else{
      getStatusLabel = DomoticzDeviceStatus.OFF;
      device.unit = "";
    }
  }
  // Si le groupe n'est pas cohérent
  if (!device.consistantLevel) {
    device.unit = "?";
  }
  return getStatusLabel;

}





export const stylesListsDevices = StyleSheet.create({
  viewBox: {
    flexDirection: 'row',
    height: 84,
    width: '100%',
    padding: 10,
    margin: 1,
    borderColor: '#3A3A3A',
    borderWidth: 1,
    backgroundColor: '#0b0b0b',
  },
  viewBoxDisabled: {
    flexDirection: 'row',
    height: 84,
    width: '100%',
    padding: 10,
    margin: 1,
    opacity: 0.2,
  },
  iconBox: {
    marginRight: 10,
    height: 60,
    width: 60
  },
  contentBox: {
    flexDirection: "column",
    width: "100%",
    paddingRight: 75
  },
  labelsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    width: '100%',
  },
  labelsBoxUnconsistent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    opacity: 0.5,
    width: '100%'
  },
  libelleBox: {
    width: "100%",
  },   
  valueBox: {
    flexDirection: "column",
    marginLeft: -50,
  },  
  unitBox: {
    width: 20,
  },

  slider: {
    height: 40,
    marginTop: -10,
  },
  sliderDisabled: {
    height: 40,
    marginTop: -10,
    opacity: 0
  },
  textLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.domoticz.color,
    paddingBottom: 7,
    textAlign: "right",
  },
  textName: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 200,
  }
});
