import callDomoticz from '@/app/services/ClientHTTP.service';
import { SERVICES_PARAMS, SERVICES_URL } from '@/app/enums/APIconstants';
import { evaluateGroupLevelConsistency, getDeviceType, sortEquipements, saveFavoritesToStorage, getFavoritesFromStorage } from '@/app/services/DataUtils.service';
import { DomoticzBlindsGroups, DomoticzBlindsSort, DomoticzDeviceStatus, DomoticzDeviceLabel, DomoticzLightsGroups, DomoticzLightsSort, DomoticzSwitchType, DomoticzDeviceType, DomoticzDeviceLevelValue } from '@/app/enums/DomoticzEnum';
import DomoticzDevice from '../models/domoticzDevice.model';
import { showToast, ToastDuration } from '@/hooks/AndroidToast';
import { handleError, generateTraceId } from '@/app/services/ErrorHandler.service';
import DomoticzFavorites from '../models/domoticzFavorites.model';
import DomoticzThermostat from '../models/domoticzThermostat.model';

/**
 * Charge les équipements Domoticz.
 * 
 * @param setIsLoaded - Fonction pour définir l'état de chargement.
 * @param storeDevicesData - Fonction pour stocker les données des equipements volets/lumières dans l'état.
 * @param typeDevice - Type d'équipement à charger
 */
