import { DomoticzType } from "@/app/constants/DomoticzEnum";
import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { MaterialCommunityIcons } from "@expo/vector-icons";


/**
 * Icone d'un équipement Domoticz, suivant le type et le statut de l'équipement.
 *  >Icone du volet : https://oblador.github.io/react-native-vector-icons/ 
 */
class LightDomoticzIcon extends MaterialCommunityIcons {

    constructor(props: { device: DomoticzDevice, name: any, size: number, color: string, onPress: () => void }) {
        super(props);
    }
}

/**
 * Get the icon name of a light device
 * @param device équipement Domoticz
 * @returns nom de l'icone de l'équipement lumière
 */
export function getLightIcon(device: DomoticzDevice) :any {

    let iconName: string = "lightbulb";
    iconName += device.isGroup ? "-multiple" : "";
    iconName += device.status === "Off" ? "-off" : "";
    iconName += "-outline";
    return iconName;
}
export default LightDomoticzIcon;