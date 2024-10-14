import { getDeviceType } from '@/app/services/DataUtils.service';
import { DomoticzDeviceType, DomoticzThermostatLevelValue } from '@/app/enums/DomoticzEnum';

import DomoticzThermostat from '../models/domoticzThermostat.model';
import { SERVICES_PARAMS, SERVICES_URL } from '../enums/APIconstants';
import callDomoticz from '../services/ClientHTTP.service';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';

/**
 * Charge les équipements Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param storeDevicesData - Fonction pour stocker les données des equipements volets/lumières dans l'état.
 * @param typeDevice - Type d'équipement à charger
 */

export function loadDomoticzThermostats(storeThermostatsData: (thermostats: DomoticzThermostat[]) => void) {
    // Appel du service externe de connexion à Domoticz pour les types d'équipements
    callDomoticz(SERVICES_URL.GET_DEVICES)
        .then(data => {
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
                            data: rawDevice.Data,
                            unit: rawDevice.vunit
                        }
                        return tdevice;
                    });
            // Stockage des données
            storeThermostatsData(thermostatsDevices);
        })
        .catch((e) => {
            console.error('Une erreur s\'est produite lors du chargement des devices', e);
            storeThermostatsData([]);
            showToast("Erreur lors du chargement des devices", ToastDuration.SHORT);
        })
}

/**
 * Traitement du nom de l'équipement
 * @param deviceName nom de l'équipement
 * @returns nom de l'équipement pour l'affichage
 */
function evaluateDeviceName(deviceName: string): string {
    return deviceName.replaceAll("Tydom ", "")
        .trim();
}

/**
 * Evaluation du niveau de l'équipement
 * @param device équipement
 * @returns le niveau de l'équipement
 */
export function evaluateThermostatPoint(devicePoint: any): number {
    let level = Number(devicePoint);
    if (devicePoint >= DomoticzThermostatLevelValue.MAX) level = DomoticzThermostatLevelValue.MAX;
    if (devicePoint <= DomoticzThermostatLevelValue.MIN) level = DomoticzThermostatLevelValue.MIN;
    return level;
}



/**
 * Rafraichissement du niveau de l'équipement
 * @param idx idx de l'équipement
 * @param temp température de l'équipement
 * @param storeThermostatData fonction de mise à jour des données
 * 
 */
export function updateThermostatPoint(idx: number, device: DomoticzThermostat, temp: number, setDomoticzThermostatData: React.Dispatch<React.SetStateAction<DomoticzThermostat[]>>) {
    temp = evaluateThermostatPoint(temp);
    console.log("Mise à jour de l'équipement " + device.name + " [" + idx + "]", temp + device.unit);

    let params = [{ key: SERVICES_PARAMS.IDX, value: String(idx) },
    { key: SERVICES_PARAMS.TEMP, value: String(temp) }];

    callDomoticz(SERVICES_URL.CMD_THERMOSTAT_SET_POINT, params)
        .catch((e) => {
            console.error('Une erreur s\'est produite lors de la mise à jour du thermostat', e);
            showToast("Erreur lors de la commande du thermostat", ToastDuration.LONG);
        })
        .finally(() => {
            console.log("Mise à jour de l'équipement " + device.name + " [" + idx + "]", temp + device.unit);
            refreshEquipementState(setDomoticzThermostatData)
        });
}

/**
 * Rafraichissement de l'état des équipements
 * @param setDeviceData fonction de mise à jour des données
 * @param typeEquipement type d'équipement
 */
export function refreshEquipementState(setDomoticzThermostatData: React.Dispatch<React.SetStateAction<DomoticzThermostat[]>>) {
    // Mise à jour des données
    loadDomoticzThermostats(setDomoticzThermostatData);
    setTimeout(() => loadDomoticzThermostats(setDomoticzThermostatData), 1000);
}
