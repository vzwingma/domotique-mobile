import callDomoticz from '@/app/services/ClientHTTP.service';
import { SERVICES_PARAMS, SERVICES_URL } from '@/app/constants/APIconstants';
import { sortEquipements } from '@/app/services/DataUtils.service';
import { DomoticzBlindSort, DomoticzLightSort, DomoticzType } from '@/app/constants/DomoticzEnum';
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
            storeDevicesData(data.result
                                .map((device: any) => {
                                    
                                    return {
                                        idx: device.idx,
                                        name: String(device.Name).replaceAll("[Grp]", "").replaceAll("Prise ", "").trim(),
                                        status: String(device.Status).replaceAll("Set Level: ", ""),
                                        type: typeDevice,
                                        subType: device.Type,
                                        switchType: device.SwitchType,
                                        level: device.Level,
                                        isGroup: String(device.Name).indexOf("[Grp]") > -1,
                                        lastUpdate: device.LastUpdate,
                                        isActive: !device.HaveTimeout,
                                        data: device.Data
                                    }})
                                .filter((device:DomoticzDevice) => filterDeviceByType(device, typeDevice))
                                .sort((d1:DomoticzDevice, d2:DomoticzDevice) => sortDevices(d1, d2, typeDevice)));
        setIsLoaded(true);
    })
    .catch((e) => {
        setIsLoaded(true);
        console.error('Une erreur s\'est produite lors du chargement des ' + typeDevice + 's', e);
        showToast("Erreur lors du chargement des " + typeDevice + 's', ToastDuration.SHORT);
    })
}


/**
 * Filtrage des équipements par type
 * @param device equipement à filtrer
 * @param typeDevice type d'équipement
 * @returns true si l'équipement est du type recherché
 */
function filterDeviceByType(device: DomoticzDevice, typeDevice: DomoticzType) : boolean {
    switch(typeDevice) {
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
    if(level < 0) level = 0;
    if(level > 100) level = 100;
    if(level === 0) {
        updateDeviceState(idx, false, storeDevicesData, typeDevice);
    }
    else{
        console.log("Mise à jour de " + typeDevice + " " + idx + " à " + level + "%");

        let params = [ { key: SERVICES_PARAMS.IDX,   value: String(idx) },
                       { key: SERVICES_PARAMS.LEVEL, value: String(level) } ];

        callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_SET_LEVEL, params)
            .then(() => console.log("Mise à jour de " + typeDevice + " " + idx + " à " + level + "%"))
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
    console.log("Mise à jour du " + typeDevice + " " + idx + " à ", status ? "ON" : "OFF");
    
    let params = [ { key: SERVICES_PARAMS.IDX,   value: String(idx) },
                   { key: SERVICES_PARAMS.CMD, value: status ? "Open" : "Close" } ];

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
    setTimeout(() => loadDomoticzDevices(() => {}, setDeviceData, typeEquipement), 0);
    setTimeout(() => loadDomoticzDevices(() => {}, setDeviceData, typeEquipement), 1000);
}




/**
 * Tri des volets pour l'affichage
 * @param device1 device 1
 * @param device2 device 2
 * @returns tri des équipements
 */
function sortDevices( device1: DomoticzDevice, device2: DomoticzDevice, typeEquipement: DomoticzType ) {
    switch(typeEquipement) {
        case DomoticzType.BLIND:
            return sortEquipements( device1, device2, DomoticzBlindSort);
        case DomoticzType.LIGHT:
            return sortEquipements( device1, device2, DomoticzLightSort);
        default:
            return 0;
    }
}
