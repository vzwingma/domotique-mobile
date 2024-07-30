import 'react-native-get-random-values';
import { v7 as uuidGen } from 'uuid';
import * as ApiConstants from '../constants/APIconstants';

/** Client HTTP **/

let storageWatch = 0;

/**
 * Calcul de l'URL complétée
 * @param path  chemin de la ressource
 * @param params paramètres (optionnels)
 * @returns URL complétée
 */
function evaluateURL(path: string, params: string[]): string {
    let fullURL = ApiConstants.API_URL + path;
    if (params != null && params.length > 0) {
        params.forEach(param => {
            fullURL = fullURL.replace("{{}}", param)
        })
    }
    return fullURL;
}

/**
 * Completion du body
 * @param body : string body
 * @returns body en JSON si body n'est pas null ou undefined
 * @deprecated déprécié
 */
function evaluateBody(body: string): any {
    let jsonBody = null;
    if (body !== undefined && body !== null && body !== "") {
        jsonBody = JSON.stringify(body);
        console.log("[WS] > [Body] ", jsonBody);
    }
    return jsonBody;
}

/**
 * Début du watch de la réponse
 */
function startWatch(): void {
    storageWatch = new Date().getTime();
}

/**
 * Fin du watch de la réponse
 * @param traceId id de la trace
 * @param res réponse
 * @returns temps de réponse en ms
 */
function stopWatch(traceId: string, res: Response): number {
    let responseTime = new Date().getTime() - storageWatch;
    console.log("[WS traceId=" + traceId + "] < [" + res.status + (res.statusText !== null && res.statusText !== "" ? " - " + res.statusText : "") + "][t:" + responseTime + "ms]");
    return responseTime;
}

/**
 * Appel HTTP vers le backend
 * @param httpMethod méthode HTTP
 * @param path chemin de la ressource
 * @param params paramètres (optionnels)
 * @param body body de la requête (optionnel)
 * @returns réponse
 */
export function call(httpMethod: ApiConstants.METHODE_HTTP, path: ApiConstants.SERVICES_URL, params: string[], body: string): Promise<Response|undefined> {
    // Calcul de l'URL complétée
    const fullURL = evaluateURL(path, params);

    let traceId = uuidGen().replaceAll("-", "");
    console.log("[WS traceId=" + traceId + "] > [" + httpMethod + "/" + fullURL + "]");
    // Début du watch
    startWatch();

    return fetch(fullURL, {
        method: httpMethod,
        mode: "cors",
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + ApiConstants.AUTH,
        }),
        body: evaluateBody(body),
    })
        .then(res => {
            // Fin du watch
            stopWatch(traceId, res);

            if (res.status >= 200 && res.status < 300) {
                return res;
            } else if (res.status === 403) {
                console.log("[WS traceId=" + traceId + "] < [Session expirée");
            } else {
                console.error("[WS traceId=" + traceId + "] < ", res);
                throw new Error(res.statusText);
            }
        })
        .catch(e => {
            console.error("[WS traceId=" + traceId + "] < [Erreur lors de l'appel HTTP [" + fullURL + "]", e);
            throw new Error(e);
        });
}
