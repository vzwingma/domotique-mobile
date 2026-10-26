/**
 * Service de verrouillage de l'orientation écran
 *
 * Responsabilités :
 * - Détecter si l'appareil est une tablette (règle "smallest width" Android sw600dp)
 * - Verrouiller l'orientation en paysage sur tablette au démarrage
 *
 * Le téléphone n'est jamais verrouillé par ce service : il conserve l'orientation
 * portrait déclarée dans `app.json`. Le Web n'est jamais verrouillé (API Screen
 * Orientation non supportée hors plein écran).
 */

import { Dimensions, Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Logger } from './Logger.service';

/** Plus petit côté d'écran (dp) à partir duquel l'appareil est considéré comme une tablette */
export const TABLET_MIN_SMALLEST_WIDTH = 600;

/**
 * Indique si des dimensions d'écran correspondent à une tablette.
 * Basé sur le plus petit côté : indépendant de l'orientation courante.
 *
 * @param width largeur (dp)
 * @param height hauteur (dp)
 * @returns true si tablette
 */
export function isTabletScreen(width: number, height: number): boolean {
  return Math.min(width, height) >= TABLET_MIN_SMALLEST_WIDTH;
}

/**
 * Verrouille l'orientation en paysage si l'appareil est une tablette (Android uniquement).
 * Ne fait rien sur téléphone ni sur Web. Les erreurs sont loguées, jamais propagées.
 */
export async function lockOrientationForDevice(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  const { width, height } = Dimensions.get('screen');
  if (!isTabletScreen(width, height)) {
    return;
  }
  try {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    Logger.debug(`[Orientation] Tablette détectée (${width}x${height}) — verrouillage paysage`);
  } catch (e) {
    Logger.warn('[Orientation] Échec du verrouillage paysage', e);
  }
}
