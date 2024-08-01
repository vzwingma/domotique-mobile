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
 * @param setVoletsData - Fonction pour définir les données des volets.
 */
export function loadDomoticzBlinds(setIsLoaded: Function, setVoletsData: Function) {

    // Appel du service externe de connexion à Domoticz
    callDomoticz(SERVICES_URL.GET_DEVICES)
        .then(data => {
            setVoletsData(data.result
                              .filter((equipement: any) => equipement.Name.toLowerCase().includes("volet"))
                              .map((equipement: any) => {
                                return {
                                    idx: equipement.idx,
                                    name: String(equipement.Name).replaceAll("[Grp]", "").trim(),
                                    status: String(equipement.Status).replaceAll("Set Level: ", ""),
                                    type: equipement.Type,
                                    subType: DomoticzType.BLIND,
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
                                        console.log("Volet : " + equipement.name + " - " + equipement.status + " - " + equipement.level);
                                        return equipement;
                                    })
                            .sort(sortVolets));
        setIsLoaded(true);
    })
    .catch((e) => {
        setIsLoaded(true);
        console.error('Une erreur s\'est produite lors du chargement des volets', e);
        showToast("Erreur lors du chargement des volets", ToastDuration.SHORT);
    })
}

/**
 * mise à jour du niveau du volet
 * @param idx idx du volet
 * @param level niveau du volet
 */
export function updateBlindLevel(idx: number, level: number, setVoletsData: Function) {
    if(level < 0) level = 0;
    if(level > 100) level = 100;
    if(level == 0) {
        updateBlindStatus(idx, false, setVoletsData);
    }
    else{
        console.log("Mise à jour du volet " + idx + " à " + level + "%");

        let params = [ { key: SERVICES_PARAMS.IDX,   value: String(idx) },
                       { key: SERVICES_PARAMS.LEVEL, value: String(level) } ];

        callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_SET_LEVEL, params)
            .then(() => console.log("Mise à jour du volet " + idx + " à " + level + "%"))
            .catch((e) => {
                console.error('Une erreur s\'est produite lors de la mise à jour du volet', e);
                showToast("Erreur lors de la commande du volet", ToastDuration.LONG);
            })
            .finally(() => refreshBlinds(setVoletsData));
    }
}
/**
 * mise à jour du niveau du volet
 * @param idx idx du volet
 * @param level niveau du volet
 */
export function updateBlindStatus(idx: number, status: boolean, setVoletsData: Function) {
    console.log("Mise à jour du volet " + idx + " à ", status ? "ON" : "OFF");
    
    let params = [ { key: SERVICES_PARAMS.IDX,   value: String(idx) },
                   { key: SERVICES_PARAMS.CMD, value: status ? "Open" : "Close" } ];

    callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_ON_OFF, params)
                .then(() => console.log("Mise à jour du volet " + idx + " à " + status) )
                .catch((e) => {
                    console.error('Une erreur s\'est produite lors de la mise à jour du volet', e);
                    showToast("Erreur lors de la commande du volet", ToastDuration.LONG);
                })
                .finally(() => refreshBlinds(setVoletsData));
}

/**
 * Rafraichissement des volets
 * @param setVoletsData fonction de mise à jour des données
 */
function refreshBlinds(setVoletsData: Function) {
    // Mise à jour des données
    loadDomoticzBlinds(() => {}, setVoletsData)
    setTimeout(() => loadDomoticzBlinds(() => {}, setVoletsData), 1000);
}

/**
 * Tri des volets pour l'affichage
 * @param volet1 volet 1
 * @param volet2 volet 2
 * @returns tri des équipements
 */
function sortVolets( volet1: DomoticzEquipement, volet2: DomoticzEquipement ) {
    return sortEquipements( volet1, volet2, [85, 84, 55, 66, 86, 67, 68] );
}