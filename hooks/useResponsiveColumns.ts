/**
 * Hook responsive partagé : nombre de colonnes de grille selon largeur d'écran.
 * Seuils alignés sur les classes de fenêtre Material 3 :
 * - compact  (<600dp)      : 1 colonne
 * - medium   (600-839dp)   : 2 colonnes
 * - expanded (>=840dp)     : 3 colonnes
 *
 * Basé sur useWindowDimensions() (API React Native native) : réagit nativement
 * aux changements de largeur (rotation Android, resize Web) sans dépendance
 * supplémentaire.
 */

import { useWindowDimensions } from 'react-native';

export type ResponsiveBreakpoint = 'compact' | 'medium' | 'expanded';

export type ResponsiveColumns = {
  columns: number;
  breakpoint: ResponsiveBreakpoint;
};

const COMPACT_MAX_WIDTH = 600;
const MEDIUM_MAX_WIDTH = 840;

/**
 * @param availableWidth largeur disponible (dp) si l'écran n'occupe pas toute la fenêtre
 * (ex. une colonne du layout fusionné tablette). Par défaut : largeur de la fenêtre.
 */
export function useResponsiveColumns(availableWidth?: number): ResponsiveColumns {
  const { width: windowWidth } = useWindowDimensions();
  const width = availableWidth ?? windowWidth;

  if (width < COMPACT_MAX_WIDTH) {
    return { columns: 1, breakpoint: 'compact' };
  }
  if (width < MEDIUM_MAX_WIDTH) {
    return { columns: 2, breakpoint: 'medium' };
  }
  return { columns: 3, breakpoint: 'expanded' };
}

/**
 * Style de cellule de grille pour un écran utilisant `useResponsiveColumns`.
 * Technique "marge négative sur le conteneur + padding sur la cellule" en `boxSizing: 'border-box'` :
 * la largeur en % (calculée sur le conteneur élargi par la marge négative `-gap/2`) inclut le padding,
 * donc aucun débordement ni décompte erroné de colonnes lors du passage à la ligne (`flexWrap`),
 * quel que soit le nombre de colonnes ou le nombre d'éléments.
 * Le conteneur associé doit porter `margin: -gap / 2` (sur les 4 côtés) pour compenser ce padding.
 * @param gap écartement visuel souhaité entre cellules (même unité que le conteneur)
 * @param columns nombre de colonnes de la grille (issu de useResponsiveColumns)
 * @returns style de largeur + padding pour chaque cellule
 */
export function getGridCellStyle(gap: number, columns: number) {
  return {
    width: `${100 / columns}%` as const,
    padding: gap / 2,
    boxSizing: 'border-box' as const,
  };
}
