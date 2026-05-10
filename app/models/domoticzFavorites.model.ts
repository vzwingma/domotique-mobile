import { DomoticzDeviceType } from "../enums/DomoticzEnum";

export type DomoticzFavoritesInput = {
    idx: number;
    nbOfUse: number;
    name: string;
    type: DomoticzDeviceType;
    subType: string;
};


/**
 * Favoris d'Equipement Domoticz (Lumières, volets, paramètres)
 * 
 * Modèle immuable pour représenter un équipement favori avec validation.
 * Les propriétés immutables garantissent la cohérence des données en cache.
 */
class DomoticzFavorites {
    // Index de l'équipement
    readonly idx: number;
    // Nombre de fois où l'équipement est activé (mutable)
    private _nbOfUse: number;
    // Nom de l'équipement
    readonly name: string;
    // Type de l'équipement
    readonly type: DomoticzDeviceType;
    // Sous-type de l'équipement (Lumière, volet, ...)
    readonly subType: string;


    /**
     * Construit une nouvelle instance de la classe DomoticzFavorites.
     * 
     * @param {DomoticzFavorites} options - L'objet options contenant les propriétés pour l'initialisation.
     * @param {number} options.idx - L'index des favoris (doit être > 0).
     * @param {number} options.nbOfUse - Le nombre de fois où les favoris sont activés.
     * @param {string} options.name - Le nom des favoris.
     * @param {DomoticzDeviceType} options.type - Le type des favoris.
     * @param {string} options.subType - Le sous-type des favoris.
     * @throws {Error} si idx <= 0
     */
    constructor({ idx, nbOfUse, name, type, subType }: DomoticzFavoritesInput) {
        if (idx <= 0) {
            throw new Error(`idx doit être > 0, reçu: ${idx}`);
        }
        this.idx = idx;
        this._nbOfUse = nbOfUse;
        this.name = name;
        this.type = type;
        this.subType = subType;
    }

    /**
     * Getter pour le nombre d'utilisations
     */
    get nbOfUse(): number {
        return this._nbOfUse;
    }

    /**
     * Setter pour le nombre d'utilisations
     */
    set nbOfUse(value: number) {
        this._nbOfUse = value;
    }

    /**
     * Getter: Cet équipement est-il "populaire" (utilisé ≥ 5 fois) ?
     */
    get isPopular(): boolean {
        return this._nbOfUse >= 5;
    }

    /**
     * Getter: Formatage du nombre d'utilisations pour affichage
     * @returns "1 utilisation" ou "N utilisations"
     */
    get displayUsageCount(): string {
        return this._nbOfUse === 1 ? '1 utilisation' : `${this._nbOfUse} utilisations`;
    }
}
export default DomoticzFavorites;
