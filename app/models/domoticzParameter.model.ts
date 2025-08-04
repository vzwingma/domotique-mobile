import { DomoticzDeviceType, DomoticzSwitchType } from "../enums/DomoticzEnum";


/**
 * Equipement Domoticz (Paramètre)
 */
class DomoticzParameter {
    // Index de l'équipement
    readonly idx: number;
    // Rang de l'équipement (affichage)
    rang: number = 0;
    // Nom de l'équipement
    readonly name: string;
    // Date de la dernière mise à jour
    readonly lastUpdate: string;
    // type
    readonly type: DomoticzDeviceType;
    // Equipement actif ?
    readonly isActive: boolean = false;
    // Niveau de l'équipement
    level: number;
    // Noms des niveaux de l'équipement
    levelNames: string[] = [];
    // Type de switch de l'équipement
    readonly switchType: DomoticzSwitchType;
    // Status de l'équipement
    status: string;
    // Données de l'équipement
    public data: string;


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
    constructor({ idx, rang, name, lastUpdate, level, type, switchType, status, data}: DomoticzParameter) {
        this.idx = idx;
        this.rang = rang;
        this.name = name;
        this.lastUpdate = lastUpdate;
        this.type = type;
        this.level = level;
        this.switchType = switchType;
        this.status = status;
        this.data = data;
    }
}
export default DomoticzParameter;

