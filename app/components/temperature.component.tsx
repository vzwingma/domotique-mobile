import IconDomoticzTemperature, { getTemperatureIcon } from "@/components/IconDomoticzTemperature";
import DomoticzTemperature from "../models/domoticzTemperature.model";
import { ThemedText } from "@/components/ThemedText";
import { View } from "react-native";
import { stylesListsDevices } from "./device.component";

// Définition des propriétés d'une température Domoticz
type DomoticzTempProps = {
  temperature: DomoticzTemperature;
};

/**
* Composant pour afficher une mesure de température Domoticz.
*/
export const ViewDomoticzTemperature: React.FC<DomoticzTempProps> = ({ temperature }) => {
  return (
    <View key={temperature.idx} style={temperature.isActive ? stylesListsDevices.viewBox : stylesListsDevices.viewBoxDisabled}>
      <View key={temperature.idx} style={stylesListsDevices.iconBox}>
        <IconDomoticzTemperature name={getTemperatureIcon(temperature)} color={(temperature.idx === '101' ? "#F8C969" : "white")} size={60} />
      </View>
      <View style={{ flexDirection: "column" }}>
        <View style={stylesListsDevices.labelsBox}>
          <ThemedText style={stylesListsDevices.textName}>{temperature.name}</ThemedText>
          <View style={{ flexDirection: "column" }}>
            <ThemedText style={stylesListsDevices.textLevel}>{temperature.temp} °C</ThemedText>
            {temperature.humidity ? <ThemedText style={stylesListsDevices.textLevel}>{temperature.humidity} %</ThemedText> : <></>}
          </View>
        </View>
      </View>
    </View>
  );
};