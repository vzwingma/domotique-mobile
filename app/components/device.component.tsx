import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { updateDeviceLevel } from "../controllers/devices.controller";
import { getGroupColor } from "../constants/Colors";
import IconDomoticzDevice, { getDeviceIcon } from "@/components/IconDomoticzDevice";

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
      <View key={device.idx} style={device.isActive ? styles.viewBox : styles.viewBoxDisabled }>
        <View key={device.idx} style={device.isActive ? styles.iconBox : styles.iconBoxDisabled}>
            <IconDomoticzDevice name={getDeviceIcon(device)}
                                      size={78}
                                      color={getGroupColor(device)} 
                                      onPress={() => device.isActive ? 
                                                        updateDeviceLevel(device.idx, device.status === "Off" ? device.level : 0, storeDeviceData, device.subType)
                                                        : {}}  />
        </View>
        <View style={{flexDirection: "column"}}>
          <View style={{flexDirection: "row", justifyContent: "space-between"}}>
            <ThemedText style={{fontSize: 20, color: getGroupColor(device)}}>{device.name}</ThemedText>
            {device.isActive ? <ThemedText style={styles.textLevel}>{device.status}</ThemedText> : <></>}
          </View>  
          <Slider
            disabled={!device.isActive}
            style={device.isActive ? styles.slider : styles.sliderDisabled}
            minimumValue={0} 
            value={nextValue}
            maximumValue={100}
            step={1}
            minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#606060" thumbTintColor="#77B5FE"
            onValueChange={(value) => nextValue = value}
            onResponderEnd={() => updateDeviceLevel(device.idx, nextValue, storeDeviceData, device.subType)}
          />
        </View>
      </View>
    );
  };




const styles = StyleSheet.create({
  viewBox: {
    flexDirection: 'row',
    height: 100,
    width: '96%',
    padding: 10,
    margin: 5,
    borderColor: '#808080',
    borderWidth: 1,
  },
  viewBoxDisabled: {
    flexDirection: 'row',
    height: 100,
    width: '96%',
    padding: 10,
    margin: 5,
    borderColor: '#808080',
    borderWidth: 1,
    opacity: 0.5,
  },  
  iconBox: {
    marginRight: 10,
  },
  iconBoxDisabled: {
    marginRight: 10,
    borderColor: '#FF0000',
    borderWidth: 1,
    opacity: 0.5,
    cursor: 'auto'
  },
  slider: {
    width: 260, 
    height: 40
  },
  sliderDisabled: {
    width: 260, 
    height: 40,
    opacity: 0
  },
  textLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFBB3F',
  },
});
