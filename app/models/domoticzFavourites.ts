import { DomoticzType } from "../enums/DomoticzEnum";


/**
 * Favoris d'Equipement Domoticz (Lumières, volets)
 */
class DomoticzFavorites {
    // Index de l'équipement
    idx: number;
    // Nombre de fois où l'équipement est activé
    favourites: number;
    // Nom de l'équipement
    name: string;
    // Type de l'équipement
    type: DomoticzType;
    // Sous-type de l'équipement (Lumière, volet, ...)
    subType: string;

    /**
     * Constructeur
     */
    constructor(idx: number, favourites: number, name: string, type: DomoticzType, subType: string) {
        this.idx = idx;
        this.favourites = favourites;
        this.name = name;
        this.type = type;
        this.subType = subType;
    }
}
export default DomoticzFavorites;

