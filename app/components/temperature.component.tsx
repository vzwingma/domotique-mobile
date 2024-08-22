import IconDomoticzTemperature, { getTemperatureIcon } from "@/components/IconDomoticzTemperature";
import DomoticzTemperature from "../models/domoticzTemperature.model";
import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, View } from "react-native";



// Définition des propriétés d'une température Domoticz
type DomoticzTempProps = {
  temperature: DomoticzTemperature;
  storeTemperaturesData: React.Dispatch<React.SetStateAction<DomoticzTemperature[]>>;
};



/**
* Composant pour afficher une mesure de température Domoticz.
*/
export const ViewDomoticzTemperature: React.FC<DomoticzTempProps> = ({ temperature, storeTemperaturesData: storeTemperaturesData }) => {
  // let nextValue : number = device.level;

  return (
    <View key={temperature.idx} style={styles.viewBox}>
      <View key={temperature.idx} style={temperature.isActive ? styles.iconBox : styles.iconBoxDisabled}>
        <IconDomoticzTemperature name={getTemperatureIcon(temperature)} color={"white"} size={78} />
      </View>
      <View style={{flexDirection: "column"}}>
        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
          <ThemedText style={{fontSize: 20}}>{temperature.name}</ThemedText>
          <ThemedText style={styles.textLevel}>{temperature.status}</ThemedText>
          <ThemedText style={styles.textLevel}>{temperature.temp}</ThemedText>
          <ThemedText style={styles.textLevel}>{temperature.humidity}</ThemedText>
          <ThemedText> -  </ThemedText>
          <ThemedText style={styles.textLevel}>{temperature.data}</ThemedText>
        </View>  
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
  opacity: 0.5
},
textLevel: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#FFBB3F',
},
});
