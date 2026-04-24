import { getDeviceType } from '@/app/services/DataUtils.service';
import { DomoticzDeviceType } from '@/app/enums/DomoticzEnum';

import { SERVICES_PARAMS, SERVICES_URL } from '../enums/APIconstants';
import callDomoticz from '../services/ClientHTTP.service';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';
import { handleError, generateTraceId } from '@/app/services/ErrorHandler.service';
import DomoticzParameter from '../models/domoticzParameter.model';
import { Alert } from 'react-native';
import { clearFavoritesFromStorage } from '../services/DataUtils.service';


/**
 * Loads Domoticz parameters from the API and processes thermostat devices
 * @param storeParameters Function to store the processed parameters
 */
export function loadDomoticzParameters(storeParameters: (parameters: DomoticzParameter[]) => void) {
    const traceId = generateTraceId();
    
    // Call external service to get devices from Domoticz
    callDomoticz(SERVICES_URL.GET_DEVICES)
        .then(data => {
            const parametersDevices : DomoticzParameter[] = data.result
                    .filter((rawDevice: any) => (getDeviceType(rawDevice.Name) === DomoticzDeviceType.PARAMETRE || getDeviceType(rawDevice.Name) === DomoticzDeviceType.PARAMETRE_RO))
                    .map((rawDevice: any) => {
                        let tdevice: DomoticzParameter = {
                            idx: Number(rawDevice.idx),
                            name: rawDevice.Name,
                            status: String(rawDevice.Data),
                            type: getDeviceType(rawDevice.Name),
                            lastUpdate: rawDevice.LastUpdate,
                            data: rawDevice.Data,
                            level: rawDevice.Level,
                            levelNames: rawDevice.LevelNames ? atob(rawDevice.LevelNames).split('|') : [],
                            switchType: rawDevice.SwitchType
                        }
                        return tdevice;
                    });
            storeParameters(parametersDevices);
        })
        .catch((e) => {
            handleError(e, 'loadDomoticzParameters', traceId, (msg) => showToast(msg, ToastDuration.SHORT));
            storeParameters([]);
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
    const traceId = generateTraceId();

    console.log("Mise à jour du paramètre "  + device.name + " [" + idx + "]", level.libelle );

    let params = [{ key: SERVICES_PARAMS.IDX, value: String(idx) },
    { key: SERVICES_PARAMS.LEVEL, value: String(level.id) }];

    callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_SET_LEVEL, params)
        .catch((e) => {
            handleError(e, 'updateParameterValue', traceId, (msg) => showToast(msg, ToastDuration.LONG));
        })
        .finally(() => {
            refreshEquipementState(setDomoticzParametersData)
        });
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

/**
 * Displays a confirmation dialog and clears stored favorites when confirmed
 */
export function handleResetFavorites(): void {
    Alert.alert(
        'Remise à zéro des favoris',
        'Voulez-vous supprimer la liste des favoris ? Cette action est irréversible.',
        [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Réinitialiser',
                style: 'destructive',
                onPress: () => { void clearFavoritesFromStorage(); },
            },
        ]
    );
}
