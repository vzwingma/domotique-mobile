import { DomoticzBlindsSort, DomoticzDeviceStatus, DomoticzLightsSort, DomoticzDeviceType } from "../enums/DomoticzEnum";
import DomoticzDevice from "../models/domoticzDevice.model";
import AsyncStorage from '@react-native-async-storage/async-storage'
import DomoticzFavorites from "../models/domoticzFavorites.model";

/**
 * 
 * @param device1 equipement 1
 * @param device2 equipement 2
 * @param devicesOrder ordre des équipements
 * @returns tri des équipements
 */
export function sortEquipements(device1: DomoticzDevice, device2: DomoticzDevice, devicesOrder: number[]) {
    devicesOrder.forEach((idx, index) => {
        if (device1.idx === idx) {
            device1.rang = index;
        }
        if (device2.idx === idx) {
            device2.rang = index;
        }
    });
    return device1.rang - device2.rang;
}


/**
 * Trie les favoris en fonction de leur type et de critères spécifiques.
 *
 * @param {DomoticzFavorites} device1 - Le premier appareil à comparer.
 * @param {DomoticzFavorites} device2 - Le deuxième appareil à comparer.
 * @returns {number} - Retourne un nombre négatif si device1 doit être trié avant device2, 
 *                     un nombre positif si device1 doit être trié après device2, 
 *                     ou 0 si les deux appareils sont égaux.
 */
export function sortFavorites(device1: DomoticzDevice, device2: DomoticzDevice) {

    if (device1.type === device2.type) {
        return sortEquipements(device1, device2, device1.type === DomoticzDeviceType.LUMIERE ? DomoticzLightsSort : DomoticzBlindsSort);
    }
    else {
        return device1.type < device2.type ? 1 : -1
    }
}


/**
 * Filtrage des équipements par type
 * @param device equipement à filtrer
 * @param typeDevice type d'équipement
 * @returns true si l'équipement est du type recherché
 */
export function getDeviceType(deviceName: string): DomoticzDeviceType {
    if (deviceName.toLowerCase().includes("volet")) {
        return DomoticzDeviceType.VOLET;
    }
    else if (deviceName.toLowerCase().includes("lumière")
        || deviceName.toLowerCase().includes("prise")) {
        return DomoticzDeviceType.LUMIERE;
    }
    else if (deviceName.toLowerCase().includes("thermostat")) {
        return DomoticzDeviceType.THERMOSTAT;
    }
    else if (deviceName.toLowerCase().includes("mode")) {
        return DomoticzDeviceType.PARAMETRE;
    }
    else if (deviceName.toLowerCase().includes("présence") || deviceName.toLowerCase().includes("phase")) {
        return DomoticzDeviceType.PARAMETRE_RO;
    }    
    else {
        return DomoticzDeviceType.UNKNOWN;
    }
}


/**
 * Evaluation de la cohérence du niveau des groupes
 * @param device équipement groupe
 * @param idsSubDevices liste des équipements du groupe
 * @param devices liste des équipements
 */
export function evaluateGroupLevelConsistency(device: DomoticzDevice, idsSubDevices: { [key: number]: number[] }[], devices: DomoticzDevice[]) {
    // Calcul uniquement pour les groupes
    if (device.isGroup === false) return;

    // Recherche des équipements du groupe
    const idsSubDevicesOfGroup = idsSubDevices.find((subDevice: any) => subDevice[device.idx]);
    if (idsSubDevicesOfGroup !== undefined) {
        const arrayIdsSubdevicesOfGroup: number[] = idsSubDevicesOfGroup[device.idx];

        // On n'évalue que les équipements connectés (isActive=true) pour ne pas pénaliser
        // le statut du groupe à cause d'appareils déconnectés.
        // Si aucun équipement n'est actif, on évalue tous les équipements du groupe.
        const subDevicesInGroup = devices.filter((d: DomoticzDevice) => arrayIdsSubdevicesOfGroup.includes(d.idx));
        const activeSubDevices = subDevicesInGroup.filter((d: DomoticzDevice) => d.isActive);
        const subDevicesToEvaluate = activeSubDevices.length > 0 ? activeSubDevices : subDevicesInGroup;

        if (subDevicesToEvaluate.length === 0) return;

        // Mapping du niveau effectif :
        //   - OFF          → 0
        //   - ON dimmer    → level (ex: 50)
        //   - ON switch    → 100  (level=0 pour un switch ONOFF allumé, on le normalise à 100)
        const levelValues = subDevicesToEvaluate.map((d: DomoticzDevice) => d.status === DomoticzDeviceStatus.OFF ? 0 : (d.level > 0 ? d.level : 100));
        const uniqueLevels = levelValues.filter((value, index, arr) => arr.indexOf(value) === index);

        device.consistantLevel = uniqueLevels.length === 1;

        if (device.consistantLevel) {
            // Tous les équipements actifs au même niveau : on surcharge le niveau et statut du groupe
            device.level = uniqueLevels[0];
            device.status = uniqueLevels[0] === 0 ? DomoticzDeviceStatus.OFF : DomoticzDeviceStatus.ON;
        } else {
            // Niveaux hétérogènes parmi les équipements actifs
            device.level = Math.max(...levelValues);
            // Si tous les actifs sont allumés (niveaux différents) → "On", sinon "Mixed"
            const allActiveOn = levelValues.every(v => v > 0);
            device.status = allActiveOn ? DomoticzDeviceStatus.ON : 'Mixed';
        }
    }
}






export enum KEY_STORAGE {
    FAVORITES = "domoticzBoard"
};

/**
 * Gestion des favoris en mémoire
 * @returns les favoris stockés
 */
export const getFavoritesFromStorage = (): Promise<DomoticzFavorites[]> => {
    return getValueFromStorage(KEY_STORAGE.FAVORITES);
}

/**
 * Sauvegarde des favoris en mémoire
 * @param favorites les favoris à sauvegarder
 */
export const saveFavoritesToStorage = (favorites: DomoticzFavorites[]) => {
    putValueInStorage(KEY_STORAGE.FAVORITES, favorites);
}

/**
 * Remise à zéro de la liste des favoris
 */
export const clearFavoritesFromStorage = (): Promise<void> => {
    return AsyncStorage.removeItem(KEY_STORAGE.FAVORITES);
}



/**
 * Données stockées dans le storage
 **/
const getValueFromStorage = (key: KEY_STORAGE) => {
    return AsyncStorage.getItem(key).then((value) => {
        return JSON.parse(value || "[]");
    });
}

/**
 * Mise à jour des données dans le storage
 * @param key clé de stockage
 * @param value valeur à stocker
 */
const putValueInStorage = (key: KEY_STORAGE, value: DomoticzFavorites[]) => {
    AsyncStorage.setItem(key, JSON.stringify(value));
}

/**
 * Suppression d'une valeur du storage
 * @param key clé de stockage
 */
export const removeValueFromStorage = (key: KEY_STORAGE) => {
    AsyncStorage.removeItem(key);
}
