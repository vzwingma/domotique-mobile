import DomoticzEquipement from "@/app/models/domoticzEquipement.model";
import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { updateDeviceLevel } from "../controllers/devices.controller";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getGroupColor } from "../constants/Colors";
import { DomoticzType } from "../constants/DomoticzEnum";


// Définition des propriétés d'un volet Domoticz
type DomoticzBlindProps = {
    volet: DomoticzEquipement;
    setVoletsData: React.Dispatch<React.SetStateAction<DomoticzEquipement[]>>;
  };



/**
 * Composant pour afficher un volet Domoticz.
 */
export const DomoticzBlind: React.FC<DomoticzBlindProps> = ({ volet, setVoletsData: storeVoletsData }) => {
    let nextValue : number = 0;

    return (
      <View key={volet.idx} style={styles.viewBox}>
        <View key={volet.idx} style={styles.iconBox}>
          { /* Icone du volet : https://oblador.github.io/react-native-vector-icons/ */ }
            <MaterialCommunityIcons name={volet.status === "Off" ? "window-shutter" : "window-shutter-open" } 
                                    size={78} color={getGroupColor(volet)}
                                    onPress={() => updateDeviceLevel(volet.idx, volet.status === "Off" ? volet.level : 0, storeVoletsData, DomoticzType.BLIND)} 
                                    />
        </View>
        <View style={{flexDirection: "column"}}>
          <View style={{flexDirection: "row", justifyContent: "space-between"}}>
            <ThemedText style={{fontSize: 20, color: getGroupColor(volet)}}>{volet.name}</ThemedText>
            <ThemedText style={styles.textLevel}>{volet.status}</ThemedText>
          </View>  
          <Slider
            style={styles.slider}
            minimumValue={0}
            value={volet.status === "Off" ? 0 : volet.level}
            maximumValue={100}
            step={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#606060"
            thumbTintColor="#77B5FE"
            onValueChange={(value) => nextValue = value}
            onResponderEnd={() => updateDeviceLevel(volet.idx, nextValue, storeVoletsData, DomoticzType.BLIND)}
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
