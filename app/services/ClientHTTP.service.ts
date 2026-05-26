import 'react-native-get-random-values';
import { API_AUTH, API_URL, SERVICES_URL, KeyValueParams } from '../enums/APIconstants';
import { handleError, generateTraceId } from './ErrorHandler.service';


/** Client HTTP **/

// Timeout suffisamment long pour couvrir les connexions distantes lentes (5G ~30-40s).
// Valeur choisie pour détecter les serveurs réellement injoignables sans pénaliser les liens lents.
const REQUEST_TIMEOUT_MS = 180000;
const inFlightRequests = new Map<string, Promise<any>>();


/**
 * Calcul de l'URL complétée
 * @param path  chemin de la ressource
 * @param params paramètres (optionnels)
 * @returns URL complétée
 */
function evaluateURL(path: string, params?: KeyValueParams[]): string {
    let fullURL = API_URL + path;
    if (params !== undefined && params !== null && params.length > 0) {
        params.forEach(param => {
            fullURL = fullURL.replace(param.key, param.value)
        })
    }
    return fullURL;
}


/**
 * Début du watch de la réponse
 */
function startWatch(): number {
    return Date.now();
}

/**
 * Fin du watch de la réponse
 * @param traceId id de la trace
 * @param res réponse
 * @returns temps de réponse en ms
 */
function stopWatch(traceId: string, res: Response, startedAt: number): number {
    let responseTime = Date.now() - startedAt;
    console.log("[WS traceId=" + traceId + "] < [" + res.status + (res.statusText !== null && res.statusText !== "" ? " - " + res.statusText : "") + "][t:" + responseTime + "ms]");
    return responseTime;
}

function stopWatchTimeout(traceId: string, startedAt: number): number {
    const responseTime = Date.now() - startedAt;
    console.log("[WS traceId=" + traceId + "] < [TIMEOUT][t:" + responseTime + "ms]");
    return responseTime;
}

/**
 * Diagnostic de connectivité SSL — appelé en cas d'erreur réseau sur HTTPS.
 * Teste successivement :
 *   1. Connectivité HTTPS générale (google.com) → distingue SSL spécifique vs réseau global
 *   2. Accessibilité HTTP du host Domoticz → vérifie si le port est joignable
 */
function runSSLDiagnostic(failedUrl: string): void {
    fetch('https://www.google.com', { method: 'HEAD' })
        .then(() => {
            console.warn('[SSL Diagnostic] ✅ Internet HTTPS (google.com) OK — l\'erreur est spécifique au certificat Domoticz');
            console.warn('[SSL Diagnostic]    Cause probable : certificat auto-signé non approuvé par le build actuel');
            console.warn('[SSL Diagnostic]    → Vérifiez le build : npm run android:clean (rebuild natif force-clean)');
            console.warn('[SSL Diagnostic]    → Logs Android natifs : npm run android:logs');
        })
        .catch(() => {
            console.warn('[SSL Diagnostic] ❌ Internet HTTPS (google.com) ÉCHEC — problème réseau général');
            if (failedUrl.startsWith('https://')) {
                const httpUrl = failedUrl.replace('https://', 'http://');
                fetch(httpUrl, { method: 'HEAD' })
                    .then(() => console.warn('[SSL Diagnostic] ✅ Host Domoticz en HTTP accessible — le port HTTPS est bloqué ou le serveur n\'écoute pas'))
                    .catch(() => console.warn('[SSL Diagnostic] ❌ Host Domoticz inaccessible — vérifiez réseau/Wi-Fi/pare-feu'));
            }
        });
}

/**
 * Diagnostic de latence — décompose les phases réseau pour identifier
 * quelle couche (DNS, TCP, TLS, HTTP) introduit la latence.
 *
 * À appeler au démarrage de l'app pour produire des logs exploitables.
 * Les timestamps permettent de localiser précisément la phase lente :
 *   - t0→t1 = DNS + TCP + TLS (tout ce qui précède le premier octet HTTP)
 *   - t1→t2 = traitement serveur + réception HTTP
 *   Si t0→t1 >> t1→t2 : le problème est réseau/TLS (probable sur 5G)
 *   Si t1→t2 >> t0→t1 : le problème est côté serveur
 */
