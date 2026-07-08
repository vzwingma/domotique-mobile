/**
 * Enum pour les types d'équipements Domoticz
 */
export enum DomoticzDeviceType {
    LUMIERE = "Lumière",
    VOLET = "Volet",
    THERMOSTAT = "Thermostat",
    PARAMETRE = "Paramètre",
    PARAMETRE_RO = "Paramètre (Lecture seule)",
    UNKNOWN = "Inconnu"
}
/*
 * Enum pour les types de switch Domoticz
 */
export enum DomoticzSwitchType {
    SLIDER = "Dimmer",
    ONOFF = "On/Off"
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
    MIN = 5,
    MAX = 30
}

/**
 * Valeurs min et max pour les équipements
 */
export enum DomoticzDeviceLevelValue {
    MIN = 0,
    MAX = 100
}

/**
 * Labels d'affichage UI pour les équipements Domoticz.
 * Centralise tous les libellés métier visibles par l'utilisateur.
 */
export enum DomoticzDeviceLabel {
  // Volets — état individuel
  BLIND_OPEN   = "Ouvert",
  BLIND_CLOSED = "Fermé",
  // Volets — état groupe
  BLIND_OPEN_GROUP   = "Ouverts",
  BLIND_CLOSED_GROUP = "Fermés",
  // Volets — actions
  BLIND_OPEN_ACTION  = "Ouvrir",
  BLIND_CLOSE_ACTION = "Fermer",
  // Lumières — état individuel
  LIGHT_ON  = "Allumée",
  LIGHT_OFF = "Éteinte",
  // Lumières — état groupe
  LIGHT_ON_GROUP  = "Allumées",
  LIGHT_OFF_GROUP = "Éteintes",
  // Lumières — actions
  LIGHT_ON_ACTION  = "Allumer",
  LIGHT_OFF_ACTION = "Éteindre",
  // Commun
  MIXTE = "Mixte",
  // Moment (Phase)
  PHASE_JOURNEE = "Journée",
  PHASE_SOIREE  = "Soirée",
  // Mode
  MODE_ETE = "Été",
}

/**
 * Préfixes normalisés (majuscules, sans accents) des statuts de Phase Domoticz.
 * Permet de matcher un statut composé (ex: "JOURNEE ETE", "JOURNEE VACANCES")
 * indépendamment du mode accolé par Domoticz.
 */
export enum DomoticzPhasePrefix {
    PREPARATION_CHAUFFAGE = "PREPARATION CHAUFFAGE",
    REVEIL = "REVEIL",
    JOURNEE = "JOURNEE",
    SOIREE = "SOIREE",
    NUIT = "NUIT",
}

/**
 * Tri des équipements Domoticz
 */
export const DomoticzLightsSort: number[] = [122, 128, 131, 72, 117, 113, 114, 118, 161];


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
    {117 : [113, 114, 118, 161]},
    // Toutes les lumières
    {122 : [113, 114, 118, 128, 131, 72, 161]}
] ;
