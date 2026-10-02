/**
 * Tests unitaires du hook useTabletLayout (Plan d'Action 004, T3.3)
 *
 * Couvre :
 *  - isTablet : plus petit côté de la fenêtre >= 600dp
 *  - isMergedLayout : tablette ET paysage (largeur > hauteur) uniquement
 *  - réaction à une rotation sans reload
 *
 * Seul `useWindowDimensions` est mocké (cf. useResponsiveColumns.test.ts).
 */
import { renderHook } from '@testing-library/react-native';
import { useWindowDimensions } from 'react-native';
import { useTabletLayout } from '../useTabletLayout';

jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  Object.defineProperty(actual, 'useWindowDimensions', {
    value: jest.fn(),
    configurable: true,
    writable: true,
  });
  return actual;
});

const mockUseWindowDimensions = useWindowDimensions as jest.Mock;

function setWindow(width: number, height: number) {
  mockUseWindowDimensions.mockReturnValue({ width, height, scale: 1, fontScale: 1 });
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('useTabletLayout', () => {
  it.each([
    // [largeur, hauteur, isTablet, isMergedLayout]
    [375, 812, false, false],   // téléphone portrait
    [812, 375, false, false],   // téléphone paysage (jamais fusionné)
    [599, 1000, false, false],  // juste sous le seuil
    [800, 1280, true, false],   // Tab S6 portrait
    [1280, 800, true, true],    // Tab S6 paysage
    [600, 600, true, false],    // carré : pas paysage
    [601, 600, true, true],     // seuil exact + paysage
    [1000, 599, false, false],  // fenêtre large mais basse : pas tablette
  ])('%ix%i → isTablet=%s, isMergedLayout=%s', (width, height, isTablet, isMergedLayout) => {
    setWindow(width, height);
    const { result } = renderHook(() => useTabletLayout());
    expect(result.current).toEqual({ isTablet, isMergedLayout });
  });

  it('réagit à une rotation (portrait → paysage) sans reload', () => {
    setWindow(800, 1280);
    const { result, rerender } = renderHook(() => useTabletLayout());
    expect(result.current.isMergedLayout).toBe(false);

    setWindow(1280, 800);
    rerender({});
    expect(result.current.isMergedLayout).toBe(true);
  });
});
