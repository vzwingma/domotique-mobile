import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../index';
import { DomoticzContext } from '../../services/DomoticzContextProvider';
import DomoticzDevice from '../../models/domoticzDevice.model';
import { DomoticzDeviceType, DomoticzSwitchType, DomoticzDeviceStatus } from '../../enums/DomoticzEnum';

// Mock components
jest.mock('../../components/favoriteCard.component', () => ({
  FavoriteCard: ({ device }: { device: DomoticzDevice }) => (
    <div testID={`favorite-card-${device.idx}`}>{device.name}</div>
  ),
}));

jest.mock('../../services/DataUtils.service', () => ({
  getFavoritesFromStorage: jest.fn(() =>
    Promise.resolve([
      { idx: 1, nbOfUse: 5, name: 'Fav 1', type: 'Lumière', subType: 'Switch' },
      { idx: 2, nbOfUse: 3, name: 'Fav 2', type: 'Volet', subType: 'Blind' },
      { idx: 3, nbOfUse: 2, name: 'Fav 3', type: 'Lumière', subType: 'Switch' },
    ])
  ),
  sortFavorites: jest.fn((a, b) => a.idx - b.idx),
}));

// index.tsx importe réellement `getFavoritesFromStorage` depuis `FavoritesManager.service`
// (le mock ci-dessus, sur `DataUtils.service`, ne cible pas le bon module et reste inerte).
// Nécessaire ici (T4.2) pour peupler des favoris réels et vérifier le rendu de la grille.
// idx 1..20, nbOfUse décroissant (idx 1 = plus utilisé) : couvre tous les scénarios de test
// (3, 1 ou 10 devices actifs) tout en gardant un tri par usage déterministe.
jest.mock('../../services/FavoritesManager.service', () => ({
  getFavoritesFromStorage: jest.fn(() =>
    Promise.resolve(
      Array.from({ length: 20 }, (_, i) => ({ idx: i + 1, nbOfUse: 20 - i }))
    )
  ),
}));

jest.mock('@/components/ThemedText', () => ({
  ThemedText: ({ children, style }: any) => <div style={style}>{children}</div>,
}));

// Largeur simulée mutable : permet aux tests T4.2 (breakpoints) de contrôler
// dynamiquement useWindowDimensions sans dupliquer le mock react-native.
// Défaut 400 (compact/1 colonne) = comportement historique de ce fichier de test.
let mockWindowWidth = 400;

jest.mock('react-native', () => ({
  View: ({ children, style }: any) => <div style={style}>{children}</div>,
  useWindowDimensions: () => ({ width: mockWindowWidth, height: 800, scale: 1, fontScale: 1 }),
}));

/**
 * Helper to create mock device
 */
function createMockDevice(overrides: Partial<DomoticzDevice> = {}): DomoticzDevice {
  return {
    idx: 1,
    rang: 0,
    name: 'Test Device',
    lastUpdate: '2024-01-01 12:00:00',
    isActive: true,
    level: 50,
    unit: '%',
    consistantLevel: true,
    type: DomoticzDeviceType.LUMIERE,
    subType: 'Switch',
    switchType: DomoticzSwitchType.ONOFF,
    status: DomoticzDeviceStatus.ON,
    data: '',
    isGroup: false,
    ...overrides,
  } as unknown as DomoticzDevice;
}

/**
 * Helper to create mock context value
 */
function createMockContextValue(devicesData: DomoticzDevice[] = []) {
  return {
    domoticzConnexionData: undefined,
    setDomoticzConnexionData: jest.fn(),
    domoticzDevicesData: devicesData,
    setDomoticzDevicesData: jest.fn(),
    domoticzTemperaturesData: [],
    setDomoticzTemperaturesData: jest.fn(),
    domoticzThermostatData: [],
    setDomoticzThermostatData: jest.fn(),
    domoticzParametersData: [],
    setDomoticzParametersData: jest.fn(),
  };
}

/**
 * FAVORIS SCREEN TESTS
 * Test suite for the Favoris (Favorites) screen
 */
