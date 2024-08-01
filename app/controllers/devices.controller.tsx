import callDomoticz from '@/app/services/ClientHTTP.service';
import { SERVICES_PARAMS, SERVICES_URL } from '@/app/constants/APIconstants';
import { sortEquipements } from '@/app/services/DataUtils.service';
import { DomoticzType } from '@/app/constants/DomoticzEnum';
import DomoticzEquipement from '../models/domoticzEquipement.model';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';
/**
 * Charge les équipements Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param storeEquipementData - Fonction pour stocker les données des equipements volets/lumières dans l'état.
 * @param typeEquipement - Type d'équipement à charger
 */
export function loadDomoticzEquipement(setIsLoaded: Function, storeEquipementData: Function, typeEquipement: DomoticzType) {

    // Appel du service externe de connexion à Domoticz
    callDomoticz(SERVICES_URL.GET_DEVICES)
        .then(data => {
            storeEquipementData(data.result
                              .filter((equipement:any) => filterEquipementByType(equipement, typeEquipement))
                              .map((equipement: any) => {
                                return {
                                    idx: equipement.idx,
                                    name: String(equipement.Name).replaceAll("[Grp]", "").replaceAll("Prise ", "").trim(),
                                    status: String(equipement.Status).replaceAll("Set Level: ", ""),
                                    type: equipement.Type,
                                    subType: typeEquipement,
                                    level: equipement.Level,
                                    isGroup: String(equipement.Name).indexOf("[Grp]") > -1,
                                    //Image: equipement.Image,
                                    //Favorite: equipement.Favorite,
                                    //PlanID: equipement.PlanID,
                                    //PlanName: equipement.PlanName,
                                    lastUpdate: equipement.LastUpdate,
                                    data: equipement.Data,
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
                                    .map((equipement: DomoticzEquipement) => {
                                        console.log(typeEquipement + " : " + equipement.name + " - " + equipement.status + " - " + equipement.level);
                                        return equipement;
                                    })
                            .sort((d1:DomoticzEquipement, d2:DomoticzEquipement) => sortDevices(d1, d2, typeEquipement)));
        setIsLoaded(true);
    })
    .catch((e) => {
        setIsLoaded(true);
        console.error('Une erreur s\'est produite lors du chargement des ' + typeEquipement + 's', e);
        showToast("Erreur lors du chargement des " + typeEquipement + 's', ToastDuration.SHORT);
    })
}


/**
 * Filtrage des équipements par type
 * @param equipement equipement à filtrer
 * @param typeEquipement type d'équipement
 * @returns true si l'équipement est du type recherché
 */
function filterEquipementByType(equipement: any, typeEquipement: DomoticzType) : boolean {
    switch(typeEquipement) {
        case DomoticzType.BLIND:
            return equipement.Name.toLowerCase().includes("volet")
        case DomoticzType.LIGHT:
            return equipement.Name.toLowerCase().includes("lumière")
            || equipement.Name.toLowerCase().includes("veilleuse")
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
    loadDomoticzEquipement(() => {}, setDeviceData, typeEquipement)
    setTimeout(() => loadDomoticzEquipement(() => {}, setDeviceData, typeEquipement), 1000);
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
