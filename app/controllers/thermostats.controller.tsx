import { getDeviceType } from '@/app/services/DataUtils.service';
import { DomoticzDeviceType, DomoticzThermostatLevelValue } from '@/app/enums/DomoticzEnum';

import DomoticzThermostat from '../models/domoticzThermostat.model';

/**
 * Charge les équipements Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param storeDevicesData - Fonction pour stocker les données des equipements volets/lumières dans l'état.
 * @param typeDevice - Type d'équipement à charger
 */

export function loadDomoticzThermostats(data: any) : DomoticzThermostat[]{

    const thermostatsDevices : DomoticzThermostat[] = data.result
                .filter((rawDevice: any) => getDeviceType(rawDevice.Name) === DomoticzDeviceType.THERMOSTAT)
                .map((rawDevice: any, index: number) => {
                    let tdevice: DomoticzThermostat;
                    tdevice = {
                        idx: Number(rawDevice.idx),
                        rang: index,
                        name: evaluateDeviceName(rawDevice.Name),
                        status: String(rawDevice.Data),
                        type: getDeviceType(rawDevice.Name),
                        temp: evaluateThermostatPoint(rawDevice.SetPoint),
                        lastUpdate: rawDevice.LastUpdate,
                        isActive: !rawDevice.HaveTimeout,
                        data: rawDevice.Data
                    }
                    return tdevice;
                });

    return thermostatsDevices;
}


/**
 * Traitement du nom de l'équipement
 * @param deviceName nom de l'équipement
 * @returns nom de l'équipement pour l'affichage
 */
function evaluateDeviceName(deviceName: string) : string {
    return deviceName.replaceAll("Tydom ", "")
                     .trim();
}

/**
 * Evaluation du niveau de l'équipement
 * @param device équipement
 * @returns le niveau de l'équipement
 */
export function evaluateThermostatPoint(devicePoint : any) : number{
    let level = Number(devicePoint);
    if(devicePoint >= DomoticzThermostatLevelValue.MAX) level = DomoticzThermostatLevelValue.MAX;
    if(devicePoint <= DomoticzThermostatLevelValue.MIN) level = DomoticzThermostatLevelValue.MIN;
    return level;
}
