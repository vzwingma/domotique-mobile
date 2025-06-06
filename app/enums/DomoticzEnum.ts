
export const DOMOTICZ_MOBILE_VERSION = "2.4.1";

export enum DomoticzStatus {
    INCONNU = 'INCONNU',
    CONNECTE = 'CONNECTE',
    DECONNECTE = 'DECONNECTE',
}
/**
 * Enum pour les types d'équipements Domoticz
 */
export enum DomoticzDeviceType {
    LUMIERE = "Lumière",
    VOLET = "Volet",
    THERMOSTAT = "Thermostat",
    UNKNOWN = "Inconnu"
}
/*
 * Enum pour les types de switch Domoticz
 */
export enum DomoticzSwitchType {
    SLIDER = "Dimmer",
    ONOFF = "On/Off",
    UNKNOWN = "Inconnu"
}


/**
 * Enum pour les types d'équipements Domoticz
 */
export enum DomoticzDeviceStatus {
    ON = "On",
    OFF = "Off"
}

/**
 * Valeurs min et max pour les thermostats
 */
export enum DomoticzThermostatLevelValue {
    MIN = 10,
    MAX = 40
}

/**
 * Valeurs min et max pour les équipements
 */
export enum DomoticzDeviceLevelValue {
    MIN = 0,
    MAX = 100
}

/**
 * Tri des équipements Domoticz
 */
export const DomoticzLightsSort: number[] = [122, 128, 131, 72, 117, 113, 114, 118];


/**
 * Tri des équipements Domoticz
 */
export const DomoticzBlindsSort: number[]  = [85, 84, 55, 66, 86, 67, 68] ;

/**
 * Representes Groupes d'équipements
 *
 * @remarks
 * La constante `DomoticzBlindsGroups` est un tableau d'objets, où chaque objet représente un groupe de volets.
 * Chaque objet de groupe de volets a une paire clé-valeur, où la clé est l'ID du groupe et la valeur est un tableau d'IDs de volets.
 * @type {Array<{[key: number]: number[]}>}
 */
export const DomoticzBlindsGroups : {[key: number]: number[]}[] = [
    // Tous volets
    {85 : [66, 55, 67, 68]},
    // Volets chambres
    {86 : [67, 68]},
    // Volets Salon
    {84 : [66, 55]}
] ;

/**
 * Représente les groupes de lumières dans Domoticz.
 * Chaque groupe est défini comme un objet avec une paire clé-valeur, où la clé est l'ID du groupe et la valeur est un tableau d'IDs de lumières.
 * Exemple :
 * [
 *   {122: [114, 128, 131]},
 *   {117: [113, 114, 118, 128, 131, 72]}
 * ]
 */
export const DomoticzLightsGroups : {[key: number]: number[]}[] = [
    // Lumières salon
    {117 : [113, 114, 118]},
    // Toutes les lumières
    {122 : [113, 114, 118, 128, 131, 72]}
] ;
