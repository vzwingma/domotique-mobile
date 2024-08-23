import { DomoticzSwitchType, DomoticzType } from "../constants/DomoticzEnum";


/**
 * Equipement Domoticz (Lumières, volets)
 */
class DomoticzDevice {
    // Index de l'équipement
    idx: number;
    // Rang de l'équipement (affichage)
    rang: number;
    // Nom de l'équipement
    name: string;
    // Groupe d'équipements ?
    isGroup: boolean = false;
    // Date de la dernière mise à jour
    lastUpdate: string;
    // Equipement actif ?
    isActive: boolean = false;
    // Niveau de l'équipement
    level: number;
    // Type de l'équipement
    type: DomoticzType;
    // Sous-type de l'équipement (Lumière, volet, ...)
    subType: string;
    // Type de switch de l'équipement
    switchType: DomoticzSwitchType;
    // Status de l'équipement
    status: string;
    // Données de l'équipement
    data: string;

    /**
     * Constructeur
     */
    constructor(idx: number, rang: number, name: string, lastUpdate: string, level: number, 
                type: DomoticzType, subType: string, switchType: DomoticzSwitchType, status: string, data: string, isGroup: boolean = false) {
        this.idx = idx;
        this.rang = rang;
        this.name = name;
        this.lastUpdate = lastUpdate;
        this.level = level;
        this.type = type;
        this.subType = subType;
        this.switchType = switchType;
        this.status = status;
        this.data = data;
        this.isGroup = isGroup;
    }
}
export default DomoticzDevice;

