import callDomoticz from '@/app/services/ClientHTTP.service';
import {SERVICES_URL}  from '@/app/enums/APIconstants';
import DomoticzConfig from '../models/domoticzConfig.model';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';
import DomoticzDevice from '../models/domoticzDevice.model';


// Propriétés de l'écran des équipements
type FunctionConnectToDomoticzProps = {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  storeConnexionData: Function
  setError: React.Dispatch<React.SetStateAction<Error | null>>
}


/**
 * Connecte l'application à Domoticz.
 * @param setIsLoading - Fonction pour définir l'état de chargement.
 * @param storeConfigData - Fonction pour stocker les données de configuration dans l'état.
 * @param storeError - Fonction pour stocker les erreurs dans l'état.
 */
export function connectToDomoticz({setIsLoading, storeConnexionData, setError}: FunctionConnectToDomoticzProps) {

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
        storeConnexionData(config);
      })
      .catch((e) => {
          setIsLoading(false);
          setError(e);
          console.error('Une erreur s\'est produite lors de la connexion à Domoticz', e);
          showToast("Erreur de connexion à Domoticz", ToastDuration.SHORT);
      });
}

export default connectToDomoticz;