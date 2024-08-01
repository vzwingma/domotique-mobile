import callDomoticz from '@/app/services/ClientHTTP.service';
import { SERVICES_PARAMS, SERVICES_URL } from '@/app/constants/APIconstants';
import { sortEquipements } from '@/app/services/DataUtils.service';
import { DomoticzType } from '@/app/constants/DomoticzEnum';
import DomoticzEquipement from '../models/domoticzDevice.model';
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
                              .filter((device:any) => filterDeviceByType(device, typeDevice))
                              .map((device: any) => {
                                return {
                                    idx: device.idx,
                                    name: String(device.Name).replaceAll("[Grp]", "").replaceAll("Prise ", "").trim(),
                                    status: String(device.Status).replaceAll("Set Level: ", ""),
                                    type: device.Type,
                                    subType: typeDevice,
                                    level: device.Level,
                                    isGroup: String(device.Name).indexOf("[Grp]") > -1,
                                    //Image: equipement.Image,
                                    //Favorite: equipement.Favorite,
                                    //PlanID: equipement.PlanID,
                                    //PlanName: equipement.PlanName,
                                    lastUpdate: device.LastUpdate,
                                    data: device.Data,
                                    //HardwareName: equipement.HardwareName,
                                    //HardwareType: equipement.HardwareType,
                                    //HardwareID: equipement.HardwareID,
                                    //HardwareTypeVal: equipement.HardwareTypeVal,
                                    //BatteryLevel: equipement.BatteryLevel,
                                    //SignalLevel: equipement.SignalLevel,
                                    //MaxDimLevel: equipement.MaxDimLevel,
                                    //Protected: equipement.Protected,
                                    //UsedByCamera: equipement.UsedByCamera,
                                    //TypeImg: equipement.TypeImg,
                                    //SubTypeImg: equipement.SubTypeImg,
                                    //SwitchType: equipement.SwitchType,
                                    //SwitchTypeVal: equipement.SwitchTypeVal,
                                    //Timers: equipement.Timers,
                                    //LevelInt: equipement.LevelInt,
                                    //LevelFloat: equipement.LevelFloat,
                                    //SelectorStyle: equipement.SelectorStyle
                                    }})
                            .sort((d1:DomoticzEquipement, d2:DomoticzEquipement) => sortDevices(d1, d2, typeDevice)));
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
function filterDeviceByType(device: any, typeDevice: DomoticzType) : boolean {
    switch(typeDevice) {
        case DomoticzType.BLIND:
            return device.Name.toLowerCase().includes("volet")
        case DomoticzType.LIGHT:
            return device.Name.toLowerCase().includes("lumière")
            || device.Name.toLowerCase().includes("veilleuse")
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
    if(level == 0) {
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
                .then(() => console.log("Mise à jour du " + typeDevice + " " + idx + " à " + status) )
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
    loadDomoticzDevices(() => {}, setDeviceData, typeEquipement)
    setTimeout(() => loadDomoticzDevices(() => {}, setDeviceData, typeEquipement), 1000);
}




/**
 * Tri des volets pour l'affichage
 * @param device1 device 1
 * @param device2 device 2
 * @returns tri des équipements
 */
function sortDevices( device1: DomoticzEquipement, device2: DomoticzEquipement, typeEquipement: DomoticzType ) {
    switch(typeEquipement) {
        case DomoticzType.BLIND:
            return sortEquipements( device1, device2, [85, 84, 55, 66, 86, 67, 68] );
        case DomoticzType.LIGHT:
            return sortEquipements( device1, device2, [122, 117, 113, 114, 118, 128, 131, 72] );
        default:
            return 0;
    }
    return ;
}
