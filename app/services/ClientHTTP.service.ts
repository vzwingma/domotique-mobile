import 'react-native-get-random-values';
import { API_AUTH, API_URL, SERVICES_URL, KeyValueParams } from '../enums/APIconstants';
import { DomoticzError, handleError, generateTraceId } from './ErrorHandler.service';


/** Client HTTP **/

let storageWatch = 0;

/**
 * Interface pour les entrées du cache HTTP (T4.1)
 */
interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number; // durée de vie du cache en ms
}

/**
 * Cache HTTP simple (Map + TTL) — T4.1 Performance Optimization
 * Clé: URL complète
 * Valeur: CacheEntry (données + timestamp + TTL)
 * 
 * Stratégie: Cache GET requests pendant 30s par défaut
 * Bypass possible via paramètre bypassCache: true
 */
const httpCache: Map<string, CacheEntry> = new Map();

/**
 * Vérifie si une entrée de cache est encore valide
 * @param entry Entrée du cache
 * @returns true si le cache n'a pas expiré
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < entry.ttl;
}

/**
 * Récupère les données en cache si valides (T4.1)
 * @param url URL complète
 * @returns Données en cache ou null si absent/expiré
 */
function getCachedData(url: string): unknown | null {
  const entry = httpCache.get(url);
  if (!entry) return null;
  
  if (isCacheValid(entry)) {
    console.log(`[CACHE HIT] ${url}`);
    return entry.data;
  }
  
  // Supprimer le cache expiré
  httpCache.delete(url);
  return null;
}

/**
 * Sauvegarde les données en cache (T4.1)
 * @param url URL complète
 * @param data Données à cacher
 * @param ttl Durée de vie en ms (défaut 30s)
 */
function setCachedData(url: string, data: unknown, ttl: number = 30000): void {
  httpCache.set(url, {
    data,
    timestamp: Date.now(),
    ttl
  });
  console.log(`[CACHE SET] ${url} (TTL: ${ttl}ms)`);
}

/**
 * Vide complètement le cache HTTP (T4.1)
 * Utile pour logout ou reset
 */
export function clearHttpCache(): void {
  httpCache.clear();
  console.log('[CACHE CLEARED] Cache HTTP vidé complètement');
}


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
function startWatch(): void {
    storageWatch = Date.now();
}

/**
 * Fin du watch de la réponse
 * @param traceId id de la trace
 * @param res réponse
 * @returns temps de réponse en ms
 */
function stopWatch(traceId: string, res: Response): number {
    let responseTime = Date.now() - storageWatch;
    console.log("[WS traceId=" + traceId + "] < [" + res.status + (res.statusText !== null && res.statusText !== "" ? " - " + res.statusText : "") + "][t:" + responseTime + "ms]");
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
 * Appel HTTP vers le backend avec support du cache (T4.1)
 * @param path chemin de la ressource
 * @param params paramètres (optionnels)
 * @param bypassCache booléen pour forcer un fetch sans cache (défaut: false)
 * @returns réponse
 * @throws DomoticzError En cas d'erreur réseau, API ou parsing
 */
function callDomoticz(path: SERVICES_URL, params?: KeyValueParams[], bypassCache: boolean = false): Promise<any> {
    // Calcul de l'URL complétée
    const fullURL = evaluateURL(path, params);

    // VÉRIFIER LE CACHE (T4.1) — sauf si bypass
    if (!bypassCache) {
        const cached = getCachedData(fullURL);
        if (cached !== null) {
            console.log("[WS traceId=CACHED] > [" + fullURL + "] (cache hit, returning immediately)");
            return Promise.resolve(cached);
        }
    }

    let traceId = generateTraceId();
    console.log("[WS traceId=" + traceId + "] > [" + fullURL + "]");
    console.log("[CACHE MISS] " + fullURL);
    // Début du watch
    startWatch();

    return fetch(fullURL, {
        method: "GET",
        mode: "cors",
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + API_AUTH
            }),
        })
        .then(res => {
            // Fin du watch
            stopWatch(traceId, res);
            if (res.status >= 200 && res.status < 300) {
                return res.json();
            } else {
                // Créer une erreur structurée pour les réponses HTTP non-2xx
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
        })
        .then(data => { 
            // Vérifier le status Domoticz
            if(data.status === "ERR") {
                throw new Error(`${fullURL} - API Error: ${data.message}`);
            }
            // METTRE EN CACHE (T4.1) — si pas d'erreur
            setCachedData(fullURL, data);
            return data; 
        })
        .catch(e => {
            const isHttps = fullURL.startsWith('https://');
            const isSSLError = e.message?.toLowerCase().includes('ssl') 
                            || e.message?.toLowerCase().includes('certificate')
                            || e.message?.toLowerCase().includes('trust')
                            || e.message?.toLowerCase().includes('handshake')
                            || (isHttps && e.message?.toLowerCase().includes('network request failed'));
            if (isSSLError) {
                console.error("[WS traceId=" + traceId + "] < Erreur SSL/TLS sur " + fullURL, e);
                runSSLDiagnostic(fullURL);
            } else {
                console.error("[WS traceId=" + traceId + "] < Erreur lors de l'appel HTTP [" + fullURL + "]", e);
            }
            
            // Déléguer la gestion d'erreur structurée au ErrorHandler
            const domoticzError = handleError(
                e,
                `callDomoticz[${path}]`,
                traceId
                // Ne pas passer showToast ici - c'est au niveau du controller de le faire
            );
            
            // Relancer l'erreur structurée
            throw domoticzError;
        })

}
export default callDomoticz;

