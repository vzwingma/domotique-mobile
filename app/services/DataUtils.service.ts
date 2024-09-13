import DomoticzDevice from "../models/domoticzDevice.model";
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * 
 * @param device1 equipement 1
 * @param device2 equipement 2
 * @param devicesOrder ordre des équipements
 * @returns tri des équipements
 */
export function sortEquipements( device1: DomoticzDevice, device2: DomoticzDevice, devicesOrder: number[] ) {
    devicesOrder.forEach((idx, index) => {
        if ( device1.idx === idx ){
            device1.rang = index;
        }
        if ( device2.idx === idx ){
            device2.rang = index;
        }
    });
    return device1.rang - device2.rang;
  }
  

  export enum KEY_STORAGE {
    DOMOTICZ_CONFIG = "domoticzConfig",
    DOMOTICZ_ERROR = "domoticzError"
  };



// Authentifié ?
export const getValueFromStorage = (key : KEY_STORAGE) => {
    return AsyncStorage.getItem(key);
}

export const putValueInStorage = (key: KEY_STORAGE, value: string) => {
    AsyncStorage.setItem(key, value);
}

export const removeValueFromStorage = (key : KEY_STORAGE) => {
    AsyncStorage.removeItem(key);
}
