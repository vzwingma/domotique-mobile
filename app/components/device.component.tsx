import DomoticzEquipement from "@/app/models/domoticzDevice.model";
import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { updateDeviceLevel } from "../controllers/devices.controller";
import { getGroupColor } from "../constants/Colors";
import { DomoticzType } from "../constants/DomoticzEnum";
import DeviceDomoticzIcon, { getIcon } from "@/components/DeviceDomoticzIcon";


// Définition des propriétés d'un équipement Domoticz
type DomoticzDeviceProps = {
    device: DomoticzEquipement;
    storeDeviceData: React.Dispatch<React.SetStateAction<DomoticzEquipement[]>>;
  };



/**
 * Composant pour afficher un équipement Domoticz.
 */
export const DomoticzDevice: React.FC<DomoticzDeviceProps> = ({ device, storeDeviceData: storeDeviceData }) => {
    let nextValue : number = device.level;

    return (
      <View key={device.idx} style={styles.viewBox}>
        <View key={device.idx} style={styles.iconBox}>
            <DeviceDomoticzIcon name={getIcon(device)}
                                size={78}
                                color={getGroupColor(device)}
                                onPress={() => updateDeviceLevel(device.idx, device.status === "Off" ? device.level : 0, storeDeviceData, device.subType)}  />
        </View>
        <View style={{flexDirection: "column"}}>
          <View style={{flexDirection: "row", justifyContent: "space-between"}}>
            <ThemedText style={{fontSize: 20, color: getGroupColor(device)}}>{device.name}</ThemedText>
            <ThemedText style={styles.textLevel}>{device.status}</ThemedText>
          </View>  
          <Slider
            style={styles.slider}
            minimumValue={0}
            value={nextValue}
            maximumValue={100}
            step={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#606060"
            thumbTintColor="#77B5FE"
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
  iconBox: {
    marginRight: 10,
    height: 80,
    width: 80
  },
  slider: {
    width: 260, 
    height: 40
  },

  textLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFBB3F',
  },
});
