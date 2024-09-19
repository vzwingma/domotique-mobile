import { DomoticzType } from "@/app/enums/DomoticzEnum";
import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getGroupColor } from "@/app/enums/Colors";
import { DomoticzDeviceProps } from "@/app/components/device.component";
import { onClickDeviceIcon } from "@/app/controllers/devices.controller";
import { Image, ImageSourcePropType, Pressable, View } from "react-native";


/**
 * Icone d'un équipement Domoticz, suivant le type et le statut de l'équipement.
 *  >Icone du volet : https://oblador.github.io/react-native-vector-icons/ 
 */
export const IconDomoticzDevice : React.FC<DomoticzDeviceProps> = ({ device, storeDeviceData } : DomoticzDeviceProps) => {

  switch (device.type) {
    case DomoticzType.LUMIERE:
      return <MaterialCommunityIcons name={getLightIcon(device)}
                                 size={60}
                                 color={getGroupColor(device)}
                                 onPress={() => onClickDeviceIcon(device, storeDeviceData) }/>

    case DomoticzType.VOLET:
      return <Pressable onPress={() => onClickDeviceIcon(device, storeDeviceData) }>
                <Image source={getVoletIcon(device)} 
                       style={{ width: 60, height: 60, tintColor: getGroupColor(device), cursor: 'pointer'}} />
              </Pressable>

    default:
      return <></>;
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



/**
* Get the icon name of a light device
* @param device équipement Domoticz
* @returns nom de l'icone de l'équipement lumière
*/
export function getVoletIcon(device: DomoticzDevice) :ImageSourcePropType {

  if(device.isGroup){
    if(device.status === "Off" || device.level === 0){
      return require('@/assets/icons/window-shutter-group-closed.png');
    }
    else if(device.level === 100){
      return require('@/assets/icons/window-shutter-group-opened.png');
    }
    else{
      return require('@/assets/icons/window-shutter-group-mid-opened.png');
    }
  }
  else{
    if(device.status === "Off" || device.level === 0){
      return require('@/assets/icons/window-shutter-closed.png');
    }
    else if(device.level === 100){
      return require('@/assets/icons/window-shutter-opened.png');
    }
    else{
      return require('@/assets/icons/window-shutter-mid-opened.png');
    }
  }
}

export default IconDomoticzDevice;