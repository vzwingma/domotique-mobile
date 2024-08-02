import { DomoticzType } from "@/app/constants/DomoticzEnum";
import LightDomoticzIcon, { getLightIcon } from "./LightDomoticzIcon";
import { getGroupColor } from "@/app/constants/Colors";
import { updateDeviceLevel } from "@/app/controllers/devices.controller";
import BlindDomoticzIcon, { getBlindIcon } from "./BlindDomoticzIcon";

/**
 * Composant qui affiche une icône en fonction du type de périphérique Domoticz.
 * 
 * @param device - Les informations du périphérique.
 * @param storeDeviceData - La fonction de mise à jour des données du périphérique.
 * @param props - Les autres propriétés du composant.
 * @returns Le composant d'icône correspondant au type de périphérique Domoticz.
 */
export function DeviceDomoticzIcon({ device, storeDeviceData }: any) {

    switch(device.subType){
        case DomoticzType.LIGHT:
            return <LightDomoticzIcon name={getLightIcon(device)}
                                      size={78}
                                      color={getGroupColor(device)} 
                                      onPress={() => device.isActive ? 
                                                        updateDeviceLevel(device.idx, device.status === "Off" ? device.level : 0, storeDeviceData, device.subType)
                                                        : {}}  />
        case DomoticzType.BLIND:
            return <BlindDomoticzIcon name={getBlindIcon(device)}
                                      size={78}
                                      color={getGroupColor(device)}
                                      onPress={() => device.isActive ? 
                                                        updateDeviceLevel(device.idx, device.status === "Off" ? device.level : 0, storeDeviceData, device.subType)
                                                        : {}}  />
    }
    return <>?</>
}