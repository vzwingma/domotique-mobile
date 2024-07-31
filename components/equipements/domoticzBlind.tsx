import DomoticzEquipement from "@/app/models/domoticzEquipement.model";
import { ThemedText } from "../ThemedText";
import { StyleSheet, View } from "react-native";

// Définition des propriétés d'un volet Domoticz
type DomoticzBlindProps = {
    volet: DomoticzEquipement;
  };

/**
 * Composant pour afficher un volet Domoticz.
 */
export const DomoticzBlind: React.FC<DomoticzBlindProps> = ({ volet }) => {
  console.log('volet', volet);
    return (
      <View key={volet.idx} style={styles.viewBox}>
        <ThemedText>{volet.idx} | {volet.name}</ThemedText>
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
