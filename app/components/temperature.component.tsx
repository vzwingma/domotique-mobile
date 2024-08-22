import IconDomoticzTemperature, { getTemperatureIcon } from "@/components/IconDomoticzTemperature";
import DomoticzTemperature from "../models/domoticzTemperature.model";
import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, View } from "react-native";


// Définition des propriétés d'une température Domoticz
type DomoticzTempProps = {
  temperature: DomoticzTemperature;
};

/**
* Composant pour afficher une mesure de température Domoticz.
*/
export const ViewDomoticzTemperature: React.FC<DomoticzTempProps> = ({ temperature }) => {
  return (
    <View key={temperature.idx} style={temperature.isActive ? styles.viewBox : styles.viewBoxDisabled}>
      <View key={temperature.idx} style={styles.iconBox}>
        <IconDomoticzTemperature name={getTemperatureIcon(temperature)} color={"white"} size={78} />
      </View>
      <View style={{flexDirection: "column"}}>
        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
          <ThemedText style={styles.textName}>{temperature.name}</ThemedText>
          <View style={{flexDirection: "column"}}>
            <ThemedText style={styles.textLevel}>{temperature.temp} °C</ThemedText>
            { temperature.humidity ? <ThemedText style={styles.textLevel}>{temperature.humidity} %</ThemedText> : <></> }
          </View>
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
  viewBoxDisabled: {
    flexDirection: 'row',
    height: 100,
    width: '96%',
    padding: 10,
    margin: 5,
    borderColor: '#808080',
    borderWidth: 1,
    opacity: 0.5
  },  
  iconBox: {
    marginRight: 10,
  },
  textName: {
    fontSize: 20,
    fontWeight: 'bold',
    width: 200,
  },  
  textLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFBB3F',
  }
});
