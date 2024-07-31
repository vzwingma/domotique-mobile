import DomoticzEquipement from "@/app/models/domoticzEquipement.model";
import { ThemedText } from "../ThemedText";
import { StyleSheet, View } from "react-native";

// Définition des propriétés d'une lumière Domoticz
type DomoticzLightProps = {
    lumiere: DomoticzEquipement;
  };

/**
 * Composant pour afficher une lumière Domoticz.
 */
export const DomoticzLight: React.FC<DomoticzLightProps> = ({ lumiere }) => {
  console.log('lumiere', lumiere);
    return (
      <View key={lumiere.idx} style={styles.viewBox}>
        <ThemedText>{lumiere.idx} | {lumiere.name}</ThemedText>
      </View>
    );
  };
  
const styles = StyleSheet.create({
  viewBox: {
    flexDirection: 'row',
    height: 100,
    padding: 20,
    margin: 10,
    borderColor: '#808080',
    borderWidth: 1,
  },
});
