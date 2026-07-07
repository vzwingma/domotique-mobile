import { DomoticzBlindsSort, DomoticzDeviceStatus, DomoticzLightsSort, DomoticzDeviceType } from "../enums/DomoticzEnum";
import DomoticzDevice from "../models/domoticzDevice.model";

/**
 * Service Utilitaires pour la Gestion des Données Domoticz
 * 
 * Centralise les utilitaires généraux pour tri et filtrage :
 * - Tri des équipements
 * - Tri des favoris
 * - Détection du type d'appareil
 * - Évaluation de la cohérence des groupes
 * 
 * **Note:** La gestion des favoris a été déléguée à FavoritesManager.service.ts
 */

/**
 * Trie deux équipements selon leur ordre spécifié
 * Modifie les rangs des devices pour mise en correspondance avec l'ordre
 * 
 * @param device1 Équipement 1
 * @param device2 Équipement 2
 * @param devicesOrder Tableau d'idx définissant l'ordre
 * @returns Nombre pour comparaison (pour Array.sort)
 */
/**
 * Normalise une chaîne Domoticz (accents retirés, majuscules) pour comparaison robuste.
 */
export function normalizeDomoticzText(s: string): string {
    return s.normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '').toUpperCase();
}

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
 * @param device1 Le premier appareil à comparer.
 * @param device2 Le deuxième appareil à comparer.
 * @returns Nombre pour comparaison (négatif/0/positif pour tri)
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
 * Détecte le type d'équipement basé sur son nom
 * Utilise des heuristiques (mots-clés dans le nom) pour classifier
 * 
 * @param deviceName Nom de l'équipement
 * @returns Type d'équipement détecté
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
 * Évalue la cohérence du niveau pour les groupes d'équipements
 * Utile pour mettre à jour le statut et le niveau d'un groupe en fonction de ses sub-devices
 * 
 * @param device Équipement groupe
 * @param idsSubDevices Mapping des IDs sub-devices par groupe
 * @param devices Liste complète des équipements
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
