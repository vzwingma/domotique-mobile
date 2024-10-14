import callDomoticz from '@/app/services/ClientHTTP.service';
import { SERVICES_PARAMS, SERVICES_URL } from '@/app/enums/APIconstants';
import { evaluateGroupLevelConsistency, getDeviceType, sortEquipements, saveFavoritesToStorage, getFavoritesFromStorage } from '@/app/services/DataUtils.service';
import { DomoticzBlindsGroups, DomoticzBlindsSort, DomoticzDeviceStatus, DomoticzLightsGroups, DomoticzLightsSort, DomoticzSwitchType, DomoticzDeviceType, DomoticzThermostatLevelValue, DomoticzDeviceLevelValue } from '@/app/enums/DomoticzEnum';
import DomoticzDevice from '../models/domoticzDevice.model';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';
import DomoticzFavorites from '../models/domoticzFavorites.model';
import DomoticzThermostat from '../models/domoticzThermostat.model';
import { loadDomoticzThermostats } from './thermostats.controller';

/**
 * Charge les équipements Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param storeDevicesData - Fonction pour stocker les données des equipements volets/lumières dans l'état.
 * @param typeDevice - Type d'équipement à charger
 */

export function loadDomoticzDevices(storeDevicesData: (devices: DomoticzDevice[], thermosats: DomoticzThermostat[]) => void) {
    // Appel du service externe de connexion à Domoticz pour les types d'équipements
    callDomoticz(SERVICES_URL.GET_DEVICES)
        .then(data => {
            const dataDevices : DomoticzDevice[] = data.result
                .map((rawDevice: any, index: number) => {
                    let ddevice: DomoticzDevice;
                    ddevice = {
                        idx: Number(rawDevice.idx),
                        rang: index,
                        name: evaluateDeviceName(rawDevice.Name),
                        status: String(rawDevice.Status).replaceAll("Set Level: ", ""),
                        type: getDeviceType(rawDevice.Name),
                        subType: rawDevice.Type,
                        switchType: rawDevice.SwitchType,
                        level: evaluateDeviceLevel(rawDevice.Level),
                        consistantLevel: true,
                        isGroup: String(rawDevice.Name).indexOf("[Grp]") > -1,
                        lastUpdate: rawDevice.LastUpdate,
                        isActive: !rawDevice.HaveTimeout,
                        data: rawDevice.Data
                    }
                    return ddevice;
                });

            const lumieresDevices : DomoticzDevice[] = dataDevices    
                .filter((device: DomoticzDevice) => device.type === DomoticzDeviceType.LUMIERE)
                // Evaluation de la cohérence des niveaux des groupes
                .map((device: DomoticzDevice) => {evaluateGroupLevelConsistency(device, DomoticzLightsGroups, dataDevices); return device;})
                .sort((d1: DomoticzDevice, d2: DomoticzDevice) => sortEquipements(d1, d2, DomoticzLightsSort));

            const voletsDevices : DomoticzDevice[] = dataDevices
                .filter((device: DomoticzDevice) => device.type === DomoticzDeviceType.VOLET)
                // Evaluation de la cohérence des niveaux des groupes
                .map((device: DomoticzDevice) => {evaluateGroupLevelConsistency(device, DomoticzBlindsGroups, dataDevices); return device;})
                .sort((d1: DomoticzDevice, d2: DomoticzDevice) => sortEquipements(d1, d2, DomoticzBlindsSort));
            
            const thermostatsDevices = loadDomoticzThermostats(data);

            let allDevicesData: DomoticzDevice[] = [...lumieresDevices, ...voletsDevices];
            // Stockage des données
            storeDevicesData(allDevicesData, thermostatsDevices);
        })
        .catch((e) => {
            console.error('Une erreur s\'est produite lors du chargement des devices', e);
            storeDevicesData([], []);
            showToast("Erreur lors du chargement des devices", ToastDuration.SHORT);
        })
}


/**
 * Traitement du nom de l'équipement
 * @param deviceName nom de l'équipement
 * @returns nom de l'équipement pour l'affichage
 */
function evaluateDeviceName(deviceName: string) : string {
    return deviceName.replaceAll("[Grp]", "")
                     .replaceAll("Prise ", "")
                     .trim();
}

/**
 * Evaluation du niveau de l'équipement
 * @param device équipement
 * @returns le niveau de l'équipement
 */
function evaluateDeviceLevel(deviceLevel : any) : number{
    let level = Number(deviceLevel);
    if(deviceLevel >= DomoticzDeviceLevelValue.MAX - 1) level = DomoticzDeviceLevelValue.MAX;
    if(deviceLevel <= DomoticzDeviceLevelValue.MIN + 0.1) level = DomoticzDeviceLevelValue.MIN;
    return level;
}

/**
 * fonction pour gérer le clic sur l'icône de l'équipement
 * @param device composant DomoticzDevice
 * @param storeDeviceData setter pour les données des équipements
 */
export function onClickDeviceIcon(device: DomoticzDevice, storeDeviceData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
    if (device.isActive) {
      if (device.switchType === DomoticzSwitchType.ONOFF) {
        updateDeviceState(device.idx, device, device.status === DomoticzDeviceStatus.OFF, storeDeviceData);
      }
      else {
        updateDeviceLevel(device.idx, device, device.status === DomoticzDeviceStatus.OFF ? device.level : 0, storeDeviceData);
      }
    }
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
function updateDeviceState(idx: number, device: DomoticzDevice, status: boolean, setDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
    console.log("Mise à jour de l'équipement  " + device.name + " [" + idx + "]", status ? DomoticzDeviceStatus.ON : DomoticzDeviceStatus.OFF);

    let params = [
        { key: SERVICES_PARAMS.IDX, value: String(idx) },
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
    getFavoritesFromStorage()
    .then((favoris) => {
            const favoriteIndex = favoris.findIndex((fav: any) => fav.idx === device.idx);
            if (favoriteIndex !== -1) {
                if(favoris[favoriteIndex].nbOfUse === undefined) {
                    favoris[favoriteIndex].nbOfUse = 0;
                }
                favoris[favoriteIndex].nbOfUse += 1;
            } else {
                let newFavourites : DomoticzFavorites = {idx: device.idx, nbOfUse: 1, name: device.name, type: device.type, subType: device.subType, rang: 0};
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