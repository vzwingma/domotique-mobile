import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { updateDeviceLevel } from "../controllers/devices.controller";
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
    let nextValue : number = device.level;

    return (
      <View key={device.idx} style={device.isActive ? stylesLists.viewBox : stylesLists.viewBoxDisabled }>
        <View key={device.idx} style={stylesLists.iconBox}>
            <IconDomoticzDevice name={getDeviceIcon(device)}
                                      size={78}
                                      color={getGroupColor(device)} 
                                      onPress={() => device.isActive ? 
                                                        updateDeviceLevel(device.idx, device.status === "Off" ? device.level : 0, storeDeviceData, device.subType)
                                                        : {}}  />
        </View>
        <View style={{flexDirection: "column"}}>
          <View style={stylesLists.labelsBox}>
            <ThemedText style={{fontSize: 20, color: getGroupColor(device), width:270}}>{device.name}</ThemedText>
            {device.isActive ? <ThemedText style={stylesLists.textLevel}>{device.status}</ThemedText> : <></>}
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
              onResponderEnd={() => updateDeviceLevel(device.idx, nextValue, storeDeviceData, device.subType)}
            /> : <></> }
        </View>
      </View>
    );
  };




export const stylesLists = StyleSheet.create({
  viewBox: {
    flexDirection: 'row',
    height: 90,
    width: '98%',
    padding: 3,
    margin: 2,
    borderColor: '#565656',
    borderWidth: 1,
  },
  viewBoxDisabled: {
    flexDirection: 'row',
    height: 90,
    width: '98%',
    padding: 3,
    margin: 3,
    borderColor: '#FF0000',
    borderWidth: 1,
    opacity: 0.2,
  },  
  iconBox: {
    marginRight: 10,
    marginLeft: 2,
  },
  labelsBox: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 9
  },
  slider: {
    width: 300, 
    height: 50,
    marginTop: -15
  },
  sliderDisabled: {
    width: 300, 
    height: 50,
    marginTop: -15,
    opacity: 0
  },
  textLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFBB3F',
    paddingBottom: 10
  },
  textName: {
    fontSize: 20,
    fontWeight: 'bold',
    width: 200,
  },  
});
