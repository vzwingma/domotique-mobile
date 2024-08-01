

/**
 * Enum pour les types d'équipements Domoticz
 */
export enum DomoticzType {
    LIGHT = "Lumière",
    BLIND = "Volet",
    UNKNOWN = "Inconnu"
}

/**
 * Tri des équipements Domoticz
 */
export const DomoticzLightSort = [122, 117, 113, 114, 118, 128, 131, 72] ;
export const DomoticzBlindSort = [85, 84, 55, 66, 86, 67, 68] ;