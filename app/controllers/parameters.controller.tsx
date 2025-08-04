import { getDeviceType } from '@/app/services/DataUtils.service';
import { DomoticzDeviceType } from '@/app/enums/DomoticzEnum';

import { SERVICES_PARAMS, SERVICES_URL } from '../enums/APIconstants';
import callDomoticz from '../services/ClientHTTP.service';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';
import DomoticzParameter from '../models/domoticzParameter.model';
import { Buffer } from 'buffer';


/**
 * Loads Domoticz parameters from the API and processes thermostat devices
 * @param storeParameters Function to store the processed parameters
 */
export function loadDomoticzParameters(storeParameters: (parameters: DomoticzParameter[]) => void) {
    // Call external service to get devices from Domoticz
    callDomoticz(SERVICES_URL.GET_DEVICES)
        .then(data => {
            const parametersDevices : DomoticzParameter[] = data.result
                    .filter((rawDevice: any) => getDeviceType(rawDevice.Name) === DomoticzDeviceType.PARAMETRE)
                    .map((rawDevice: any, index: number) => {
                        let tdevice: DomoticzParameter;
                        tdevice = {
                            idx: Number(rawDevice.idx),
                            rang: index,
                            name: rawDevice.Name,
                            status: String(rawDevice.Data),
                            type: getDeviceType(rawDevice.Name),
                            lastUpdate: rawDevice.LastUpdate,
                            isActive: !rawDevice.HaveTimeout,
                            data: rawDevice.Data,
                            level: rawDevice.Level,
                            levelNames: rawDevice.LevelNames ? Buffer.from(rawDevice.LevelNames, 'base64').toString('utf-8').split('|') : [],
                            switchType: rawDevice.SwitchType
                        }
                        return tdevice;
                    });
            // Store the processed thermostat data
            storeParameters(parametersDevices);
        })
        .catch((e) => {
            console.error('Une erreur est survenue pendant les chargements des paramètres', e);
            storeParameters([]);
            showToast("Error loading devices", ToastDuration.SHORT);
        })
}

/**
 * Updates the thermostat set point and refreshes the device state
 * @param idx Device index
 * @param device Device object
 * @param temp New temperature value
 * @param setDomoticzThermostatData Function to update thermostat data state
 */
export function updateParameterValue(idx: number, device: DomoticzParameter, level: any, setDomoticzParametersData: React.Dispatch<React.SetStateAction<DomoticzParameter[]>>) {

        console.log("Mise à jour du paramètre "  + device.name + " [" + idx + "]", level.libelle );

        let params = [{ key: SERVICES_PARAMS.IDX, value: String(idx) },
        { key: SERVICES_PARAMS.LEVEL, value: String(level.id) }];
/*
        callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_SET_LEVEL, params)
            .catch((e) => {
                console.error('Une erreur s\'est produite lors de la mise à jour du paramètre', e);
                showToast("Erreur lors de la commande de l'équipement", ToastDuration.LONG);
            })
            .finally(() => {
                refreshEquipementState(setDomoticzParametersData)
            });  */
}

/**
 * Refreshes the state of thermostat devices
 * @param setDomoticzParametersData Function to update thermostat data state
 */
export function refreshEquipementState(setDomoticzParametersData: React.Dispatch<React.SetStateAction<DomoticzParameter[]>>) {
    // Update data immediately and again after 1 second delay
    loadDomoticzParameters(setDomoticzParametersData);
    setTimeout(() => loadDomoticzParameters(setDomoticzParametersData), 1000);
}