export function runLatencyDiagnostic(traceId: string): void {
    if (!API_URL) return;
    const baseHost = (API_URL).replace(/\/$/, '');
    const diagnosticUrl = `${baseHost}/json.htm?type=command&param=getconfig`;

    const t0 = Date.now();
    console.log(`[LatencyDiag traceId=${traceId}] t0=${t0} — fetch() déclenché vers ${diagnosticUrl}`);

    fetch(diagnosticUrl, {
        method: 'GET',
        signal: AbortSignal.timeout ? AbortSignal.timeout(90000) : undefined,
        headers: new Headers({ 'Authorization': 'Basic ' + API_AUTH }),
    })
    .then(res => {
        const t1 = Date.now();
        console.log(`[LatencyDiag traceId=${traceId}] t1=${t1} — premier octet HTTP reçu (status ${res.status})`);
        console.log(`[LatencyDiag traceId=${traceId}] ⏱ DNS+TCP+TLS : ${t1 - t0}ms`);
        return res.text().then(body => ({ t1, body }));
    })
    .then(({ t1, body }) => {
        const t2 = Date.now();
        console.log(`[LatencyDiag traceId=${traceId}] t2=${t2} — corps reçu intégralement`);
        console.log(`[LatencyDiag traceId=${traceId}] ⏱ Traitement serveur + transfert body : ${t2 - t1}ms`);
        console.log(`[LatencyDiag traceId=${traceId}] ⏱ Total : ${t2 - t0}ms`);
        try {
            const json = JSON.parse(body) as { status?: string };
            console.log(`[LatencyDiag traceId=${traceId}] ✅ Réponse Domoticz status=${json.status}`);
        } catch {
            console.warn(`[LatencyDiag traceId=${traceId}] ⚠️ Body non-JSON : ${body.substring(0, 200)}`);
        }
    })
    .catch(err => {
        const t1 = Date.now();
        console.error(`[LatencyDiag traceId=${traceId}] ❌ Échec après ${t1 - t0}ms — ${(err as Error).message}`);
    });
}

/**
 * Appel HTTP vers le backend Domoticz
 * @param path chemin de la ressource
 * @param params paramètres (optionnels)
 * @returns réponse
 * @throws DomoticzError En cas d'erreur réseau, API ou parsing
 */
function callDomoticz(path: SERVICES_URL, params?: KeyValueParams[]): Promise<any> {
    const fullURL = evaluateURL(path, params);
    const inFlightRequest = inFlightRequests.get(fullURL);
    if (inFlightRequest !== undefined) {
        return inFlightRequest;
    }

    const requestPromise = executeRequest(path, fullURL);
    inFlightRequests.set(fullURL, requestPromise);

    return requestPromise.finally(() => {
        inFlightRequests.delete(fullURL);
    });
}

function executeRequest(path: SERVICES_URL, fullURL: string): Promise<any> {
    let traceId = generateTraceId();
    console.log("[WS traceId=" + traceId + "] > [" + fullURL + "]");
    const watchStartAt = startWatch();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    return fetch(fullURL, {
        method: "GET",
        signal: controller.signal,
        headers: new Headers({
            'Authorization': 'Basic ' + API_AUTH
            }),
        })
        .then(res => {
            stopWatch(traceId, res, watchStartAt);
            if (res.status >= 200 && res.status < 300) {
                return res.json();
            } else {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
        })
        .then(data => {
            if(data.status === "ERR") {
                throw new Error(`${fullURL} - API Error: ${data.message}`);
            }
            return data;
        })
        .catch(e => {
            let effectiveError = e;
            if (e instanceof Error && e.name === 'AbortError') {
                stopWatchTimeout(traceId, watchStartAt);
                effectiveError = new Error(`Request timeout after ${REQUEST_TIMEOUT_MS}ms for ${fullURL}`);
            }

            const isHttps = fullURL.startsWith('https://');
            const errorMessage = (effectiveError as Error)?.message?.toLowerCase() ?? '';
            const isSSLError = errorMessage.includes('ssl')
                            || errorMessage.includes('certificate')
                            || errorMessage.includes('trust')
                            || errorMessage.includes('handshake')
                            || (isHttps && errorMessage.includes('network request failed'));
            if (isSSLError) {
                console.error("[WS traceId=" + traceId + "] < Erreur SSL/TLS sur " + fullURL, effectiveError);
                runSSLDiagnostic(fullURL);
            } else {
                console.error("[WS traceId=" + traceId + "] < Erreur lors de l'appel HTTP [" + fullURL + "]", effectiveError);
            }

            const domoticzError = handleError(
                effectiveError,
                `callDomoticz[${path}]`,
                traceId
            );

            throw domoticzError;
        })
        .finally(() => {
            clearTimeout(timeoutId);
        })

}
export default callDomoticz;
