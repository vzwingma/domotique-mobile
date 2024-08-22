import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { MaterialCommunityIcons } from "@expo/vector-icons";


/**
 * Icone d'un équipement Domoticz, suivant le type et le statut de l'équipement.
 *  >Icone du volet : https://oblador.github.io/react-native-vector-icons/ 
 */
class IconDomoticzBlind extends MaterialCommunityIcons {

    constructor(props: { device: DomoticzDevice, name: any, size: number, color: string, onPress: () => void }) {
        super(props);
    }
}

/**
 * Génère le nom de l'icone d'un équipement volet
 * @param device équipement Domoticz
 * @returns nom de l'icone de l'équipement volet
 */
export function getBlindIcon(device: DomoticzDevice) :any{

    let iconName: string = "window-shutter";
    iconName += device.status === "Off" ? "" : "-open";
    return iconName;
}

export default IconDomoticzBlind;