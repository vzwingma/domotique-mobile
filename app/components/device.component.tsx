import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { updateDeviceLevel, updateDeviceState } from "../controllers/devices.controller";
import { getGroupColor } from "../constants/Colors";
import IconDomoticzDevice, { getDeviceIcon } from "@/components/IconDomoticzDevice";
import { DomoticzSwitchType } from "../constants/DomoticzEnum";

// Définition des propriétés d'un équipement Domoticz
type DomoticzDeviceProps = {
    device: DomoticzDevice;
    storeDeviceData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>;
  };



/**
 * Composant pour afficher un équipement Domoticz.
 */
export const ViewDomoticzDevice: React.FC<DomoticzDeviceProps> = ({ device, storeDeviceData: storeDeviceData }) => {
    let nextValue : number = device.status === "Off" ? 0.1 : device.level;

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
            <ThemedText style={stylesLists.textLevel}>{getStatusLabel(device)}</ThemedText> 
          </View>
          { device.switchType === DomoticzSwitchType.SLIDER ?
            <Slider
              disabled={!device.isActive}
              style={device.isActive ? stylesLists.slider : stylesLists.sliderDisabled}
              minimumValue={0} 
              value={nextValue}
              maximumValue={100}
              step={1}
              minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#606060" thumbTintColor="#77B5FE"
              onValueChange={(value) => nextValue = value}
              onResponderEnd={() => updateDeviceLevel(device.idx, nextValue, storeDeviceData, device.type)}
            /> : <Slider disabled style={stylesLists.sliderDisabled}/> }
        </View>
      </View>
    );
  };



  /**
   * Fonction pour le label du statut de l'équipement
   */
function getStatusLabel(device: DomoticzDevice) {
    if(device.isActive === false) {
        return "?";
    }
    else if(device.switchType === DomoticzSwitchType.ONOFF) {
        return device.status;
    }
    else{
      return device.status === "Off" ? "Off" : device.level + "%";
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
    height: 64,
    width: '98%',
    padding: 1,
    margin: 1,
    borderColor: '#3A3A3A',
    borderWidth: 1,
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
    marginTop: -15
  },
  sliderDisabled: {
    width: 270, 
    height: 50,
    marginTop: -15,
    opacity: 0
  },
  textLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFBB3F',
    paddingBottom: 7
  },
  textName: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 200,
  },  
});
