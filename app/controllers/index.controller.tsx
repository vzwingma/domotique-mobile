import callDomoticz from '@/app/services/ClientHTTP.service';
import * as APIconstants from '@/app/constants/APIconstants';


/**
 * connectToDomoticz
 */
export function connectToDomoticz(setIsLoading: Function, setResponseData: Function) {

    // Exemple d'utilisation de l'état isLoading et error
    setIsLoading(true);
    // Appel du service externe de connexion à Domoticz
    callDomoticz(APIconstants.SERVICES_URL.GET_CONFIG)
      .then(response => response != undefined ? response.json() : null) 
      .then(data => {
        console.log("Connecté à Domoticz", data);
        setIsLoading(false);
        setResponseData(data); // Update the state with the response data
      })
      .catch((e) => {
          setIsLoading(false);
          console.error('Une erreur s\'est produite lors de l\'authentification');
          let dataError = { status: "ERROR", version: "0.0", Revision: "0" };
          setResponseData(dataError); // Update the state with the response data
      })
}

export default connectToDomoticz;