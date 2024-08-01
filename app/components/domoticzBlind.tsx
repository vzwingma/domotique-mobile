import DomoticzEquipement from "@/app/models/domoticzEquipement.model";
import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { updateBlindLevel } from "../controllers/blinds.controller";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


// Définition des propriétés d'un volet Domoticz
type DomoticzBlindProps = {
    volet: DomoticzEquipement;
  };

/**
 * Composant pour afficher un volet Domoticz.
 */
export const DomoticzBlind: React.FC<DomoticzBlindProps> = ({ volet }) => {
    let nextValue : number = 0;

    return (
      <View key={volet.idx} style={styles.viewBox}>
        <View key={volet.idx} style={styles.iconBox}>
            <MaterialCommunityIcons name={volet.status === "Off" ? "window-shutter" : "window-shutter-open" } 
                                    size={78} color="white"
                                    onPress={() => updateBlindLevel(volet.idx, volet.status === "Off" ? volet.level : 0)} 
                                    />
        </View>
        <View style={{flexDirection: "column"}}>
          <View style={{flexDirection: "row", justifyContent: "space-between"}}>
            <ThemedText style={volet.isGroup ? styles.textLabelGroup : styles.textLabel}>{volet.name}</ThemedText>
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
            onResponderEnd={() => updateBlindLevel(volet.idx, nextValue)}
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


  textLabel: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  textLabelGroup: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  textLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFBB3F',
  },
});