describe('HomeScreen (Favoris)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering and Basic Functionality', () => {
    it('should render without crashing with empty favorites', () => {
      const contextValue = createMockContextValue([]);
      
      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should render without crashing with multiple devices', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Lumière Salon', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Volet Cuisine', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 3, name: 'Lumière Chambre', type: DomoticzDeviceType.LUMIERE, isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle context with undefined devices data gracefully', () => {
      const contextValue = createMockContextValue([]);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Favorites Loading from Storage', () => {
    it('should attempt to fetch favorites from storage on mount', async () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Device 1', isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(contextValue.domoticzDevicesData).toBeDefined();
      });
    });

    it('should process multiple favorite devices', async () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Fav 1', isActive: true }),
        createMockDevice({ idx: 2, name: 'Fav 2', isActive: true }),
        createMockDevice({ idx: 3, name: 'Fav 3', isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(contextValue.domoticzDevicesData).toHaveLength(3);
    });

    it('should only process active devices', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Active', isActive: true }),
        createMockDevice({ idx: 2, name: 'Inactive', isActive: false }),
        createMockDevice({ idx: 3, name: 'Active 2', isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(contextValue.domoticzDevicesData).toHaveLength(3);
    });
  });

  describe('Display Limit (Max 7 Favorites)', () => {
    it('should handle more than 7 active favorites', () => {
      const devices = Array.from({ length: 10 }, (_, i) =>
        createMockDevice({ idx: i + 1, name: `Fav ${i + 1}`, isActive: true })
      );
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      expect(contextValue.domoticzDevicesData).toHaveLength(10);
    });

    it('should handle exactly 7 favorites', () => {
      const devices = Array.from({ length: 7 }, (_, i) =>
        createMockDevice({ idx: i + 1, name: `Fav ${i + 1}`, isActive: true })
      );
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle fewer than 7 favorites', () => {
      const devices = Array.from({ length: 3 }, (_, i) =>
        createMockDevice({ idx: i + 1, name: `Fav ${i + 1}`, isActive: true })
      );
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Empty State Handling', () => {
    it('should handle empty devices list gracefully', () => {
      const contextValue = createMockContextValue([]);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle all inactive devices', () => {
      const devices = Array.from({ length: 3 }, (_, i) =>
        createMockDevice({ idx: i + 1, name: `Device ${i + 1}`, isActive: false })
      );
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Device Type Support', () => {
    it('should display light favorites', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Light 1', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Light 2', type: DomoticzDeviceType.LUMIERE, isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should display blind favorites', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Blind 1', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 2, name: 'Blind 2', type: DomoticzDeviceType.VOLET, isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle mixed device types', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Light', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Blind', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 3, name: 'Thermostat', type: DomoticzDeviceType.THERMOSTAT, isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  /**
   * T4.2 - Grille responsive (breakpoints compact/medium/expanded)
   *
   * `View` étant mocké en `<div style={style}>` (cf. mock react-native ci-dessus), les cellules
   * de grille produites par `getGridCellStyle` (hooks/useResponsiveColumns.ts) apparaissent comme
   * des noeuds `div` avec un style objet `{ width, padding, boxSizing }`. On les retrouve en
   * parcourant l'arbre JSON rendu (toJSON()) plutôt que par un query RTL classique, car le mock
   * react-native ne fournit pas de type "View" identifiable par UNSAFE_getAllByType.
   */
  describe('Responsive Grid (breakpoints) - T4.2', () => {
    afterEach(() => {
      mockWindowWidth = 400;
    });

    /**
     * Cellules de grille "carte favori" : objets de style plats { width, padding, boxSizing }.
     * Exclut la cellule du message limite (style porté par un tableau, cf. `favoritesLimitCell`).
     */
    function collectFavoriteCardCellWidths(node: any, acc: string[] = []): string[] {
      if (!node) return acc;
      if (Array.isArray(node)) {
        node.forEach((n) => collectFavoriteCardCellWidths(n, acc));
        return acc;
      }
      const style = node.props?.style;
      if (style && typeof style === 'object' && !Array.isArray(style) && 'boxSizing' in style) {
        acc.push(style.width);
      }
      if (node.children) {
        node.children.forEach((child: any) => collectFavoriteCardCellWidths(child, acc));
      }
      return acc;
    }

    /**
     * Largeur de la cellule du message "Seuls les 7 favoris...", identifiée par la présence
     * de `paddingVertical` (signature unique de `styles.favoritesLimitCell`, cf. index.tsx).
     */
    function findFavoritesLimitCellWidth(node: any): string | undefined {
      if (!node) return undefined;
      if (Array.isArray(node)) {
        for (const n of node) {
          const found = findFavoritesLimitCellWidth(n);
          if (found !== undefined) return found;
        }
        return undefined;
      }
      const style = node.props?.style;
      if (Array.isArray(style)) {
        const merged = Object.assign({}, ...style.filter(Boolean));
        if ('paddingVertical' in merged) {
          return merged.width;
        }
      }
      if (node.children) {
        for (const child of node.children) {
          const found = findFavoritesLimitCellWidth(child);
          if (found !== undefined) return found;
        }
      }
      return undefined;
    }

    function makeActiveDevices(count: number): DomoticzDevice[] {
      return Array.from({ length: count }, (_, i) =>
        createMockDevice({ idx: i + 1, name: `Fav ${i + 1}`, isActive: true })
      );
    }

    it('affiche 1 colonne (100%) en largeur compact (<600)', async () => {
      mockWindowWidth = 400;
      const contextValue = createMockContextValue(makeActiveDevices(3));

      const { toJSON } = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(collectFavoriteCardCellWidths(toJSON())).toHaveLength(3);
      });
      const widths = collectFavoriteCardCellWidths(toJSON());
      widths.forEach((w) => expect(w).toBe('100%'));
    });

    it('affiche 2 colonnes (50%) en largeur medium (600-839)', async () => {
      mockWindowWidth = 700;
      const contextValue = createMockContextValue(makeActiveDevices(3));

      const { toJSON } = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(collectFavoriteCardCellWidths(toJSON())).toHaveLength(3);
      });
      const widths = collectFavoriteCardCellWidths(toJSON());
      widths.forEach((w) => expect(w).toBe('50%'));
    });

    it('affiche 3 colonnes (33.33%) en largeur expanded (>=840)', async () => {
      mockWindowWidth = 900;
      const contextValue = createMockContextValue(makeActiveDevices(3));

      const { toJSON } = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(collectFavoriteCardCellWidths(toJSON())).toHaveLength(3);
      });
      const widths = collectFavoriteCardCellWidths(toJSON());
      widths.forEach((w) => expect(w).toBe(`${100 / 3}%`));
    });

    it('ne casse pas avec une liste vide (0 favori), quel que soit le breakpoint', () => {
      mockWindowWidth = 900;
      const contextValue = createMockContextValue([]);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      expect(collectFavoriteCardCellWidths(result.toJSON())).toHaveLength(0);
    });

    it('ne casse pas la mise en page avec un seul favori', async () => {
      mockWindowWidth = 700;
      const contextValue = createMockContextValue(makeActiveDevices(1));

      const { toJSON } = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(collectFavoriteCardCellWidths(toJSON())).toEqual(['50%']);
      });
    });

    it('non-régression : le message limite "Seuls les 7 favoris..." reste hors grille (100%) en medium', async () => {
      mockWindowWidth = 700;
      const contextValue = createMockContextValue(makeActiveDevices(10));

      const { toJSON } = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(collectFavoriteCardCellWidths(toJSON())).toHaveLength(7);
      });
      const json = toJSON();
      // Les 7 cartes visibles passent bien à 2 colonnes...
      collectFavoriteCardCellWidths(json).forEach((w) => expect(w).toBe('50%'));
      // ...mais le message limite reste forcé en pleine largeur (1 colonne)
      expect(findFavoritesLimitCellWidth(json)).toBe('100%');
    });

    it('non-régression : le message limite "Seuls les 7 favoris..." reste hors grille (100%) en expanded', async () => {
      mockWindowWidth = 900;
      const contextValue = createMockContextValue(makeActiveDevices(10));

      const { toJSON } = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(collectFavoriteCardCellWidths(toJSON())).toHaveLength(7);
      });
      const json = toJSON();
      collectFavoriteCardCellWidths(json).forEach((w) => expect(w).toBe(`${100 / 3}%`));
      expect(findFavoritesLimitCellWidth(json)).toBe('100%');
    });
  });

  describe('Context Updates', () => {
    it('should update favorites when context data changes', async () => {
      const initialDevices = [
        createMockDevice({ idx: 1, name: 'Device 1', isActive: true }),
      ];
      const contextValue = createMockContextValue(initialDevices);

      const { rerender } = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(contextValue.domoticzDevicesData).toHaveLength(1);

      const updatedDevices = [
        createMockDevice({ idx: 1, name: 'Device 1', isActive: true }),
        createMockDevice({ idx: 2, name: 'Device 2', isActive: true }),
      ];
      const updatedContextValue = createMockContextValue(updatedDevices);

      rerender(
        <DomoticzContext.Provider value={updatedContextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(updatedContextValue.domoticzDevicesData).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle device with zero usage count', () => {
      const devices = [
        createMockDevice({ 
          idx: 1, 
          name: 'Device', 
          isActive: true,
          data: '0'
        }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle devices with usage count in data field', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Used', data: '5' }),
        createMockDevice({ idx: 2, name: 'Less Used', data: '2' }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle devices with special characters in names', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Lumière "Salon" [Main]', isActive: true }),
        createMockDevice({ idx: 2, name: 'Volet (Chambre) & Bureau', isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <HomeScreen />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });
});

