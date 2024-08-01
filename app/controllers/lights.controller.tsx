import callDomoticz from '@/app/services/ClientHTTP.service';
import * as APIconstants from '@/app/constants/APIconstants';
import { sortEquipements } from '@/app/services/DataUtils.service';
import DomoticzEquipement from '../models/domoticzEquipement.model';
import { DomoticzType } from '@/app/constants/DomoticzEnum';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';
import { SERVICES_PARAMS, SERVICES_URL } from '@/app/constants/APIconstants';

/**
 * Charge les lumières de Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param setLightsData - Fonction pour définir les données des lumières.
 */
export function loadDomoticzLights(setIsLoaded: Function, setLightsData: Function) {


    // Appel du service externe de connexion à Domoticz pour récupérer les équipements
    callDomoticz(APIconstants.SERVICES_URL.GET_DEVICES)
        .then(data => {
            setLightsData(data.result
                        .filter((equipement: any) => 
                            equipement.Name.toLowerCase().includes("lumière")
                         || equipement.Name.toLowerCase().includes("veilleuse"))
                        .map((equipement: any) => {
                            return {
                                idx: equipement.idx,
                                name: String(equipement.Name).replaceAll("[Grp]", "").replaceAll("Prise ", "").trim(),
                                status: String(equipement.Status).replaceAll("Set Level: ", ""),
                                isGroup: String(equipement.Name).indexOf("[Grp]") > -1,
                                type: equipement.Type,
                                subType: DomoticzType.LIGHT,
                                level: equipement.Level,
                                lastUpdate: equipement.LastUpdate,
                                data: equipement.Data,
                            }})
                        .sort(sortLumieres));

        setIsLoaded(true);

    })
    .catch((e) => {
        setIsLoaded(true);
        console.error('Une erreur s\'est produite lors du chargement des lumières', e);
        showToast("Erreur lors du chargement des lumières", ToastDuration.SHORT);
    })
}


/**
 * mise à jour du niveau de la lumière
 * @param idx idx du lumière
 * @param level niveau du lumière
 */
export function updateLightLevel(idx: number, level: number) {
    if(level < 0) level = 0;
    if(level > 100) level = 100;
    if(level == 0) {
        updateLumiereStatus(idx, false);
    }
    else{
        console.log("Mise à jour de la lumière " + idx + " à " + level + "%");

        let params = [ { key: SERVICES_PARAMS.IDX,   value: String(idx) },
                       { key: SERVICES_PARAMS.LEVEL, value: String(level) } ];

        callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_SET_LEVEL, params)
            .then(() => console.log("Mise à jour du volet " + idx + " à " + level + "%"))
            .catch((e) => {
                console.error('Une erreur s\'est produite lors de la mise à jour du volet', e);
                showToast("Erreur lors de la commande du volet", ToastDuration.LONG);
            })
    }
}
/**
 * mise à jour du niveau de la lumière
 * @param idx idx de la lumière
 * @param level niveau de la lumière
 */
export function updateLumiereStatus(idx: number, status: boolean) {
    console.log("Mise à jour de la lumière " + idx + " à ", status ? "ON" : "OFF");
    
    let params = [ { key: SERVICES_PARAMS.IDX,   value: String(idx) },
                   { key: SERVICES_PARAMS.CMD, value: status ? "Open" : "Close" } ];

    callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_ON_OFF, params)
                .then(() => console.log("Mise à jour de la lumière " + idx + " à " + status) )
                .catch((e) => {
                    console.error('Une erreur s\'est produite lors de la mise à jour de la lumière', e);
                    showToast("Erreur lors de la commande des lumières", ToastDuration.LONG);
                })
}


/**
 * Tri des lumières pour l'affichage
 * @param light1 equipement 1
 * @param light2 equipement 2
 * @returns tri des équipements
 */
function sortLumieres( light1: DomoticzEquipement, light2: DomoticzEquipement ) {
    return sortEquipements( light1, light2, [122, 117, 113, 114, 118, 128, 131, 72] );
}
