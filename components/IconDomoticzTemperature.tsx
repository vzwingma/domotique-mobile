import { MaterialCommunityIcons } from "@expo/vector-icons";
import DomoticzTemperature from "@/app/models/domoticzTemperature.model";

/**
 * Composant qui affiche une icône en fonction du type de mesure température Domoticz.
 * @param temperature - Les informations de la mesure de température.
 * Icone d'une mesure de température Domoticz, suivant le type et le statut de l'équipement.
 *  >Icone du volet : https://oblador.github.io/react-native-vector-icons/ 
 */
class IconDomoticzTemperature extends MaterialCommunityIcons { }

/**
 * Get the icon name of a temperature device
 * @param temperature mesure de température Domoticz
 * @returns nom de l'icone de l'équipement 
 */
export function getTemperatureIcon(temperature: DomoticzTemperature) :any {

    if(temperature.idx === '101'){
        return "sun-thermometer-outline";
    }
    else if(temperature.idx === '45'){
        return "home-thermometer-outline";
    }
    else if(temperature.isActive){
        return "thermometer";
    }
    else{
        return "thermometer-off";  
    }
}
export default IconDomoticzTemperature;