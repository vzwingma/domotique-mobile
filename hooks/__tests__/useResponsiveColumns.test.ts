/**
 * Tests unitaires pour le hook useResponsiveColumns.
 *
 * Couvre (T4.1 — Plan d'Action 003, Phase 4) :
 *  - Les 3 breakpoints (compact / medium / expanded) avec des largeurs représentatives
 *  - Les valeurs limites EXACTES des seuils (599/600, 839/840) — cas les plus fragiles
 *  - `getGridCellStyle` : style de cellule (largeur %, padding, boxSizing) pour 1/2/3 colonnes
 *
 * `useWindowDimensions` (react-native) est mocké pour simuler des largeurs précises,
 * sans dépendre du device/fenêtre réel exécutant les tests.
 */

import { renderHook } from '@testing-library/react-native';
import { useWindowDimensions } from 'react-native';
import { useResponsiveColumns, getGridCellStyle } from '../useResponsiveColumns';

// ─── Mock de react-native ───────────────────────────────────────────────────────
// On ne mocke QUE useWindowDimensions, en mutant directement l'objet réel renvoyé par
// requireActual (pas de spread `{...actual}` : cela évaluerait immédiatement TOUS les
// getters du module, y compris des natives non disponibles en test — ex. TurboModule
// 'DevMenu' — et ferait planter la suite). jest.mock (contrairement à jest.spyOn) est
// hoisté par babel-plugin-jest-hoist au-dessus des imports, condition nécessaire pour
// que le hook (qui importe react-native en interne) capte bien la version mockée.
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

/** Configure la largeur simulée retournée par useWindowDimensions() */
function setWidth(width: number) {
  mockUseWindowDimensions.mockReturnValue({ width, height: 800, scale: 1, fontScale: 1 });
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('useResponsiveColumns', () => {
  describe('breakpoint compact (<600dp) — 1 colonne', () => {
    it.each([
      [0],
      [1],
      [320],
      [375],
      [599],
    ])('largeur %idp → 1 colonne / breakpoint "compact"', (width) => {
      setWidth(width);
      const { result } = renderHook(() => useResponsiveColumns());
      expect(result.current).toEqual({ columns: 1, breakpoint: 'compact' });
    });
  });

  describe('breakpoint medium (600-839dp) — 2 colonnes', () => {
    it.each([
      [600],
      [700],
      [800],
      [839],
    ])('largeur %idp → 2 colonnes / breakpoint "medium"', (width) => {
      setWidth(width);
      const { result } = renderHook(() => useResponsiveColumns());
      expect(result.current).toEqual({ columns: 2, breakpoint: 'medium' });
    });
  });

  describe('breakpoint expanded (>=840dp) — 3 colonnes', () => {
    it.each([
      [840],
      [1024],
      [1280],
      [2560],
    ])('largeur %idp → 3 colonnes / breakpoint "expanded"', (width) => {
      setWidth(width);
      const { result } = renderHook(() => useResponsiveColumns());
      expect(result.current).toEqual({ columns: 3, breakpoint: 'expanded' });
    });
  });

  describe('valeurs limites exactes des seuils', () => {
    it('599 (juste sous le seuil compact/medium) → compact / 1 colonne', () => {
      setWidth(599);
      const { result } = renderHook(() => useResponsiveColumns());
      expect(result.current).toEqual({ columns: 1, breakpoint: 'compact' });
    });

    it('600 (seuil exact compact/medium) → medium / 2 colonnes', () => {
      setWidth(600);
      const { result } = renderHook(() => useResponsiveColumns());
      expect(result.current).toEqual({ columns: 2, breakpoint: 'medium' });
    });

    it('839 (juste sous le seuil medium/expanded) → medium / 2 colonnes', () => {
      setWidth(839);
      const { result } = renderHook(() => useResponsiveColumns());
      expect(result.current).toEqual({ columns: 2, breakpoint: 'medium' });
    });

    it('840 (seuil exact medium/expanded) → expanded / 3 colonnes', () => {
      setWidth(840);
      const { result } = renderHook(() => useResponsiveColumns());
      expect(result.current).toEqual({ columns: 3, breakpoint: 'expanded' });
    });
  });

  it('réagit à un changement de largeur (rotation/resize) sans reload', () => {
    setWidth(375);
    const { result, rerender } = renderHook(() => useResponsiveColumns());
    expect(result.current).toEqual({ columns: 1, breakpoint: 'compact' });

    setWidth(1280);
    rerender({});
    expect(result.current).toEqual({ columns: 3, breakpoint: 'expanded' });
  });
});

describe('getGridCellStyle', () => {
  it('1 colonne : largeur 100%, padding = gap/2, boxSizing border-box', () => {
    expect(getGridCellStyle(10, 1)).toEqual({
      width: '100%',
      padding: 5,
      boxSizing: 'border-box',
    });
  });

  it('2 colonnes : largeur 50%, padding = gap/2', () => {
    expect(getGridCellStyle(10, 2)).toEqual({
      width: '50%',
      padding: 5,
      boxSizing: 'border-box',
    });
  });

  it('3 colonnes : largeur 33.33...%, padding = gap/2', () => {
    const style = getGridCellStyle(12, 3);
    expect(style.width).toBe(`${100 / 3}%`);
    expect(style.padding).toBe(6);
    expect(style.boxSizing).toBe('border-box');
  });

  it('gap = 0 → padding = 0', () => {
    expect(getGridCellStyle(0, 1)).toEqual({
      width: '100%',
      padding: 0,
      boxSizing: 'border-box',
    });
  });

  it('gap impair → padding fractionnaire (gap/2 non arrondi)', () => {
    expect(getGridCellStyle(9, 2)).toEqual({
      width: '50%',
      padding: 4.5,
      boxSizing: 'border-box',
    });
  });
});
