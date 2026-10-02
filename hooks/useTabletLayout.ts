/**
 * Hook de mise en page tablette.
 * - isTablet       : plus petit côté de la fenêtre >= 600dp (cf. `isTabletScreen`)
 * - isMergedLayout : tablette en paysage → onglets fusionnés deux à deux sur 2 colonnes
 *
 * Basé sur useWindowDimensions() : réagit nativement aux rotations / redimensionnements.
 * Sur téléphone (plus petit côté < 600dp), isMergedLayout vaut toujours false.
 */

import { useWindowDimensions } from 'react-native';
import { isTabletScreen } from '@/app/services/OrientationLock.service';

export type TabletLayout = {
  isTablet: boolean;
  isMergedLayout: boolean;
};

export function useTabletLayout(): TabletLayout {
  const { width, height } = useWindowDimensions();
  const isTablet = isTabletScreen(width, height);
  return { isTablet, isMergedLayout: isTablet && width > height };
}
