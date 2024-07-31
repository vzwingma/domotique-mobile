import callDomoticz from '@/app/services/ClientHTTP.service';
import {SERVICES_URL}  from '@/app/constants/APIconstants';


/**
 * connectToDomoticz
 */
export function connectToDomoticz(setIsLoading: Function, setResponseData: Function) {

    // Exemple d'utilisation de l'état isLoading et error
    setIsLoading(true);
    // Appel du service externe de connexion à Domoticz
    callDomoticz(SERVICES_URL.GET_CONFIG)
      .then(data => {
        setIsLoading(false);
        setResponseData(data); // Update the state with the response data
      })
      .catch((e) => {
          setIsLoading(false);
          console.error('Une erreur s\'est produite lors de la connexion à Domoticz', e);
          let dataError = { status: "ERROR", version: "0.0", Revision: "0" };
          setResponseData(dataError); // Update the state with the response data
      })
}

export default connectToDomoticz;