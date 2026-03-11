import { DomoticzDeviceStatus, DomoticzDeviceType } from "@/app/enums/DomoticzEnum";
import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getGroupColor } from "@/app/enums/Colors";
import { DomoticzDeviceProps } from "@/app/components/device.component";
import { onClickDeviceIcon } from "@/app/controllers/devices.controller";
import { Alert, Image, ImageSourcePropType, Pressable } from "react-native";
import { Dispatch, SetStateAction, useContext } from "react";
import { DomoticzContext } from "@/app/services/DomoticzContextProvider";


/**
 * Icone d'un équipement Domoticz, suivant le type et le statut de l'équipement.
 *  >Icone du volet : https://oblador.github.io/react-native-vector-icons/ 
 */
type IconDomoticzDeviceInternalProps = DomoticzDeviceProps & {
  interactive?: boolean;
};

export const IconDomoticzDevice : React.FC<IconDomoticzDeviceInternalProps> = ({ device, interactive = true } : IconDomoticzDeviceInternalProps) => {
  const { setDomoticzDevicesData } = useContext(DomoticzContext)!;

  switch (device.type) {
    case DomoticzDeviceType.LUMIERE:
      return <MaterialCommunityIcons name={getLightIcon(device)}
                                 size={60}
                                 color={getGroupColor(device)}
                                 onPress={interactive ? () => performDevicePrimaryAction(device, setDomoticzDevicesData) : undefined}/>

    case DomoticzDeviceType.VOLET:
      if (!interactive) {
        return <Image source={getVoletIcon(device)}
                      style={{ width: 60, height: 60, tintColor: getGroupColor(device)}} />
      }
      return <Pressable onPress={() => performDevicePrimaryAction(device, setDomoticzDevicesData) }>
                <Image source={getVoletIcon(device)} 
                       style={{ width: 60, height: 60, tintColor: getGroupColor(device), cursor: 'pointer'}} />
              </Pressable>

    default:
      return <></>;
  }
}

export function performDevicePrimaryAction(
  device: DomoticzDevice,
  setDomoticzDevicesData: Dispatch<SetStateAction<DomoticzDevice[]>>,
): void {
  const action = () => onClickDeviceIcon(device, setDomoticzDevicesData);

  if (device.type === DomoticzDeviceType.LUMIERE) {
    handleLumierePress(device, action);
    return;
  }

  if (device.type === DomoticzDeviceType.VOLET) {
    handleVoletPress(device, action);
    return;
  }

  action();
}

/**
 * Gère le clic sur l'icône d'une lumière.
 * Affiche une confirmation modale pour les groupes.
 */
function handleLumierePress(device: DomoticzDevice, action: () => void): void {
  if (device.isGroup) {
    const verb = (device.status === DomoticzDeviceStatus.OFF || device.level === 0) ? 'allumer' : 'éteindre';
    Alert.alert(
      'Confirmation',
      `Voulez-vous ${verb} toutes les lumières du groupe ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: action },
      ]
    );
  } else {
    action();
  }
}

/**
 * Gère le clic sur l'icône d'un volet.
 * Affiche une confirmation modale pour les groupes (T10).
 */
function handleVoletPress(device: DomoticzDevice, action: () => void): void {
  if (device.isGroup) {
    const verb = device.level === 0 ? 'ouvrir' : 'fermer';
    Alert.alert(
      'Confirmation',
      `Voulez-vous ${verb} tous les volets du groupe ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: action },
      ]
    );
  } else {
    action();
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
  // Sinon c'est un volet simple
  else if(device.status === "Off" || device.level === 0){
      return require('@/assets/icons/window-shutter-closed.png');
    }
    else if(device.level === 100){
      return require('@/assets/icons/window-shutter-opened.png');
    }
    else{
      return require('@/assets/icons/window-shutter-mid-opened.png');
    }
}

export default IconDomoticzDevice;
