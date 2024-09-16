import callDomoticz from '@/app/services/ClientHTTP.service';
import { SERVICES_PARAMS, SERVICES_URL } from '@/app/enums/APIconstants';
import { evaluateGroupLevelConsistency, getDeviceType, getFavouritesFromStorage as loadFavoritesFromStorage, sortEquipements, saveFavoritesToStorage } from '@/app/services/DataUtils.service';
import { DomoticzBlindsGroups, DomoticzBlindsSort, DomoticzDeviceStatus, DomoticzLightsGroups, DomoticzLightsSort, DomoticzType } from '@/app/enums/DomoticzEnum';
import DomoticzDevice from '../models/domoticzDevice.model';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';
import DomoticzFavorites from '../models/domoticzFavourites';

/**
 * Charge les équipements Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param storeDevicesData - Fonction pour stocker les données des equipements volets/lumières dans l'état.
 * @param typeDevice - Type d'équipement à charger
 */

export function loadDomoticzDevices(storeDevicesData: (devices: DomoticzDevice[]) => void) {
    // Appel du service externe de connexion à Domoticz pour les types d'équipements
    callDomoticz(SERVICES_URL.GET_DEVICES)
        .then(data => {
            let dataDevices = data.result
                .map((device: any, index: number) => {
                    let ddevice: DomoticzDevice;
                    ddevice = {
                        idx: Number(device.idx),
                        rang: index,
                        name: String(device.Name).replaceAll("[Grp]", "").replaceAll("Prise ", "").trim(),
                        status: String(device.Status).replaceAll("Set Level: ", ""),
                        type: getDeviceType(device.Name),
                        subType: device.Type,
                        switchType: device.SwitchType,
                        level: evaluateDeviceLevel(device),
                        consistantLevel: true,
                        isGroup: String(device.Name).indexOf("[Grp]") > -1,
                        lastUpdate: device.LastUpdate,
                        isActive: !device.HaveTimeout,
                        data: device.Data
                    }
                    return ddevice;
                });

            let lumieresDevices = dataDevices    
                .filter((device: DomoticzDevice) => device.type === DomoticzType.LUMIERE)
                // Evaluation de la cohérence des niveaux des groupes
                .map((device: DomoticzDevice) => {evaluateGroupLevelConsistency(device, DomoticzLightsGroups, dataDevices); return device;})
                .sort((d1: DomoticzDevice, d2: DomoticzDevice) => sortEquipements(d1, d2, DomoticzLightsSort));    

            let voletsDevices = dataDevices
                .filter((device: DomoticzDevice) => device.type === DomoticzType.VOLET)
                // Evaluation de la cohérence des niveaux des groupes
                .map((device: DomoticzDevice) => {evaluateGroupLevelConsistency(device, DomoticzBlindsGroups, dataDevices); return device;})
                .sort((d1: DomoticzDevice, d2: DomoticzDevice) => sortEquipements(d1, d2, DomoticzBlindsSort));    
            
            let allDevicesData: DomoticzDevice[] = [...lumieresDevices, ...voletsDevices];
            // Stockage des données
            storeDevicesData(allDevicesData);
        })
        .catch((e) => {
            console.error('Une erreur s\'est produite lors du chargement des devices', e);
            storeDevicesData([]);
            showToast("Erreur lors du chargement des devices", ToastDuration.SHORT);
        })
}

/**
 * Evaluation du niveau de l'équipement
 * @param device équipement
 * @returns le niveau de l'équipement
 */
function evaluateDeviceLevel(device : DomoticzDevice){
    if(device.level >= 99) return 100;
    if(device.level <= 0.1) return 0;
    return Number(device.level);
}


/**
 * Rafraichissement du niveau de l'équipement
 * @param idx idx de l'équipement
 * @param name nom de l'équipement
 * @param level niveau de l'équipement
 * @param setDeviceData fonction de mise à jour des données
 * 
 */
export function updateDeviceLevel(idx: number, device : DomoticzDevice, level: number, storeDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
    if (level <= 0.1) level = 0;
    if (level >= 99) level = 100;
    if (level === 0) {
        updateDeviceState(idx, device, false, storeDevicesData);
    }
    else {
        console.log("Mise à jour de l'équipement "  + device.name + " [" + idx + "]", level + "%");

        let params = [{ key: SERVICES_PARAMS.IDX, value: String(idx) },
        { key: SERVICES_PARAMS.LEVEL, value: String(level) }];

        callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_SET_LEVEL, params)
            .catch((e) => {
                console.error('Une erreur s\'est produite lors de la mise à jour de l\'équipement', e);
                showToast("Erreur lors de la commande de l'équipement", ToastDuration.LONG);
            })
            .finally(() => {
                addActionForFavorite(device);
                refreshEquipementState(storeDevicesData)
            });
    }
}
/**
 * mise à jour du niveau de l'équipement
 * @param idx idx de l'équipement
 * @param name nom de l'équipement
 * @param status état de l'équipement
 * @param setDevicesData fonction de mise à jour des données
 * 
 */
export function updateDeviceState(idx: number, device: DomoticzDevice, status: boolean, setDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
    console.log("Mise à jour de l'équipement  " + device.name + " [" + idx + "]", status ? DomoticzDeviceStatus.ON : DomoticzDeviceStatus.OFF);

    let params = [{ key: SERVICES_PARAMS.IDX, value: String(idx) },
    { key: SERVICES_PARAMS.CMD, value: status ? DomoticzDeviceStatus.ON : DomoticzDeviceStatus.OFF }];

    callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_ON_OFF, params)
        .catch((e) => {
            console.error('Une erreur s\'est produite lors de la mise à jour d \' équipement', e);
            showToast("Erreur lors de la commande de mise à jour d'équipement", ToastDuration.LONG);
        })
        .finally(() => {
            addActionForFavorite(device);
            refreshEquipementState(setDevicesData)
        });
}

/**
 * Rafraichissement de l'état des équipements
 * @param setDeviceData fonction de mise à jour des données
 * @param typeEquipement type d'équipement
 */
function refreshEquipementState(storeDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
    // Mise à jour des données
    loadDomoticzDevices(storeDevicesData);
    setTimeout(() => loadDomoticzDevices(storeDevicesData), 1000);
}



/**
 * Ajout d'une action pour l'équipement favori
 * @param idx idx de l'équipement
 */
function addActionForFavorite(device: DomoticzDevice) {
    loadFavoritesFromStorage()
    .then((favoris) => {
            const favoriteIndex = favoris.findIndex((fav: any) => fav.idx === device.idx);
            if (favoriteIndex !== -1) {
                favoris[favoriteIndex].favorites += 1;
            } else {
                let newFavourites : DomoticzFavorites = {idx: device.idx, favorites: 1, name: device.name, type: device.type, subType: device.subType};
                favoris.push(newFavourites);
            }
            saveFavoritesToStorage(favoris);
        }
    )
    .catch((e) => {
        console.error('Une erreur s\'est produite lors de la mise à jour des favoris', e);
        showToast("Erreur lors de la mise à jour des favoris", ToastDuration.SHORT);
    })
}