

/**
 * L'URL de l'API.
 */
export const API_URL = "https://domatique.ddns.net:38243/";

/**
 * L'URI racine pour les requêtes API.
 */
export const ROOT_URI = "json.htm?";

/**
 * URLs pour différents services.
 */
export enum SERVICES_URL {
    GET_CONFIG = ROOT_URI+"type=command&param=getconfig"
}

/**
 * Enumération pour les méthodes HTTP.
 */
export enum METHODE_HTTP {
    GET = 'GET',
    POST = 'POST'
}
