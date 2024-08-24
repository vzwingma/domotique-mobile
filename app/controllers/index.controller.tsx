import callDomoticz from '@/app/services/ClientHTTP.service';
import {SERVICES_URL}  from '@/app/constants/APIconstants';
import DomoticzConfig from '../models/domoticzConfig.model';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';


/**
 * connectToDomoticz
 */
export function connectToDomoticz(setIsLoading: Function, storeConfigData: Function, storeError: Function, storeISSData: Function) {

    // Exemple d'utilisation de l'état isLoading et error
    setIsLoading(true);
    // Appel du service externe de connexion à Domoticz
    callDomoticz(SERVICES_URL.GET_CONFIG)
      .then(data => {
        let config: DomoticzConfig;
        config = {
          status: data.status,
          version: data.version,
          revision: data.Revision
        };
        return config;
      })
      .then(config => {
        setIsLoading(false);
        storeConfigData(config); // Update the state with the response data
      })
      .catch((e) => {
          setIsLoading(false);
          storeError(e);
          console.error('Une erreur s\'est produite lors de la connexion à Domoticz', e);
          showToast("Erreur de connexion à Domoticz", ToastDuration.SHORT);
      });


      fetch('http://api.open-notify.org/iss-now.json')
      .then(response => response.json())
      .then(data => {
        console.log(data)
        storeISSData(data); })
      .catch(e => console.error('Erreur lors de la récupération des données de l\'ISS', e));



      
}

export default connectToDomoticz;