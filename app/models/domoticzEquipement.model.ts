import { DomoticzType } from "../constants/DomoticzEnum";



/**
 * Equipement Domoticz (Lumières, volets)
 */
class DomoticzEquipement {
    // Index de l'équipement
    idx: number;
    // Rang de l'équipement (affichage)
    rang: number;
    // Nom de l'équipement
    name: string;
    // Date de la dernière mise à jour
    lastUpdate: string;
    // Niveau de l'équipement
    level: number;
    // Type de l'équipement
    type: string;
    // Sous-type de l'équipement (Lumière, volet, ...)
    subType: DomoticzType;
    // Status de l'équipement
    status: string;
    // Données de l'équipement
    data: string;

    /**
     * Constructeur
     */
    constructor(idx: number, rang: number, name: string, lastUpdate: string, level: number, type: string, subType: DomoticzType, status: string, data: string) {
        this.idx = idx;
        this.rang = rang;
        this.name = name;
        this.lastUpdate = lastUpdate;
        this.level = level;
        this.type = type;
        this.subType = subType;
        this.status = status;
        this.data = data;
    }
}
export default DomoticzEquipement;

