import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { updateDeviceLevel, updateDeviceState } from "../controllers/devices.controller";
import { Colors, getGroupColor } from "../constants/Colors";
import IconDomoticzDevice, { getDeviceIcon } from "@/components/IconDomoticzDevice";
import { DomoticzSwitchType } from "../constants/DomoticzEnum";
import { useState } from "react";

// Définition des propriétés d'un équipement Domoticz
type DomoticzDeviceProps = {
    device: DomoticzDevice;
    storeDeviceData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>;
  };

  

/**
 * Composant pour afficher un équipement Domoticz.
 * @param device équipement Domoticz
 * @param storeDeviceData setter pour les données des équipements
 */
export const ViewDomoticzDevice: React.FC<DomoticzDeviceProps> = ({ device, storeDeviceData: storeDeviceData }) => {

    const [flagLabel, showLabel] = useState<Boolean>(false);
    const [nextValue, refreshNextValue] = useState<number>(device.status === "Off" ? 0.1 : (device.level >= 99 ? 100 : device.level));

    return (
      <View key={device.idx} style={device.isActive ? stylesLists.viewBox : stylesLists.viewBoxDisabled }>
        <View key={device.idx} style={stylesLists.iconBox}>
            <IconDomoticzDevice name={getDeviceIcon(device)}
                                size={60}
                                color={getGroupColor(device)} 
                                onPress={() => onClickDeviceIcon(device, storeDeviceData)}  />
        </View>
        <View style={{flexDirection: "column"}}>
          <View style={stylesLists.labelsBox}>
            <ThemedText style={{fontSize: 16, color: getGroupColor(device)}}>{device.name}</ThemedText>
            <ThemedText style={stylesLists.textLevel}>{getStatusLabel(device, nextValue, flagLabel)}</ThemedText> 
          </View>
          { device.switchType === DomoticzSwitchType.SLIDER ?
            <Slider
              disabled={!device.isActive}
              style={device.isActive ? stylesLists.slider : stylesLists.sliderDisabled}
              minimumValue={0} value={nextValue} maximumValue={100}
              step={1}
              minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#606060" thumbTintColor={Colors.domoticz.color}
              onValueChange={(value) => { setNextValue(value, refreshNextValue)}}
              onPointerDown={() => showLabel(true)}
              onResponderEnd={() => {
                updateDeviceLevel(device.idx, nextValue, storeDeviceData, device.type);
                showLabel(false);
              }}
            /> : <Slider disabled style={stylesLists.sliderDisabled}/> }
        </View>
      </View>
    );
  };


  /**
   * Surcharge de la valeur du slider pour la mettre à jour
   * @param value prochain niveau de l'équipement
   * @param refreshNextValue  fonction pour mettre à jour le prochain niveau de l'équipement
   */
  function setNextValue(value: number, refreshNextValue: React.Dispatch<React.SetStateAction<number>>) {
    if(value <= 0) {
      value = 0.1;
    }
    else if(value >= 99) {
      value = 100;
    }
    refreshNextValue(value);
  }

  /**
   * Fonction pour le label du statut de l'équipement. Si on est en mode édition, on affiche le prochain état entre parenthèses.
   */
function getStatusLabel(device: DomoticzDevice, nextValue: number, flagLabel: Boolean) {

    if(device.isActive === false) {
        return "?";
    }
    else if(flagLabel) {
      let nextLabel = "(";
      if(nextValue <= 0.1) {
        nextLabel += "Off";
      }
      else if(nextValue >= 99) {
        nextLabel += "100%";
      }
      else {
        nextLabel += nextValue + "%";
      }
      nextLabel += ")";
      return nextLabel;
    }
    else if(device.switchType === DomoticzSwitchType.ONOFF) {
        return device.status;
    }
    else{
      let level = device.level >= 99 ? 100 : device.level;
      return device.status === "Off" ? "Off" : level + "%";
    }
}



/**
 * fonction pour gérer le clic sur l'icône de l'équipement
 * @param device composant DomoticzDevice
 * @param storeDeviceData setter pour les données des équipements
 */
function onClickDeviceIcon(device: DomoticzDevice, storeDeviceData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
     if(device.isActive) {
         if(device.switchType === DomoticzSwitchType.ONOFF) {
             updateDeviceState(device.idx, device.status === "Off", storeDeviceData, device.type);
         }
         else {
             updateDeviceLevel(device.idx, device.status === "Off" ? device.level : 0, storeDeviceData, device.type);
         }
     }
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
    paddingBottom: 7
  },
  textName: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 200,
  },  
});
