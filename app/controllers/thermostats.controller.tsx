import { getDeviceType } from '@/app/services/DataUtils.service';
import { DomoticzDeviceType, DomoticzThermostatLevelValue } from '@/app/enums/DomoticzEnum';

import DomoticzThermostat from '../models/domoticzThermostat.model';
import { SERVICES_PARAMS, SERVICES_URL } from '../enums/APIconstants';
import callDomoticz from '../services/ClientHTTP.service';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';
import { handleError, generateTraceId } from '@/app/services/ErrorHandler.service';
import { Logger } from '@/app/services/Logger.service';

type RefreshOptions = {
    scheduleSecondRefresh?: boolean;
    secondRefreshDelayMs?: number;
}

/**
 * Charge les équipements Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param storeDevicesData - Fonction pour stocker les données des equipements volets/lumières dans l'état.
 * @param typeDevice - Type d'équipement à charger
 */

export function loadDomoticzThermostats(storeThermostatsData: (thermostats: DomoticzThermostat[]) => void) {
    const traceId = generateTraceId();
    
    // Appel du service externe de connexion à Domoticz pour les types d'équipements
    callDomoticz(SERVICES_URL.GET_DEVICES)
        .then(data => {
            storeThermostatsData(mapRawDevicesToDomoticzThermostats(data?.result));
        })
        .catch((e) => {
            handleError(e, 'loadDomoticzThermostats', traceId, (msg) => showToast(msg, ToastDuration.SHORT));
            storeThermostatsData([]);
        })
}

export function mapRawDevicesToDomoticzThermostats(rawDevices: any[] = []): DomoticzThermostat[] {
    return rawDevices
        .filter((rawDevice: any) => getDeviceType(rawDevice.Name) === DomoticzDeviceType.THERMOSTAT)
        .map((rawDevice: any, index: number) => {
            const tdevice = new DomoticzThermostat(
                Number(rawDevice.idx),
                evaluateDeviceName(rawDevice.Name),
                rawDevice.LastUpdate,
                !rawDevice.HaveTimeout,
                evaluateThermostatPoint(rawDevice.SetPoint),
                getDeviceType(rawDevice.Name),
                String(rawDevice.Data),
                rawDevice.Data,
                rawDevice.vunit
            );
            tdevice.rang = index;
            return tdevice;
        });
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
    const traceId = generateTraceId();
    
    temp = evaluateThermostatPoint(temp);
    Logger.debug("Mise à jour de l'équipement " + device.name + " [" + idx + "]", temp + device.unit);

    let params = [{ key: SERVICES_PARAMS.IDX, value: String(idx) },
    { key: SERVICES_PARAMS.TEMP, value: String(temp) }];

    callDomoticz(SERVICES_URL.CMD_THERMOSTAT_SET_POINT, params)
        .catch((e) => {
            handleError(e, 'updateThermostatPoint', traceId, (msg) => showToast(msg, ToastDuration.LONG));
        })
        .finally(() => {
            Logger.debug("Mise à jour de l'équipement " + device.name + " [" + idx + "]", temp + device.unit);
            refreshEquipementState(setDomoticzThermostatData, { scheduleSecondRefresh: true, secondRefreshDelayMs: 1000 })
        });
}

/**
 * Rafraichissement de l'état des équipements
 * @param setDeviceData fonction de mise à jour des données
 * @param typeEquipement type d'équipement
 */
export function refreshEquipementState(
    setDomoticzThermostatData: React.Dispatch<React.SetStateAction<DomoticzThermostat[]>>,
    options: RefreshOptions = {}
) {
    // Mise à jour des données
    loadDomoticzThermostats(setDomoticzThermostatData);
    if (options.scheduleSecondRefresh === true) {
        const secondRefreshDelayMs = options.secondRefreshDelayMs ?? 1000;
        setTimeout(() => loadDomoticzThermostats(setDomoticzThermostatData), secondRefreshDelayMs);
    }
}
