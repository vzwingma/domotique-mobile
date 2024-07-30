import * as Services from '@/app/services/ClientHTTP.service';
import * as APIconstants from '@/app/constants/APIconstants';


/**
 * Charger les équipements Domoticz
 */
/**
 * Charge les équipements Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param setLightsData - Fonction pour définir les données des lumières.
 * @param setVoletsData - Fonction pour définir les données des volets.
 */
export function loadEquipements(setIsLoaded: Function, setVoletsData: Function) {


    // Appel du service externe de connexion à Domoticz
    Services.call(APIconstants.METHODE_HTTP.GET, APIconstants.SERVICES_URL.GET_DEVICES, [], '')
    .then(response => response != undefined ? response.json() : null) 
    .then(data => {
        setVoletsData(data.filter((equipement: any) => equipement.Name.toLowerCase().includes("volet")));

        setIsLoaded(true);
    })
    .catch((e) => {
        setIsLoaded(true);
        console.error('Une erreur s\'est produite lors du chargement des volets', e);
    })
}
export default loadEquipements;