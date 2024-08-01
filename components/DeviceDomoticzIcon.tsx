import { getGroupColor } from "@/app/constants/Colors";
import { DomoticzType } from "@/app/constants/DomoticzEnum";
import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { MaterialCommunityIcons } from "@expo/vector-icons";


/**
 * Icone d'un équipement Domoticz, suivant le type et le statut de l'équipement.
 *  >Icone du volet : https://oblador.github.io/react-native-vector-icons/ 
 */
class DeviceDomoticzIcon extends MaterialCommunityIcons {

    constructor(props: any) {

        const modifiedProps = { ...props };
        const device: DomoticzDevice = modifiedProps.device;

        if(device.subType === DomoticzType.BLIND) {
            props.name = getBlindIcon(device);
        }
        else if(device.subType === DomoticzType.LIGHT) {
            props.name = getLightIcon(device);
        }
        props.size=78;
        props.color=getGroupColor(props.device);
        super(props);
    }
}

/**
 * Get the icon name of a light device
 * @param device équipement Domoticz
 * @returns nom de l'icone de l'équipement lumière
 */
function getLightIcon(device: DomoticzDevice) {

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
function getBlindIcon(device: DomoticzDevice) {

    let iconName: string = "window-shutter";
    iconName += device.status === "Off" ? "" : "-open";
    return iconName;
}

export default DeviceDomoticzIcon;