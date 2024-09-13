import callDomoticz from '@/app/services/ClientHTTP.service';
import {SERVICES_URL}  from '@/app/constants/APIconstants';
import DomoticzConfig from '../models/domoticzConfig.model';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';


/**
 * connectToDomoticz
 */
export function connectToDomoticz(setIsLoading: Function, storeConfigData: Function, storeError: Function) {

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
        storeConfigData(config);
      })
      .catch((e) => {
          setIsLoading(false);
          storeError(e);
          console.error('Une erreur s\'est produite lors de la connexion à Domoticz', e);
          showToast("Erreur de connexion à Domoticz", ToastDuration.SHORT);
      });
}

export default connectToDomoticz;