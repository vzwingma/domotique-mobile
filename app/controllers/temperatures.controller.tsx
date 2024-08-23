import callDomoticz from '@/app/services/ClientHTTP.service';
import { SERVICES_PARAMS, SERVICES_URL } from '@/app/constants/APIconstants';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';
import DomoticzTemperature from '../models/domoticzTemperature.model';
/**
 * Charge les températures Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param storeTempsData - Fonction pour stocker les données des températures et thermostat dans l'état.
 */
export function loadDomoticzDevices(setIsLoaded: Function, storeTempsData: Function) {

    // Appel du service externe de connexion à Domoticz
    callDomoticz(SERVICES_URL.GET_TEMPS)
        .then(data => {
            storeTempsData(data.result
                              .map((device: any) => {
                                return {
                                    idx: device.idx,
                                    name: String(device.Name).replaceAll("TempératureHumidité - ", "")
                                                             .replaceAll("TempHumBaro", "Extérieur")
                                                             .replaceAll("Tydom Temperature", "Salon").trim(),
                                    type: device.Type,
                                    subType: device.SubType,
                                    temp: device.Temp,
                                    humidity: device.Humidity,
                                    humidityStatus: device.HumidityStatus,
                                    lastUpdate: device.LastUpdate,
                                    isActive: !device.HaveTimeout,
                                    data: device.Data
                                    }})
                              .filter((device:DomoticzTemperature) => filterTemperatureDeviceByType(device))
                              .sort((d1:DomoticzTemperature, d2:DomoticzTemperature) => sortTemperatureDevices(d1, d2))
                       );
        setIsLoaded(true);
    })
    .catch((e) => {
        setIsLoaded(true);
        console.error('Une erreur s\'est produite lors du chargement des températures', e);
        showToast("Erreur lors du chargement des températures", ToastDuration.SHORT);
    })
}



/**
 * Filtrage des mesures de température par type
 * @param temperature mesure de température à filtrer
 * @returns true si la mesure est du type recherché
 */
function filterTemperatureDeviceByType(temperature: DomoticzTemperature) : boolean {
    if(temperature.name == "Pi Temperature") {
        return false;
    }
    return true;
}


/**
 * 
 * @param temp1 mesure 1
 * @param temp2 mesure 2
 * @returns tri des équipements
 */
export function sortTemperatureDevices( temp1: DomoticzTemperature, temp2: DomoticzTemperature ) {
    if(temp1.name === "Extérieur" || temp2.name === "Extérieur") return 1;
    if(temp1.name.toLowerCase() < temp2.name.toLowerCase()) return -1;
    if(temp1.name.toLowerCase() > temp2.name.toLowerCase()) return 1;
    return 0;
  }