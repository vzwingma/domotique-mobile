import { DomoticzDeviceType } from "../enums/DomoticzEnum";


/**
 * Favoris d'Equipement Domoticz (Lumières, volets)
 */
class DomoticzFavorites {
    // Index de l'équipement
    readonly idx: number;
    // Nombre de fois où l'équipement est activé
    public nbOfUse: number;
    // Nom de l'équipement
    readonly name: string;
    // Type de l'équipement
    readonly type: DomoticzDeviceType;
    // Sous-type de l'équipement (Lumière, volet, ...)
    readonly subType: string;
    public rang: number = 0;

    /**
     * Constructeur
     */
    /**
     * Construit une nouvelle instance de la classe DomoticzFavorites.
     * 
     * @param {DomoticzFavorites} options - L'objet options contenant les propriétés pour l'initialisation.
     * @param {number} options.idx - L'index des favoris.
     * @param {number} options.nbOfUse - Le nombre de fois où les favoris sont activés.
     * @param {string} options.name - Le nom des favoris.
     * @param {DomoticzDeviceType} options.type - Le type des favoris.
     * @param {string} options.subType - Le sous-type des favoris.
     */
    constructor({ idx, nbOfUse, name, type, subType }: DomoticzFavorites) {
        this.idx = idx;
        this.nbOfUse = nbOfUse;
        this.name = name;
        this.type = type;
        this.subType = subType;
        this.rang = 0;
    }
}
export default DomoticzFavorites;

