import callDomoticz from '@/app/services/ClientHTTP.service';
import { SERVICES_PARAMS, SERVICES_URL } from '@/app/constants/APIconstants';
import { sortEquipements } from '@/app/services/DataUtils.service';
import { DomoticzBlindsGroups, DomoticzBlindsSort, DomoticzLightsGroups, DomoticzLightsSort, DomoticzType } from '@/app/constants/DomoticzEnum';
import DomoticzDevice from '../models/domoticzDevice.model';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';

/**
 * Charge les équipements Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param storeDevicesData - Fonction pour stocker les données des equipements volets/lumières dans l'état.
 * @param typeDevice - Type d'équipement à charger
 */

export function loadDomoticzDevices(storeDevicesData: (devices: DomoticzDevice[]) => void) {
    // Appel du service externe de connexion à Domoticz pour les types d'équipements
    callDomoticz(SERVICES_URL.GET_DEVICES)
        .then(data => {
            let dataDevices = data.result
                .map((device: any, index: number) => {
                    let ddevice: DomoticzDevice;
                    ddevice = {
                        idx: Number(device.idx),
                        rang: index,
                        name: String(device.Name).replaceAll("[Grp]", "").replaceAll("Prise ", "").trim(),
                        status: String(device.Status).replaceAll("Set Level: ", ""),
                        type: getDeviceType(device.Name),
                        subType: device.Type,
                        switchType: device.SwitchType,
                        level: device.Level >= 99 ? 100 : device.Level <= 0.1 ? 0 : Number(device.Level),
                        consistantLevel: true,
                        isGroup: String(device.Name).indexOf("[Grp]") > -1,
                        lastUpdate: device.LastUpdate,
                        isActive: !device.HaveTimeout,
                        data: device.Data
                    }
                    return ddevice;
                });

            let lumieresDevices = dataDevices    
                .filter((device: DomoticzDevice) => device.type === DomoticzType.LUMIERE)
                // Evaluation de la cohérence des niveaux des groupes
                .map((device: DomoticzDevice) => {evaluateGroupLevelConsistency(device, DomoticzLightsGroups, dataDevices); return device;})
                .sort((d1: DomoticzDevice, d2: DomoticzDevice) => sortEquipements(d1, d2, DomoticzLightsSort));    

            let voletsDevices = dataDevices
                .filter((device: DomoticzDevice) => device.type === DomoticzType.VOLET)
                // Evaluation de la cohérence des niveaux des groupes
                .map((device: DomoticzDevice) => {evaluateGroupLevelConsistency(device, DomoticzBlindsGroups, dataDevices); return device;})
                .sort((d1: DomoticzDevice, d2: DomoticzDevice) => sortEquipements(d1, d2, DomoticzBlindsSort));    
            
            let allDevicesData: DomoticzDevice[] = [...lumieresDevices, ...voletsDevices];
            // Stockage des données
            storeDevicesData(allDevicesData);
        })
        .catch((e) => {
            console.error('Une erreur s\'est produite lors du chargement des devices', e);
            storeDevicesData([]);
            showToast("Erreur lors du chargement des devices", ToastDuration.SHORT);
        })
}



/**
 * Evaluation de la cohérence du niveau des groupes
 * @param device équipement groupe
 * @param idsSubDevices liste des équipements du groupe
 * @param devices liste des équipements
 */
function evaluateGroupLevelConsistency(device: DomoticzDevice, idsSubDevices: Array<{ [key: number]: number[] }>, devices: DomoticzDevice[]) {
    // Calcul uniquement pour les groupes
    if(device.isGroup === false) return;


    // Recherche des équipements du groupe
    let idsSubDevicesOfGroup = idsSubDevices.find((subDevice: any) => subDevice[device.idx]);
    if (idsSubDevicesOfGroup !== undefined) {
        let arrayIdsSubdevicesOfGroup: number[] = idsSubDevicesOfGroup[device.idx];
        // recherche des niveaux des équipements du groupe, filtrage des doublons  et comptage
        // Si =1 alors le groupe est cohérent
        device.consistantLevel = devices.filter((device: DomoticzDevice) => arrayIdsSubdevicesOfGroup.includes(device.idx))
            .map((device: DomoticzDevice) => device.status === 'Off' ? 0 : device.level)
            .filter((value, index, current_value) => current_value.indexOf(value) === index)
            .length === 1;
    }
}

/**
 * Filtrage des équipements par type
 * @param device equipement à filtrer
 * @param typeDevice type d'équipement
 * @returns true si l'équipement est du type recherché
 */
function getDeviceType(deviceName: String): DomoticzType {
    if(deviceName.toLowerCase().includes("volet")) {
        return DomoticzType.VOLET;
    }
    else if(deviceName.toLowerCase().includes("lumière")
                || deviceName.toLowerCase().includes("veilleuse")) {
        return DomoticzType.LUMIERE;
    }
    else{
        return DomoticzType.UNKNOWN;
    }
}

/**
 * Rafraichissement du niveau de l'équipement
 * @param idx idx de l'équipement
 * @param level niveau de l'équipement
 * @param setDeviceData fonction de mise à jour des données
 * 
 */
export function updateDeviceLevel(idx: number, level: number, storeDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
    if (level <= 0.1) level = 0;
    if (level >= 99) level = 100;
    if (level === 0) {
        updateDeviceState(idx, false, storeDevicesData);
    }
    else {
        console.log("Mise à jour de l'équipement " + idx, level + "%");

        let params = [{ key: SERVICES_PARAMS.IDX, value: String(idx) },
        { key: SERVICES_PARAMS.LEVEL, value: String(level) }];

        callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_SET_LEVEL, params)
            .catch((e) => {
                console.error('Une erreur s\'est produite lors de la mise à jour de l\'équipement', e);
                showToast("Erreur lors de la commande de l'équipement", ToastDuration.LONG);
            })
            .finally(() => refreshEquipementState(storeDevicesData));
    }
}
/**
 * mise à jour du niveau de l'équipement
 * @param idx idx de l'équipement
 * @param status état de l'équipement
 * @param setDevicesData fonction de mise à jour des données
 * 
 */
export function updateDeviceState(idx: number, status: boolean, setDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
    console.log("Mise à jour du device " + idx, status ? "ON" : "OFF");

    let params = [{ key: SERVICES_PARAMS.IDX, value: String(idx) },
    { key: SERVICES_PARAMS.CMD, value: status ? "On" : "Off" }];

    callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_ON_OFF, params)
        .catch((e) => {
            console.error('Une erreur s\'est produite lors de la mise à jour d \' équipement', e);
            showToast("Erreur lors de la commande de mise à jour d'équipement", ToastDuration.LONG);
        })
        .finally(() => refreshEquipementState(setDevicesData));
}

/**
 * Rafraichissement de l'état des équipements
 * @param setDeviceData fonction de mise à jour des données
 * @param typeEquipement type d'équipement
 */
function refreshEquipementState(storeDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
    // Mise à jour des données
    loadDomoticzDevices(storeDevicesData);
    setTimeout(() => loadDomoticzDevices(storeDevicesData), 1000);
}