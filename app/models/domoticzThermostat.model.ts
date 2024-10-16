import { DomoticzDeviceType } from "../enums/DomoticzEnum";


/**
 * Equipement Domoticz (Lumières, volets)
 */
class DomoticzThermostat {
    // Index de l'équipement
    readonly idx: number;
    // Rang de l'équipement (affichage)
    rang: number = 0;
    // Nom de l'équipement
    readonly name: string;
    // Date de la dernière mise à jour
    readonly lastUpdate: string;
    // Equipement actif ?
    readonly isActive: boolean = false;
    // Niveau de l'équipement
    temp: number;
    // Type de l'équipement
    readonly type: DomoticzDeviceType;
    // Status de l'équipement
    status: string;
    // Données de l'équipement
    readonly data: string;
    // Unité de l'équipement
    readonly unit: string;

    constructor(idx: number, name: string, lastUpdate: string, isActive: boolean, temp: number, type: DomoticzDeviceType, status: string, data: string, unit: string) {
        this.idx = idx;
        this.name = name;
        this.lastUpdate = lastUpdate;
        this.isActive = isActive;
        this.temp = temp;
        this.type = type;
        this.status = status;
        this.data = data;
        this.unit = unit;
    }
}
export default DomoticzThermostat;

