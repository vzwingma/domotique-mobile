

/**
 * L'URL de l'API.
 */
export const API_URL = "https://domatique.ddns.net:38243/";

/**
 * L'URI racine pour les requêtes API.
 */
export const ROOT_URI = "json.htm?type=command&param=";

/**
 * Paramètres pour les services.
 */
export const enum SERVICES_PARAMS {
    IDX = "<IDX>",
    CMD = "<CMD>",
    LEVEL = "<LEVEL>",
}

/**
 * URLs pour différents services.
 */
export enum SERVICES_URL {
    GET_CONFIG = ROOT_URI+"getconfig",
    GET_DEVICES = ROOT_URI+"getdevices&filter=all&used=true&order=Name",
    // idx=<IDX>&switchcmd=<Open|Close|Stop>  
    CMD_BLINDS_ON_OFF = ROOT_URI+"aswitchlight&idx="+SERVICES_PARAMS.IDX+"&switchcmd="+ SERVICES_PARAMS.CMD,
    // idx=<IDX>&switchcmd=Set%20Level&level=<0..100>
    CMD_BLINDS_SET_LEVEL = ROOT_URI+"aswitchlight&idx="+SERVICES_PARAMS.IDX+"&switchcmd=Set%20Level&level="+ SERVICES_PARAMS.LEVEL,
}



/**
 * Paramètres clé-valeur pour les URL
 */
export interface KeyValueParams {
    key: SERVICES_PARAMS;
    value: string;
}