export function loadDomoticzDevices(storeDevicesData: (devices: DomoticzDevice[]) => void) {
    const traceId = generateTraceId();
    
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
                        unit: "%",
                        consistantLevel: true,
                        isGroup: String(rawDevice.Name).includes("[Grp]"),
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

            let allDevicesData: DomoticzDevice[] = [...lumieresDevices, ...voletsDevices];
            // Stockage des données
            storeDevicesData(allDevicesData);
        })
        .catch((e) => {
            // Utiliser le pattern unifié de gestion d'erreur
            handleError(e, 'loadDomoticzDevices', traceId, (msg) => showToast(msg, ToastDuration.SHORT));
            storeDevicesData([]);
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
        // Si fermé/éteint → ouvrir à MAX ; sinon → fermer à 0
        const targetLevel = isDeviceOn(device) ? DomoticzDeviceLevelValue.MIN : DomoticzDeviceLevelValue.MAX;
        updateDeviceLevel(device.idx, device, targetLevel, storeDeviceData);
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
    const traceId = generateTraceId();
    
    level = evaluateDeviceLevel(level);
    if (level === 0) {
        updateDeviceState(idx, device, false, storeDevicesData);
    }
    else {
        console.log("Mise à jour de l'équipement "  + device.name + " [" + idx + "]", level + "%");

        let params = [{ key: SERVICES_PARAMS.IDX, value: String(idx) },
        { key: SERVICES_PARAMS.LEVEL, value: String(level) }];

        callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_SET_LEVEL, params)
            .catch((e) => {
                handleError(e, 'updateDeviceLevel', traceId, (msg) => showToast(msg, ToastDuration.LONG));
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
    const traceId = generateTraceId();
    
    console.log("Mise à jour de l'équipement  " + device.name + " [" + idx + "]", status ? DomoticzDeviceStatus.ON : DomoticzDeviceStatus.OFF);

    let params = [
        { key: SERVICES_PARAMS.IDX, value: String(idx) },
        { key: SERVICES_PARAMS.CMD, value: status ? DomoticzDeviceStatus.ON : DomoticzDeviceStatus.OFF }];

    callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_ON_OFF, params)
        .catch((e) => {
            handleError(e, 'updateDeviceState', traceId, (msg) => showToast(msg, ToastDuration.LONG));
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
export function refreshEquipementState(storeDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
    // Mise à jour des données
    loadDomoticzDevices(storeDevicesData);
    setTimeout(() => loadDomoticzDevices(storeDevicesData), 1000);
}



/**
 * Ajout d'une action pour l'équipement favori
 * @param idx idx de l'équipement
 */
export function addActionForFavorite(device: DomoticzDevice | DomoticzThermostat) {
    const traceId = generateTraceId();
    
    getFavoritesFromStorage()
    .then((favoris) => {
            const favoriteIndex = favoris.findIndex((fav: any) => fav.idx === device.idx);
            if (favoriteIndex === -1) {
                let newFavourites : DomoticzFavorites = {idx: device.idx, nbOfUse: 1, name: device.name, type: device.type, subType: ""};
                favoris.push(newFavourites);
            } else {
                favoris[favoriteIndex].nbOfUse ??= 0;
                favoris[favoriteIndex].nbOfUse += 1;
            }
            saveFavoritesToStorage(favoris);
        }
    )
    .catch((e) => {
        handleError(e, 'addActionForFavorite', traceId, (msg) => showToast(msg, ToastDuration.SHORT));
    })
}



/**
 * retourrne le niveau de l'équipement
 * @param device  équipement Domoticz
 * @returns niveau de l'équipement :
 */
export function getLevel(device: DomoticzDevice): number {
  return device.status === DomoticzDeviceStatus.OFF ? 0.1 : device.level
}

/**
 * Détermine si un équipement est actif (allumé ou ouvert).
 * Pour les switches On/Off, le niveau est toujours 0 : on se base uniquement sur le statut.
 * Pour les variateurs et volets, on vérifie que le niveau est supérieur à 0.
 * @param device équipement Domoticz
 * @returns true si l'équipement est allumé/ouvert
 */
export function isDeviceOn(device: DomoticzDevice): boolean {
  if (device.switchType === DomoticzSwitchType.ONOFF) {
    return device.status === DomoticzDeviceStatus.ON;
  }
  return device.status !== DomoticzDeviceStatus.OFF && device.level > 0.1;
}

/**
 * Surcharge de la valeur du slider pour la mettre à jour
 * @param value prochain niveau de l'équipement
 * @param setNextValue  fonction pour mettre à jour le prochain niveau de l'équipement
 */
export function overrideNextValue(value: number, setNextValue: React.Dispatch<React.SetStateAction<number>>) {
  if (value <= 0) {
    value = 0.1;
  }
  else if (value >= 99) {
    value = 100;
  }
  setNextValue(value);
}

/**
 * Retourne le label de l'édition en cours (slider déplacé)
 */
export function getEditingLabel(nextValue: number): string {
  let nextLabel = "(";
  if (nextValue <= 0.1) nextLabel += DomoticzDeviceStatus.OFF;
  else nextLabel += nextValue;
  nextLabel += ")";
  return nextLabel;
}

/**
 * Retourne le label pour un volet (T07)
 * Un volet est considéré ouvert quand son niveau atteint 99 ou plus.
 */
export function getBlindLabel(device: DomoticzDevice): string {
  device.unit = "";
  if (device.status === DomoticzDeviceStatus.OFF) return DomoticzDeviceLabel.BLIND_CLOSED;
  if (device.level >= 99) return DomoticzDeviceLabel.BLIND_OPEN;
  if (device.status === DomoticzDeviceStatus.ON) return DomoticzDeviceLabel.BLIND_OPEN;
  return device.status;
}

/**
 * Retourne le label pour un groupe de volets.
 * Si la liste des devices est fournie, la règle métier est basée sur les membres du groupe (via DomoticzBlindsGroups).
 * Sinon, fallback sur le comportement historique (consistantLevel + level).
 */
export function getBlindGroupLabel(device: DomoticzDevice): string {
  device.unit = "";

  if (device.status === DomoticzDeviceStatus.OFF || device.level <= 0.1) return DomoticzDeviceLabel.BLIND_CLOSED_GROUP;
  if (!device.consistantLevel) return device.status === DomoticzDeviceStatus.ON ? DomoticzDeviceLabel.BLIND_OPEN_GROUP : DomoticzDeviceLabel.MIXTE;
  if (device.level >= 99) return DomoticzDeviceLabel.BLIND_OPEN_GROUP;
  device.unit = "%";
  return device.level + "";
}

/**
 * Retourne le label pour un groupe de lumières (T04)
 */
export function getLightsGroupLabel(device: DomoticzDevice): string {
  device.unit = "";
  if (device.status === DomoticzDeviceStatus.OFF || device.level <= 0.1) return DomoticzDeviceLabel.LIGHT_OFF_GROUP;
  if (!device.consistantLevel) return device.status === DomoticzDeviceStatus.ON ? DomoticzDeviceLabel.LIGHT_ON_GROUP : DomoticzDeviceLabel.MIXTE;
  if (device.level >= 99) return DomoticzDeviceLabel.LIGHT_ON_GROUP;
  device.unit = "%";
  return device.level + "";
}

/**
 * Retourne le label pour une lumière individuelle (T05)
 * Un variateur est considéré allumé à plein quand son niveau atteint 99 ou plus.
 */
export function getSingleLightLabel(device: DomoticzDevice): string {
  if (device.switchType === DomoticzSwitchType.ONOFF) {
    device.unit = "";
    return device.status === DomoticzDeviceStatus.OFF ? DomoticzDeviceLabel.LIGHT_OFF : DomoticzDeviceLabel.LIGHT_ON;
  }
  // Variateur (SLIDER)
  if (device.status === DomoticzDeviceStatus.OFF) {
    device.unit = "";
    return DomoticzDeviceLabel.LIGHT_OFF;
  }
  if (!device.consistantLevel) {
    device.unit = "";
    return DomoticzDeviceLabel.MIXTE;
  }
  if (device.level >= 99) {
    device.unit = "";
    return DomoticzDeviceLabel.LIGHT_ON;
  }
  device.unit = "%";
  return device.level + "";
}

/**
 * Retourne le label par défaut
 */
export function getDefaultLabel(device: DomoticzDevice): string {
  if (device.switchType === DomoticzSwitchType.ONOFF) {
    device.unit = "";
    return device.status;
  }
  if (device.status === DomoticzDeviceStatus.OFF) {
    device.unit = "";
    return DomoticzDeviceStatus.OFF;
  }
  if (!device.consistantLevel) {
    device.unit = "";
    return DomoticzDeviceLabel.MIXTE;
  }
  device.unit = "%";
  return device.level + "";
}

/**
 * Fonction pour le label du statut de l'équipement. Si on est en mode édition, on affiche le prochain état entre parenthèses.
 */
export function getStatusLabel(device: DomoticzDevice, nextValue: number, flagLabel: boolean): string {
  // T06 — inactif
  if (!device.isActive) {
    return "Déconnecté";
  }

  // Édition en cours (slider déplacé)
  if (flagLabel) {
    return getEditingLabel(nextValue);
  }

  // T07 — volets
  if (device.type === DomoticzDeviceType.VOLET) {
    return device.isGroup ? getBlindGroupLabel(device) : getBlindLabel(device);
  }
  // T04 — groupes de lumières
  else if (device.type === DomoticzDeviceType.LUMIERE) {
    return device.isGroup ? getLightsGroupLabel(device) : getSingleLightLabel(device);    
  }

  // Comportement par défaut
  return getDefaultLabel(device);
}

