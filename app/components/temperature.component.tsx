import IconDomoticzTemperature, { getTemperatureIcon } from "@/components/IconDomoticzTemperature";
import DomoticzTemperature from "../models/domoticzTemperature.model";
import { ThemedText } from "@/components/ThemedText";
import { View } from "react-native";
import { stylesLists } from "./device.component";

// Définition des propriétés d'une température Domoticz
type DomoticzTempProps = {
  temperature: DomoticzTemperature;
};

/**
* Composant pour afficher une mesure de température Domoticz.
*/
export const ViewDomoticzTemperature: React.FC<DomoticzTempProps> = ({ temperature }) => {
  return (
    <View key={temperature.idx} style={temperature.isActive ? stylesLists.viewBox : stylesLists.viewBoxDisabled}>
      <View key={temperature.idx} style={stylesLists.iconBox}>
        <IconDomoticzTemperature name={getTemperatureIcon(temperature)} color={"white"} size={78} />
      </View>
      <View style={{flexDirection: "column"}}>
        <View style={stylesLists.labelsBox}>
          <ThemedText style={stylesLists.textName}>{temperature.name}</ThemedText>
          <View style={{flexDirection: "column"}}>
            <ThemedText style={stylesLists.textLevel}>{temperature.temp} °C</ThemedText>
            { temperature.humidity ? <ThemedText style={stylesLists.textLevel}>{temperature.humidity} %</ThemedText> : <></> }
          </View>
        </View>  
      </View>
    </View>
  );
};