import { DomoticzSwitchType, DomoticzDeviceType } from "../enums/DomoticzEnum";


/**
 * Equipement Domoticz (Lumières, volets)
 * 
 * Modèle immuable pour représenter un équipement Domoticz avec validation
 * et getters pour propriétés calculées.
 */
class DomoticzDevice {
    // Index de l'équipement (validé > 0)
    readonly idx: number;
    // Rang de l'équipement (affichage) - mutable pour tri
    private _rang: number = 0;
    // Nom de l'équipement
    readonly name: string;
    // Groupe d'équipements ?
    readonly isGroup: boolean = false;
    // Date de la dernière mise à jour
    readonly lastUpdate: string;
    // Equipement actif ?
    readonly isActive: boolean = false;
    // Niveau de l'équipement - mutable pour changements d'état
    private _level: number;
    // Unit
    readonly unit: string = "";
    // Niveau de cohérence du niveau de l'équipement (pour les groupes). True par défaut pour les équipements
    private _consistantLevel: boolean = true;
    // Type de l'équipement
    readonly type: DomoticzDeviceType;
    // Sous-type de l'équipement (Lumière, volet, ...)
    readonly subType: string;
    // Type de switch de l'équipement
    readonly switchType: DomoticzSwitchType;
    // Status de l'équipement - mutable pour changements d'état
    private _status: string;
    // Données de l'équipement
    readonly data: string;


    /**
     * Constructeur de la classe DomoticzDevice.
     * 
     * @param idx - L'identifiant unique du périphérique (doit être > 0).
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
     * @throws {Error} si idx <= 0
     */
    constructor({ idx, rang, name, lastUpdate, level, type, subType, switchType, status, data, isGroup = false }: DomoticzDevice) {
        if (idx <= 0) {
            throw new Error(`idx doit être > 0, reçu: ${idx}`);
        }
        this.idx = idx;
        this._rang = rang;
        this.name = name;
        this.lastUpdate = lastUpdate;
        this._level = level;
        this.type = type;
        this.subType = subType;
        this.switchType = switchType;
        this._status = status;
        this.data = data;
        this.isGroup = isGroup;
    }

    /**
     * Getter pour le rang de l'équipement (affichage)
     */
    get rang(): number {
        return this._rang;
    }

    /**
     * Setter pour le rang de l'équipement
     */
    set rang(value: number) {
        this._rang = value;
    }

    /**
     * Getter pour le niveau de l'équipement
     */
    get level(): number {
        return this._level;
    }

    /**
     * Setter pour le niveau de l'équipement
     */
    set level(value: number) {
        this._level = value;
    }

    /**
     * Getter pour le statut de l'équipement
     */
    get status(): string {
        return this._status;
    }

    /**
     * Setter pour le statut de l'équipement
     */
    set status(value: string) {
        this._status = value;
    }

    /**
     * Getter pour la cohérence du niveau
     */
    get consistantLevel(): boolean {
        return this._consistantLevel;
    }

    /**
     * Setter pour la cohérence du niveau
     */
    set consistantLevel(value: boolean) {
        this._consistantLevel = value;
    }

    /**
     * Getter: L'équipement est-il en ligne ?
     * Basé sur le statut isActive
     */
    get isOnline(): boolean {
        return this.isActive;
    }

    /**
     * Getter: Formatage du niveau pour affichage
     * @returns "100%" pour lumières/volets, "100°C" pour thermostats, etc.
     */
    get displayLevel(): string {
        if (this.type === DomoticzDeviceType.THERMOSTAT) {
            return `${this._level}${this.unit || '°C'}`;
        }
        return `${Math.round(this._level)}%`;
    }
}
export default DomoticzDevice;

