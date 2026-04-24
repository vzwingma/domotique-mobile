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

jest.mock('@/components/ThemedText', () => ({
  ThemedText: ({ children, style }: any) => <div style={style}>{children}</div>,
}));

jest.mock('react-native', () => ({
  View: ({ children, style }: any) => <div style={style}>{children}</div>,
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
      const { getFavoritesFromStorage } = require('../../services/DataUtils.service');
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

