import { Colors, PROFILE, PROFILES_ENV } from "@/app/enums/Colors";
import { DomoticzType } from "@/app/enums/DomoticzEnum";
import { Tabs } from "@/app/enums/TabsEnums";
import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet } from "react-native";


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
    switch(device.type){
        case DomoticzType.LUMIERE:
            return getLightIcon(device);
        case DomoticzType.VOLET:
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



/**
 * Affiche l'image du logo de l'application suivant l'onglet sélectionné
 */
export function showLogoImage(tab: Tabs) {
    switch (tab) {
      case Tabs.INDEX:
        return <Image source={PROFILE === PROFILES_ENV.C ? require('@/assets/images/c/partial-dlogo.png') : require('@/assets/images/v/partial-dlogo.png')} style={tabStyles.domoticzLogo} />
      case Tabs.LUMIERES:
        return <Ionicons size={100} name="bulb" style={tabStyles.headerImage} />
      case Tabs.VOLETS:
        return <Ionicons size={100} name="reorder-four" style={tabStyles.headerImage} />
      case Tabs.TEMPERATURES:
        return <Ionicons size={100} name="thermometer-sharp" style={tabStyles.headerImage} />
      default:
        return <></>;
    }
  }

  
export const tabStyles = StyleSheet.create({
    headerImage: {
      color: '#808080',
      position: 'absolute',
      bottom: -10,
      backgroundColor: Colors.dark.titlebackground,
    },
    domoticzLogo: {
      width: 100,
      height: 100,
      position: 'absolute',
      backgroundColor: Colors.dark.titlebackground,
    },
  });
  
export default IconDomoticzDevice;