import { DomoticzDeviceType, DomoticzSwitchType } from "../enums/DomoticzEnum";

export type DomoticzParameterInput = {
    idx: number;
    name: string;
    lastUpdate: string;
    level: number;
    type: DomoticzDeviceType;
    switchType: DomoticzSwitchType;
    status: string;
    data: string;
    levelNames?: string[];
};


/**
 * Paramètre Domoticz
 * 
 * Modèle immuable pour représenter un paramètre/mode Domoticz
 * avec validation et getters pour propriétés calculées.
 */
class DomoticzParameter {
    // Index de l'équipement
    readonly idx: number;
    // Nom de l'équipement
    readonly name: string;
    // Date de la dernière mise à jour
    readonly lastUpdate: string;
    // type
    readonly type: DomoticzDeviceType;
    // Niveau de l'équipement - mutable pour changements d'état
    private _level: number;
    // Noms des niveaux de l'équipement (readonly pour immuabilité)
    readonly levelNames: string[] = [];
    // Type de switch de l'équipement
    readonly switchType: DomoticzSwitchType;
    // Status de l'équipement - mutable pour changements d'état
    private _status: string;
    // Données de l'équipement
    readonly data: string;


    /**
     * Constructeur de la classe DomoticzParameter.
     * 
     * @param idx - L'identifiant unique du périphérique (doit être > 0).
     * @param name - Le nom du périphérique.
     * @param lastUpdate - La date de la dernière mise à jour du périphérique.
     * @param level - Le niveau du périphérique.
     * @param type - Le type du périphérique.
     * @param switchType - Le type de commutation du périphérique.
     * @param status - L'état du périphérique.
     * @param data - Les données associées au périphérique.
     * @throws {Error} si idx <= 0
     */
    constructor({ idx, name, lastUpdate, level, type, switchType, status, data, levelNames = []}: DomoticzParameterInput) {
        if (idx <= 0) {
            throw new Error(`idx doit être > 0, reçu: ${idx}`);
        }
        this.idx = idx;
        this.name = name;
        this.lastUpdate = lastUpdate;
        this.type = type;
        this._level = level;
        this.switchType = switchType;
        this._status = status;
        this.data = data;
        this.levelNames = levelNames;
    }

    /**
     * Getter pour le niveau
     */
    get level(): number {
        return this._level;
    }

    /**
     * Setter pour le niveau
     */
    set level(value: number) {
        this._level = value;
    }

    /**
     * Getter pour le statut
     */
    get status(): string {
        return this._status;
    }

    /**
     * Setter pour le statut
     */
    set status(value: string) {
        this._status = value;
    }

    /**
     * Getter: Nom du niveau courant
     * Retourne le label associé au niveau courant, ou le numéro si pas de label
     * 
     * @returns Le label du niveau ou le niveau lui-même
     */
    get currentLevelName(): string {
        if (this.levelNames && this.levelNames[this._level]) {
            return this.levelNames[this._level];
        }
        return String(this._level);
    }
}
export default DomoticzParameter;
