import * as Services from '@/app/services/ClientHTTP.service';
import * as APIconstants from '@/app/constants/APIconstants';


/**
 * Charge les équipements Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param setLightsData - Fonction pour définir les données des lumières.
 */
export function loadEquipements(setIsLoaded: Function, setLightsData: Function) {


    // Appel du service externe de connexion à Domoticz
    Services.call(APIconstants.METHODE_HTTP.GET, APIconstants.SERVICES_URL.GET_DEVICES, [], '')
    .then(response => response != undefined ? response.json() : null) 
    .then(data => {
        setLightsData(data.filter((equipement: any) => equipement.Name.toLowerCase().includes("lumière")));

        setIsLoaded(true);

    })
    .catch((e) => {
        setIsLoaded(true);
        console.error('Une erreur s\'est produite lors du chargement des lumières', e);
    })
}
export default loadEquipements;