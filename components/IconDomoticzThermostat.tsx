import { MaterialCommunityIcons } from "@expo/vector-icons";
import DomoticzTemperature from "@/app/models/domoticzTemperature.model";

/**
 * Composant qui affiche une icône en fonction du type de mesure température Domoticz.
 * @param temperature - Les informations de la mesure de température.
 * Icone d'une mesure de température Domoticz, suivant le type et le statut de l'équipement.
 *  >Icone du volet : https://oblador.github.io/react-native-vector-icons/ 
 */
class IconDomoticzThermostat extends MaterialCommunityIcons { }

/**
 * Get the icon name of a temperature device
 * @param temperature mesure de température Domoticz
 * @returns nom de l'icone de l'équipement 
 */
export function getTemperatureIcon(temperature: DomoticzTemperature) :any {

    if(!temperature.isActive){
        return "thermometer-off";  
    }
    else{
        return "fuel";
    }
}
export default IconDomoticzThermostat;