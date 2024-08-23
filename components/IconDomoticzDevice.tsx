import { DomoticzType } from "@/app/constants/DomoticzEnum";
import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { MaterialCommunityIcons } from "@expo/vector-icons";


/**
 * Icone d'un équipement Domoticz, suivant le type et le statut de l'équipement.
 *  >Icone du volet : https://oblador.github.io/react-native-vector-icons/ 
 */
class IconDomoticzDevice extends MaterialCommunityIcons {}


/**
 * Get the icon name of a light device
 * @param device équipement Domoticz
 * @returns nom de l'icone de l'équipement lumière
 */
export function getDeviceIcon(device: DomoticzDevice) :any {
    switch(device.subType){
        case DomoticzType.LIGHT:
            return getLightIcon(device);
        case DomoticzType.BLIND:
            return getBlindIcon(device);
        default:
            return "help-circle-outline";
    }
}

/**
 * Get the icon name of a light device
 * @param device équipement Domoticz
 * @returns nom de l'icone de l'équipement lumière
 */
function getLightIcon(device: DomoticzDevice) :any {

    let iconName: string = "lightbulb";
    iconName += device.isGroup ? "-multiple" : "";
    iconName += device.status === "Off" ? "-off" : "";
    iconName += "-outline";
    return iconName;
}


/**
 * Génère le nom de l'icone d'un équipement volet
 * @param device équipement Domoticz
 * @returns nom de l'icone de l'équipement volet
 */
function getBlindIcon(device: DomoticzDevice) :any{

    let iconName: string = "window-shutter";
    iconName += device.status === "Off" ? "" : "-open";
    return iconName;
}

export default IconDomoticzDevice;