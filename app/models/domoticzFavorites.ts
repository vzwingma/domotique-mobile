import { DomoticzType } from "../enums/DomoticzEnum";


/**
 * Favoris d'Equipement Domoticz (Lumières, volets)
 */
class DomoticzFavorites {
    // Index de l'équipement
    readonly idx: number;
    // Nombre de fois où l'équipement est activé
    public favorites: number;
    // Nom de l'équipement
    readonly name: string;
    // Type de l'équipement
    readonly type: DomoticzType;
    // Sous-type de l'équipement (Lumière, volet, ...)
    readonly subType: string;

    /**
     * Constructeur
     */
    /**
     * Construit une nouvelle instance de la classe DomoticzFavorites.
     * 
     * @param {DomoticzFavorites} options - L'objet options contenant les propriétés pour l'initialisation.
     * @param {number} options.idx - L'index des favoris.
     * @param {number} options.favourites - Le nombre de fois où les favoris sont activés.
     * @param {string} options.name - Le nom des favoris.
     * @param {DomoticzType} options.type - Le type des favoris.
     * @param {string} options.subType - Le sous-type des favoris.
     */
    constructor({ idx, favorites, name, type, subType }: DomoticzFavorites) {
        this.idx = idx;
        this.favorites = favorites;
        this.name = name;
        this.type = type;
        this.subType = subType;
    }
}
export default DomoticzFavorites;

