import callDomoticz from '@/app/services/ClientHTTP.service';
import * as APIconstants from '@/app/constants/APIconstants';
import { sortEquipements } from '@/app/services/DataUtils.service';
import DomoticzEquipement from '../models/domoticzEquipement.model';
import { DomoticzType } from '@/app/constants/DomoticzEnum';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';

/**
 * Charge les équipements Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param setLightsData - Fonction pour définir les données des lumières.
 */
export function loadDomoticzLights(setIsLoaded: Function, setLightsData: Function) {


    // Appel du service externe de connexion à Domoticz
    callDomoticz(APIconstants.SERVICES_URL.GET_DEVICES)
        .then(data => {
            setLightsData(data.result
                        .filter((equipement: any) => 
                            equipement.Name.toLowerCase().includes("lumière")
                         || equipement.Name.toLowerCase().includes("veilleuse"))
                        .map((equipement: any) => {
                            return {
                                idx: equipement.idx,
                                name: equipement.Name,
                                status: equipement.Status,
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
 * Tri des lumières pour l'affichage
 * @param light1 equipement 1
 * @param light2 equipement 2
 * @returns tri des équipements
 */
function sortLumieres( light1: DomoticzEquipement, light2: DomoticzEquipement ) {
    return sortEquipements( light1, light2, [122, 117, 113, 114, 118, 128, 131, 72] );
}
