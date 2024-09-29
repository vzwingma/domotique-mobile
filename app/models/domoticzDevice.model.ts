import { DomoticzSwitchType, DomoticzType } from "../enums/DomoticzEnum";


/**
 * Equipement Domoticz (Lumières, volets)
 */
class DomoticzDevice {
    // Index de l'équipement
    readonly idx: number;
    // Rang de l'équipement (affichage)
    rang: number = 0;
    // Nom de l'équipement
    readonly name: string;
    // Groupe d'équipements ?
    readonly isGroup: boolean = false;
    // Date de la dernière mise à jour
    readonly lastUpdate: string;
    // Equipement actif ?
    readonly isActive: boolean = false;
    // Niveau de l'équipement
    level: number;
    // Niveau de cohérence du niveau de l'équipement (pour les groupes). True par défaut pour les équipements
    consistantLevel: boolean = true;
    // Type de l'équipement
    readonly type: DomoticzType;
    // Sous-type de l'équipement (Lumière, volet, ...)
    readonly subType: string;
    // Type de switch de l'équipement
    readonly switchType: DomoticzSwitchType;
    // Status de l'équipement
    status: string;
    // Données de l'équipement
    readonly data: string;


    /**
     * Constructeur de la classe DomoticzDevice.
     * 
     * @param idx - L'identifiant unique du périphérique.
     * @param rang - Le rang du périphérique.
     * @param name - Le nom du périphérique.
     * @param lastUpdate - La date de la dernière mise à jour du périphérique.
     * @param level - Le niveau du périphérique.
     * @param type - Le type du périphérique.
     * @param subType - Le sous-type du périphérique.
     * @param switchType - Le type de commutation du périphérique.
     * @param status - L'état du périphérique.
     * @param data - Les données associées au périphérique.
     * @param isGroup - Indique si le périphérique est un groupe (par défaut: false).
     */
    constructor({ idx, rang, name, lastUpdate, level, type, subType, switchType, status, data, isGroup = false }: DomoticzDevice) {
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

