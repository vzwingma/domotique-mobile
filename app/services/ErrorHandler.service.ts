import 'react-native-get-random-values';
import { v7 as uuidGen } from 'uuid';

/**
 * Types d'erreurs structurées pour la gestion uniforme
 */
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Classe d'erreur Domoticz structurée
 * Centralise les informations d'erreur pour logging et affichage utilisateur
 */
export class DomoticzError extends Error {
  constructor(
    public code: string,
    public message: string,
    public traceId: string,
    public errorType: ErrorType,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DomoticzError';
    Object.setPrototypeOf(this, DomoticzError.prototype);
  }
}

/**
 * Mappe les messages d'erreur techniques en messages utilisateur français
 * @param errorType Type d'erreur
 * @param originalMessage Message d'erreur original
 * @returns Message d'erreur en français pour l'utilisateur
 */
function mapErrorToUserMessage(errorType: ErrorType, originalMessage: string): string {
  switch (errorType) {
    case ErrorType.NETWORK_ERROR:
      if (originalMessage.toLowerCase().includes('ssl') || originalMessage.toLowerCase().includes('certificate')) {
        return 'Erreur de connexion SSL/TLS avec le serveur Domoticz';
      }
      return 'Erreur de connexion réseau. Vérifiez votre connexion Internet.';
    
    case ErrorType.API_ERROR:
      if (originalMessage.includes('401') || originalMessage.includes('403')) {
        return 'Authentification échouée. Vérifiez vos identifiants Domoticz.';
      }
      if (originalMessage.includes('404')) {
        return 'Ressource non trouvée sur le serveur Domoticz.';
      }
      if (originalMessage.includes('500')) {
        return 'Erreur serveur Domoticz. Réessayez ultérieurement.';
      }
      return 'Erreur lors de la communication avec le serveur.';
    
    case ErrorType.PARSE_ERROR:
      return 'Erreur lors du traitement des données reçues.';
    
    case ErrorType.UNKNOWN_ERROR:
    default:
      return 'Une erreur inattendue s\'est produite.';
  }
}

/**
 * Détecte le type d'erreur basé sur les caractéristiques du message
 * @param error Erreur à classifier
 * @returns Type d'erreur détecté
 */
function classifyError(error: unknown): ErrorType {
  if (!(error instanceof Error)) {
    return ErrorType.UNKNOWN_ERROR;
  }

  const message = error.message.toLowerCase();

  // Détection des erreurs réseau (priorité 1)
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('ssl') ||
    message.includes('certificate') ||
    message.includes('handshake') ||
    message.includes('trust') ||
    message.includes('econnrefused') ||
    message.includes('enotfound')
  ) {
    return ErrorType.NETWORK_ERROR;
  }

  // Détection des erreurs API (codes HTTP) - priorité 2
  // Ce check doit venir AVANT le check JSON car les URLs contiennent "json"
  if (message.match(/\d{3}/) || message.includes('- err:') || message.includes('err:')) {
    return ErrorType.API_ERROR;
  }

  // Détection des erreurs de parsing JSON (priorité 3)
  if (message.includes('parse') || message.includes('unexpected token')) {
    return ErrorType.PARSE_ERROR;
  }

  // Détection générique HTTP ou status
  if (message.includes('http') || message.includes('status')) {
    return ErrorType.API_ERROR;
  }

  return ErrorType.UNKNOWN_ERROR;
}

/**
 * Gère une erreur de manière structurée et centralisée
 * 
 * Responsabilités:
 * 1. Logger l'erreur avec traceId
 * 2. Classifier le type d'erreur
 * 3. Générer un message utilisateur en français
 * 4. Afficher un toast (si showToast fourni)
 * 5. Retourner une DomoticzError structuré
 * 
 * @param error Erreur brute à traiter
 * @param context Contexte où l'erreur s'est produite (ex: 'loadDevices')
 * @param traceId Identifiant unique de trace pour le suivi
 * @param showToast Fonction optionnelle pour afficher un toast utilisateur
 * @returns DomoticzError structuré
 * 
 * @example
 * .catch((error) => {
 *   const dError = handleError(error, 'loadDevices', traceId, showToast);
 *   setErrorMessage(dError.message);
 * })
 */
export function handleError(
  error: unknown,
  context: string,
  traceId: string,
  showToast?: (msg: string) => void
): DomoticzError {
  // Classifier l'erreur
  const errorType = classifyError(error);

  // Extraire le message d'erreur original
  let originalMessage = 'Unknown error';
  if (error instanceof Error) {
    originalMessage = error.message;
  } else if (typeof error === 'string') {
    originalMessage = error;
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    originalMessage = String(error.message);
  }

  // Générer le code d'erreur
  const errorCode = `${errorType}_${Date.now()}`;

  // Générer le message utilisateur
  const userMessage = mapErrorToUserMessage(errorType, originalMessage);

  // Logger l'erreur structurée avec traceId
  console.error(
    `[ErrorHandler traceId=${traceId}] [${context}] [${errorType}] ` +
    `Original: ${originalMessage}`
  );

  // Afficher le toast si la fonction est fournie
  if (showToast) {
    showToast(userMessage);
  }

  // Créer et retourner l'erreur structuré
  const domoticzError = new DomoticzError(
    errorCode,
    userMessage,
    traceId,
    errorType,
    error instanceof Error ? error : undefined
  );

  return domoticzError;
}

/**
 * Génère un nouvel ID de trace unique pour les appels HTTP
 * Utile pour tracer une requête à travers les logs
 * 
 * @returns ID de trace unique
 * @example
 * const traceId = generateTraceId();
 */
export function generateTraceId(): string {
  return uuidGen().replaceAll('-', '');
}
