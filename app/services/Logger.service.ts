/* eslint-disable no-console -- seul point du code autorisé à appeler console.* directement */
/**
 * Logger centralisé — remplace les appels console.* directs.
 * debug/warn sont désactivés hors développement (__DEV__), error reste actif en production
 * pour permettre le diagnostic sur device (SSL, réseau, WebSocket...).
 */

function debug(...args: unknown[]): void {
  if (__DEV__) {
    console.log(...args);
  }
}

function warn(...args: unknown[]): void {
  if (__DEV__) {
    console.warn(...args);
  }
}

function error(...args: unknown[]): void {
  console.error(...args);
}

export const Logger = {
  debug,
  warn,
  error,
};
