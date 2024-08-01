import DomoticzEquipement from "@/app/models/domoticzEquipement.model";
import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { updateLightLevel } from "../controllers/lights.controller";
import { getGroupColor } from "../constants/Colors";

// Définition des propriétés d'une lumière Domoticz
type DomoticzLightProps = {
    lumiere: DomoticzEquipement;
  };

/**
 * Composant pour afficher une lumière Domoticz.
 */
export const DomoticzLight: React.FC<DomoticzLightProps> = ({ lumiere }) => {
  let nextValue : number = 0;

  return (
    <View key={lumiere.idx} style={styles.viewBox}>
      <View key={lumiere.idx} style={styles.iconBox}>
        { /* Icone de la lumière : https://oblador.github.io/react-native-vector-icons/ */ }
          <MaterialCommunityIcons name={lumiere.status === "Off" ? "lightbulb-off-outline" : "lightbulb-on-outline" } 
                                  size={78} color={getGroupColor(lumiere)}
                                  onPress={() => updateLightLevel(lumiere.idx, lumiere.status === "Off" ? lumiere.level : 0)} 
                                  />
      </View>
      <View style={{flexDirection: "column"}}>
        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
          <ThemedText style={{fontSize: 20, color: getGroupColor(lumiere)}}>{lumiere.name}</ThemedText>
          <ThemedText style={styles.textLevel}>{lumiere.status}</ThemedText>
        </View>  
        <Slider
          style={styles.slider}
          minimumValue={0}
          value={lumiere.status === "Off" ? 0 : lumiere.level}
          maximumValue={100}
          step={1}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#606060"
          thumbTintColor="#77B5FE"
          onValueChange={(value) => nextValue = value}
          onResponderEnd={() => updateLightLevel(lumiere.idx, nextValue)}
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
