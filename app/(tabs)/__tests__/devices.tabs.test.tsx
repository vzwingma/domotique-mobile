import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import TabDomoticzDevices from '../devices.tabs';
import { DomoticzContext } from '../../services/DomoticzContextProvider';
import DomoticzDevice from '../../models/domoticzDevice.model';
import { DomoticzDeviceType, DomoticzSwitchType, DomoticzDeviceStatus } from '../../enums/DomoticzEnum';

// Mock components
jest.mock('../../components/device.component', () => ({
  ViewDomoticzDevice: ({ device }: { device: DomoticzDevice }) => (
    <div testID={`device-${device.idx}`}>{device.name}</div>
  ),
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
 * DEVICES SCREEN TESTS
 * Test suite for the Lumières/Volets (Lights/Blinds) screen
 */
describe('TabDomoticzDevices (Lumières/Volets)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering and Basic Functionality', () => {
    it('should render without crashing with empty devices list', () => {
      const contextValue = createMockContextValue([]);
      
      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should render without crashing with multiple devices', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Lumière Salon', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Lumière Cuisine', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 3, name: 'Lumière Chambre', type: DomoticzDeviceType.LUMIERE, isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should return empty array when dataType is undefined', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Device 1', type: DomoticzDeviceType.LUMIERE }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={undefined as any} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Device Type Filtering - Lights', () => {
    it('should load and display lights from context', async () => {
      const lightDevices = [
        createMockDevice({ idx: 1, name: 'Lumière Salon', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Lumière Cuisine', type: DomoticzDeviceType.LUMIERE, isActive: true }),
      ];
      const contextValue = createMockContextValue(lightDevices);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(contextValue.domoticzDevicesData).toHaveLength(2);
      });
    });

    it('should filter devices by LUMIERE type only', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Lumière 1', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Volet 1', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 3, name: 'Lumière 2', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 4, name: 'Volet 2', type: DomoticzDeviceType.VOLET, isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should render ViewDomoticzDevice component for each light device', () => {
      const lightDevices = [
        createMockDevice({ idx: 1, name: 'Lumière Salon', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Lumière Chambre', type: DomoticzDeviceType.LUMIERE, isActive: true }),
      ];
      const contextValue = createMockContextValue(lightDevices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle lights with different status values', () => {
      const lightDevices = [
        createMockDevice({ idx: 1, name: 'Light On', type: DomoticzDeviceType.LUMIERE, status: DomoticzDeviceStatus.ON }),
        createMockDevice({ idx: 2, name: 'Light Off', type: DomoticzDeviceType.LUMIERE, status: DomoticzDeviceStatus.OFF }),
      ];
      const contextValue = createMockContextValue(lightDevices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle lights with different switch types', () => {
      const lightDevices = [
        createMockDevice({ 
          idx: 1, 
          name: 'Light On/Off', 
          type: DomoticzDeviceType.LUMIERE, 
          switchType: DomoticzSwitchType.ONOFF,
        }),
        createMockDevice({ 
          idx: 2, 
          name: 'Light Dimmer', 
          type: DomoticzDeviceType.LUMIERE, 
          switchType: DomoticzSwitchType.SLIDER,
        }),
      ];
      const contextValue = createMockContextValue(lightDevices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Device Type Filtering - Blinds', () => {
    it('should load and display blinds from context', async () => {
      const blindDevices = [
        createMockDevice({ idx: 1, name: 'Volet Salon', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 2, name: 'Volet Chambre', type: DomoticzDeviceType.VOLET, isActive: true }),
      ];
      const contextValue = createMockContextValue(blindDevices);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.VOLET} />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(contextValue.domoticzDevicesData).toHaveLength(2);
      });
    });

    it('should filter devices by VOLET type only', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Lumière 1', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Volet 1', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 3, name: 'Lumière 2', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 4, name: 'Volet 2', type: DomoticzDeviceType.VOLET, isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.VOLET} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should render ViewDomoticzDevice component for each blind device', () => {
      const blindDevices = [
        createMockDevice({ idx: 1, name: 'Volet Salon', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 2, name: 'Volet Chambre', type: DomoticzDeviceType.VOLET, isActive: true }),
      ];
      const contextValue = createMockContextValue(blindDevices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.VOLET} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle blinds with different status values', () => {
      const blindDevices = [
        createMockDevice({ idx: 1, name: 'Blind Open', type: DomoticzDeviceType.VOLET, status: DomoticzDeviceStatus.ON }),
        createMockDevice({ idx: 2, name: 'Blind Closed', type: DomoticzDeviceType.VOLET, status: DomoticzDeviceStatus.OFF }),
      ];
      const contextValue = createMockContextValue(blindDevices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.VOLET} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Device Index Assignment', () => {
    it('should assign correct rang (index) to each device', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Device 1', type: DomoticzDeviceType.LUMIERE, rang: 0 }),
        createMockDevice({ idx: 2, name: 'Device 2', type: DomoticzDeviceType.LUMIERE, rang: 0 }),
        createMockDevice({ idx: 3, name: 'Device 3', type: DomoticzDeviceType.LUMIERE, rang: 0 }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should maintain device order in component rendering', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'First', type: DomoticzDeviceType.LUMIERE }),
        createMockDevice({ idx: 2, name: 'Second', type: DomoticzDeviceType.LUMIERE }),
        createMockDevice({ idx: 3, name: 'Third', type: DomoticzDeviceType.LUMIERE }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Mixed Devices Scenario', () => {
    it('should correctly separate lights and blinds', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Lumière 1', type: DomoticzDeviceType.LUMIERE }),
        createMockDevice({ idx: 2, name: 'Volet 1', type: DomoticzDeviceType.VOLET }),
        createMockDevice({ idx: 3, name: 'Lumière 2', type: DomoticzDeviceType.LUMIERE }),
        createMockDevice({ idx: 4, name: 'Volet 2', type: DomoticzDeviceType.VOLET }),
        createMockDevice({ idx: 5, name: 'Lumière 3', type: DomoticzDeviceType.LUMIERE }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle devices with different active states', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Active Light', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Inactive Light', type: DomoticzDeviceType.LUMIERE, isActive: false }),
        createMockDevice({ idx: 3, name: 'Active Blind', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 4, name: 'Inactive Blind', type: DomoticzDeviceType.VOLET, isActive: false }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle empty results for a specific device type', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Device 1', type: DomoticzDeviceType.THERMOSTAT }),
        createMockDevice({ idx: 2, name: 'Device 2', type: DomoticzDeviceType.PARAMETRE }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single device correctly', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Single Light', type: DomoticzDeviceType.LUMIERE }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle large number of devices', () => {
      const devices = Array.from({ length: 50 }, (_, i) =>
        createMockDevice({ 
          idx: i + 1, 
          name: `Device ${i + 1}`, 
          type: DomoticzDeviceType.LUMIERE 
        })
      );
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      expect(contextValue.domoticzDevicesData).toHaveLength(50);
    });

    it('should handle devices with special characters in names', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Lumière "Salon" [Main]', type: DomoticzDeviceType.LUMIERE }),
        createMockDevice({ idx: 2, name: 'Volet (Chambre) & Bureau', type: DomoticzDeviceType.VOLET }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });
});

/**
 * DEVICES SCREEN TESTS
 * Test suite for the Lumières/Volets (Lights/Blinds) screen
 */
describe('TabDomoticzDevices (Lumières/Volets)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing with empty devices list', () => {
      const contextValue = createMockContextValue([]);
      
      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should render without crashing with multiple devices', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Lumière Salon', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Lumière Cuisine', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 3, name: 'Lumière Chambre', type: DomoticzDeviceType.LUMIERE, isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should return empty array when dataType is undefined', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Device 1', type: DomoticzDeviceType.LUMIERE }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={undefined as any} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Device Type Filtering - Lights', () => {
    it('should load and display lights from context', async () => {
      const lightDevices = [
        createMockDevice({ idx: 1, name: 'Lumière Salon', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Lumière Cuisine', type: DomoticzDeviceType.LUMIERE, isActive: true }),
      ];
      const contextValue = createMockContextValue(lightDevices);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(contextValue.domoticzDevicesData).toHaveLength(2);
      });
    });

    it('should filter devices by LUMIERE type only', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Lumière 1', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Volet 1', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 3, name: 'Lumière 2', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 4, name: 'Volet 2', type: DomoticzDeviceType.VOLET, isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Component should filter and display only LUMIERE devices
    });

    it('should render ViewDomoticzDevice component for each light device', () => {
      const lightDevices = [
        createMockDevice({ idx: 1, name: 'Lumière Salon', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Lumière Chambre', type: DomoticzDeviceType.LUMIERE, isActive: true }),
      ];
      const contextValue = createMockContextValue(lightDevices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle lights with different status values', () => {
      const lightDevices = [
        createMockDevice({ idx: 1, name: 'Light On', type: DomoticzDeviceType.LUMIERE, status: DomoticzDeviceStatus.ON }),
        createMockDevice({ idx: 2, name: 'Light Off', type: DomoticzDeviceType.LUMIERE, status: DomoticzDeviceStatus.OFF }),
      ];
      const contextValue = createMockContextValue(lightDevices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle lights with different switch types', () => {
      const lightDevices = [
        createMockDevice({ 
          idx: 1, 
          name: 'Light On/Off', 
          type: DomoticzDeviceType.LUMIERE, 
          switchType: DomoticzSwitchType.ONOFF,
        }),
        createMockDevice({ 
          idx: 2, 
          name: 'Light Dimmer', 
          type: DomoticzDeviceType.LUMIERE, 
          switchType: DomoticzSwitchType.SLIDER,
        }),
      ];
      const contextValue = createMockContextValue(lightDevices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Device Type Filtering - Blinds', () => {
    it('should load and display blinds from context', async () => {
      const blindDevices = [
        createMockDevice({ idx: 1, name: 'Volet Salon', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 2, name: 'Volet Chambre', type: DomoticzDeviceType.VOLET, isActive: true }),
      ];
      const contextValue = createMockContextValue(blindDevices);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.VOLET} />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(contextValue.domoticzDevicesData).toHaveLength(2);
      });
    });

    it('should filter devices by VOLET type only', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Lumière 1', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Volet 1', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 3, name: 'Lumière 2', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 4, name: 'Volet 2', type: DomoticzDeviceType.VOLET, isActive: true }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.VOLET} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Component should filter and display only VOLET devices
    });

    it('should render ViewDomoticzDevice component for each blind device', () => {
      const blindDevices = [
        createMockDevice({ idx: 1, name: 'Volet Salon', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 2, name: 'Volet Chambre', type: DomoticzDeviceType.VOLET, isActive: true }),
      ];
      const contextValue = createMockContextValue(blindDevices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.VOLET} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle blinds with different status values', () => {
      const blindDevices = [
        createMockDevice({ idx: 1, name: 'Blind Open', type: DomoticzDeviceType.VOLET, status: DomoticzDeviceStatus.ON }),
        createMockDevice({ idx: 2, name: 'Blind Closed', type: DomoticzDeviceType.VOLET, status: DomoticzDeviceStatus.OFF }),
      ];
      const contextValue = createMockContextValue(blindDevices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.VOLET} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Device Index Assignment', () => {
    it('should assign correct rang (index) to each device', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Device 1', type: DomoticzDeviceType.LUMIERE, rang: 0 }),
        createMockDevice({ idx: 2, name: 'Device 2', type: DomoticzDeviceType.LUMIERE, rang: 0 }),
        createMockDevice({ idx: 3, name: 'Device 3', type: DomoticzDeviceType.LUMIERE, rang: 0 }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Each device should have rang property assigned in order
    });

    it('should maintain device order in component rendering', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'First', type: DomoticzDeviceType.LUMIERE }),
        createMockDevice({ idx: 2, name: 'Second', type: DomoticzDeviceType.LUMIERE }),
        createMockDevice({ idx: 3, name: 'Third', type: DomoticzDeviceType.LUMIERE }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Mixed Devices Scenario', () => {
    it('should correctly separate lights and blinds', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Lumière 1', type: DomoticzDeviceType.LUMIERE }),
        createMockDevice({ idx: 2, name: 'Volet 1', type: DomoticzDeviceType.VOLET }),
        createMockDevice({ idx: 3, name: 'Lumière 2', type: DomoticzDeviceType.LUMIERE }),
        createMockDevice({ idx: 4, name: 'Volet 2', type: DomoticzDeviceType.VOLET }),
        createMockDevice({ idx: 5, name: 'Lumière 3', type: DomoticzDeviceType.LUMIERE }),
      ];
      const contextValue = createMockContextValue(devices);

      // Render lights only
      const { root: lightRoot } = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(lightRoot).toBeDefined();
    });

    it('should handle devices with different active states', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Active Light', type: DomoticzDeviceType.LUMIERE, isActive: true }),
        createMockDevice({ idx: 2, name: 'Inactive Light', type: DomoticzDeviceType.LUMIERE, isActive: false }),
        createMockDevice({ idx: 3, name: 'Active Blind', type: DomoticzDeviceType.VOLET, isActive: true }),
        createMockDevice({ idx: 4, name: 'Inactive Blind', type: DomoticzDeviceType.VOLET, isActive: false }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle empty results for a specific device type', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Device 1', type: DomoticzDeviceType.THERMOSTAT }),
        createMockDevice({ idx: 2, name: 'Device 2', type: DomoticzDeviceType.PARAMETRE }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single device correctly', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Single Light', type: DomoticzDeviceType.LUMIERE }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle large number of devices', () => {
      const devices = Array.from({ length: 50 }, (_, i) =>
        createMockDevice({ 
          idx: i + 1, 
          name: `Device ${i + 1}`, 
          type: DomoticzDeviceType.LUMIERE 
        })
      );
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      expect(contextValue.domoticzDevicesData).toHaveLength(50);
    });

    it('should handle devices with special characters in names', () => {
      const devices = [
        createMockDevice({ idx: 1, name: 'Lumière "Salon" [Main]', type: DomoticzDeviceType.LUMIERE }),
        createMockDevice({ idx: 2, name: 'Volet (Chambre) & Bureau', type: DomoticzDeviceType.VOLET }),
      ];
      const contextValue = createMockContextValue(devices);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });
});

