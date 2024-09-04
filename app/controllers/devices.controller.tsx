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
export function loadDomoticzDevices(setIsLoaded: Function, storeDevicesData: Function, typeDevice: DomoticzType) {

    // Appel du service externe de connexion à Domoticz
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
                        type: typeDevice,
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
                })
                .filter((device: DomoticzDevice) => filterDeviceByType(device, typeDevice))
                .sort((d1: DomoticzDevice, d2: DomoticzDevice) => sortDevices(d1, d2, typeDevice));
            // Evaluation de la cohérence des niveaux des groupes
            evaluateGroupsLevelConsistency(dataDevices);
            // Stockage des données
            storeDevicesData(dataDevices);
            setIsLoaded(true);
        })
        .catch((e) => {
            setIsLoaded(true);
            console.error('Une erreur s\'est produite lors du chargement des ' + typeDevice + 's', e);
            showToast("Erreur lors du chargement des " + typeDevice + 's', ToastDuration.SHORT);
        })
}



/**
 * Evaluation de la cohérence du niveau des groupes
 * @param devices liste des équipements
 */
function evaluateGroupsLevelConsistency(devices: DomoticzDevice[]) {
    devices
        .filter((device: DomoticzDevice) => device.isGroup)
        .forEach((device: DomoticzDevice) => {
            if (device.type === DomoticzType.BLIND) {
                evaluateGroupLevelConsistency(device, DomoticzBlindsGroups, devices);
            }
            else if (device.type === DomoticzType.LIGHT) {
                evaluateGroupLevelConsistency(device, DomoticzLightsGroups, devices);
            }
        });
}


/**
 * Evaluation de la cohérence du niveau des groupes
 * @param device équipement groupe
 * @param idsSubDevices liste des équipements du groupe
 * @param devices liste des équipements
 */
function evaluateGroupLevelConsistency(device: DomoticzDevice, idsSubDevices: Array<{ [key: number]: number[] }>, devices: DomoticzDevice[]) {
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
function filterDeviceByType(device: DomoticzDevice, typeDevice: DomoticzType): boolean {
    switch (typeDevice) {
        case DomoticzType.BLIND:
            return device.name.toLowerCase().includes("volet")
        case DomoticzType.LIGHT:
            return device.name.toLowerCase().includes("lumière")
                || device.name.toLowerCase().includes("veilleuse")
        default:
            return false;
    }
}

/**
 * Rafraichissement du niveau de l'équipement
 * @param idx idx de l'équipement
 * @param level niveau de l'équipement
 * @param setDeviceData fonction de mise à jour des données
 * @param typeDevice type d'équipement
 * 
 */
export function updateDeviceLevel(idx: number, level: number, storeDevicesData: Function, typeDevice: DomoticzType) {
    if (level <= 0.1) level = 0;
    if (level >= 99) level = 100;
    if (level === 0) {
        updateDeviceState(idx, false, storeDevicesData, typeDevice);
    }
    else {
        console.log("Mise à jour de " + typeDevice + " " + idx, level + "%");

        let params = [{ key: SERVICES_PARAMS.IDX, value: String(idx) },
        { key: SERVICES_PARAMS.LEVEL, value: String(level) }];

        callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_SET_LEVEL, params)
            .catch((e) => {
                console.error('Une erreur s\'est produite lors de la mise à jour de ' + typeDevice, e);
                showToast("Erreur lors de la commande de " + typeDevice, ToastDuration.LONG);
            })
            .finally(() => refreshEquipementState(storeDevicesData, typeDevice));
    }
}
/**
 * mise à jour du niveau de l'équipement
 * @param idx idx de l'équipement
 * @param status état de l'équipement
 * @param setDeviceData fonction de mise à jour des données
 * @param typeDevice type d'équipement
 * 
 */
export function updateDeviceState(idx: number, status: boolean, setDeviceData: Function, typeDevice: DomoticzType) {
    console.log("Mise à jour du " + typeDevice + " " + idx, status ? "ON" : "OFF");

    let params = [{ key: SERVICES_PARAMS.IDX, value: String(idx) },
    { key: SERVICES_PARAMS.CMD, value: status ? "On" : "Off" }];

    callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_ON_OFF, params)
        .catch((e) => {
            console.error('Une erreur s\'est produite lors de la mise à jour de ' + typeDevice, e);
            showToast("Erreur lors de la commande de " + typeDevice, ToastDuration.LONG);
        })
        .finally(() => refreshEquipementState(setDeviceData, typeDevice));
}

/**
 * Rafraichissement de l'état des équipements
 * @param setDeviceData fonction de mise à jour des données
 * @param typeEquipement type d'équipement
 */
function refreshEquipementState(setDeviceData: Function, typeEquipement: DomoticzType) {
    // Mise à jour des données
    loadDomoticzDevices(() => { }, setDeviceData, typeEquipement);
    setTimeout(() => loadDomoticzDevices(() => { }, setDeviceData, typeEquipement), 1000);
}




/**
 * Tri des volets pour l'affichage
 * @param device1 device 1
 * @param device2 device 2
 * @returns tri des équipements
 */
function sortDevices(device1: DomoticzDevice, device2: DomoticzDevice, typeEquipement: DomoticzType): number {
    switch (typeEquipement) {
        case DomoticzType.BLIND:
            return sortEquipements(device1, device2, DomoticzBlindsSort);
        case DomoticzType.LIGHT:
            return sortEquipements(device1, device2, DomoticzLightsSort);
        default:
            return 0;
    }
}
