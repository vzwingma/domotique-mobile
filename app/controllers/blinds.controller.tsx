import * as Services from '@/app/services/ClientHTTP.service';
import * as APIconstants from '@/app/constants/APIconstants';
import { sortEquipements } from '@/app/services/DataUtils.service';

/**
 * Charge les équipements Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param setVoletsData - Fonction pour définir les données des volets.
 */
export function loadEquipements(setIsLoaded: Function, setVoletsData: Function) {


    // Appel du service externe de connexion à Domoticz
    Services.call(APIconstants.METHODE_HTTP.GET, APIconstants.SERVICES_URL.GET_DEVICES, [], '')
    .then(response => response != undefined ? response.json() : null) 
    .then(data => {
        setVoletsData(data.result
                            .filter((equipement: any) => equipement.Name.toLowerCase().includes("volet"))
                            .sort(sortVolets));
        setIsLoaded(true);
    })
    .catch((e) => {
        setIsLoaded(true);
        console.error('Une erreur s\'est produite lors du chargement des volets', e);
    })
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

export default loadEquipements;