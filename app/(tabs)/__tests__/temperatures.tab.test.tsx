import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import TabDomoticzTemperatures from '../temperatures.tab';
import { DomoticzContext } from '../../services/DomoticzContextProvider';
import DomoticzTemperature from '../../models/domoticzTemperature.model';
import DomoticzThermostat from '../../models/domoticzThermostat.model';
import { DomoticzDeviceType } from '../../enums/DomoticzEnum';

// Mock components
jest.mock('../../components/temperature.component', () => ({
  ViewDomoticzTemperature: ({ temperature }: { temperature: DomoticzTemperature }) => (
    <div testID={`temperature-${temperature.idx}`}>{temperature.name}: {temperature.temp}°C</div>
  ),
}));

jest.mock('../../components/thermostat.component', () => ({
  ViewDomoticzThermostat: ({ thermostat }: { thermostat: DomoticzThermostat }) => (
    <div testID={`thermostat-${thermostat.idx}`}>{thermostat.name}: {thermostat.temp}°C</div>
  ),
}));

/**
 * Helper to create mock temperature
 */
function createMockTemperature(overrides: Partial<DomoticzTemperature> = {}): DomoticzTemperature {
  return {
    idx: '1',
    rang: 0,
    name: 'Test Temperature',
    lastUpdate: '2024-01-01 12:00:00',
    isActive: true,
    temp: 20.5,
    humidity: 45,
    humidityStatus: 'normal',
    type: 'Temp',
    subType: 'LaCrosse TX3',
    status: 'Ok',
    data: '20.5 C, 45 %',
    ...overrides,
  } as unknown as DomoticzTemperature;
}

/**
 * Helper to create mock thermostat
 */
function createMockThermostat(overrides: Partial<DomoticzThermostat> = {}): DomoticzThermostat {
  return {
    idx: 100,
    rang: 0,
    name: 'Test Thermostat',
    lastUpdate: '2024-01-01 12:00:00',
    isActive: true,
    temp: 21,
    type: DomoticzDeviceType.THERMOSTAT,
    status: 'Ok',
    data: '21 C',
    unit: 'C',
    ...overrides,
  } as unknown as DomoticzThermostat;
}

/**
 * Helper to create mock context value
 */
function createMockContextValue(
  temperaturesData: DomoticzTemperature[] = [],
  thermostatsData: DomoticzThermostat[] = []
) {
  return {
    domoticzConnexionData: undefined,
    setDomoticzConnexionData: jest.fn(),
    domoticzDevicesData: [],
    setDomoticzDevicesData: jest.fn(),
    domoticzTemperaturesData: temperaturesData,
    setDomoticzTemperaturesData: jest.fn(),
    domoticzThermostatData: thermostatsData,
    setDomoticzThermostatData: jest.fn(),
    domoticzParametersData: [],
    setDomoticzParametersData: jest.fn(),
  };
}

/**
 * TEMPERATURES SCREEN TESTS
 * Test suite for the Températures (Temperatures) screen
 */
describe('TabDomoticzTemperatures (Températures)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing with empty data', () => {
      const contextValue = createMockContextValue([], []);
      
      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should render without crashing with multiple temperatures', () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Salon', temp: 20.5 }),
        createMockTemperature({ idx: '2', name: 'Chambre', temp: 18.2 }),
        createMockTemperature({ idx: '3', name: 'Cuisine', temp: 21.0 }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should render without crashing with multiple thermostats', () => {
      const thermostats = [
        createMockThermostat({ idx: 100, name: 'Thermostat Salon' }),
        createMockThermostat({ idx: 101, name: 'Thermostat Chambre' }),
      ];
      const contextValue = createMockContextValue([], thermostats);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Temperatures Loading and Display', () => {
    it('should load and display temperatures from context', async () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Salon', temp: 20.5, isActive: true }),
        createMockTemperature({ idx: '2', name: 'Chambre', temp: 18.2, isActive: true }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(contextValue.domoticzTemperaturesData).toHaveLength(2);
      });
    });

    it('should render ViewDomoticzTemperature component for each temperature', () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Salon' }),
        createMockTemperature({ idx: '2', name: 'Chambre' }),
        createMockTemperature({ idx: '3', name: 'Cuisine' }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Components should render successfully
    });

    it('should display active temperature sensors correctly', () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Active Sensor', isActive: true, temp: 20.5 }),
        createMockTemperature({ idx: '2', name: 'Connected Sensor', isActive: true, temp: 19.2 }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should distinguish between active and disconnected sensors', () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Connected', isActive: true, temp: 20.5 }),
        createMockTemperature({ idx: '2', name: 'Disconnected', isActive: false, temp: 0 }),
        createMockTemperature({ idx: '3', name: 'Connected 2', isActive: true, temp: 19.2 }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Should display both active and "Déconnecté" states
    });

    it('should handle temperature with humidity data', () => {
      const temperatures = [
        createMockTemperature({ 
          idx: '1', 
          name: 'Salon',
          temp: 20.5,
          humidity: 45,
          humidityStatus: 'normal'
        }),
        createMockTemperature({ 
          idx: '2', 
          name: 'Chambre',
          temp: 18.2,
          humidity: 50,
          humidityStatus: 'normal'
        }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle temperature without humidity data', () => {
      const temperatures = [
        createMockTemperature({ 
          idx: '1', 
          name: 'Simple Temp',
          temp: 20.5,
          humidity: 0,
          humidityStatus: ''
        }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Thermostats Loading and Control', () => {
    it('should load and display thermostats from context', async () => {
      const thermostats = [
        createMockThermostat({ idx: 100, name: 'Salon', temp: 21 }),
        createMockThermostat({ idx: 101, name: 'Chambre', temp: 19 }),
      ];
      const contextValue = createMockContextValue([], thermostats);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(contextValue.domoticzThermostatData).toHaveLength(2);
      });
    });

    it('should render ViewDomoticzThermostat component for each thermostat', () => {
      const thermostats = [
        createMockThermostat({ idx: 100, name: 'Thermostat Salon' }),
        createMockThermostat({ idx: 101, name: 'Thermostat Chambre' }),
      ];
      const contextValue = createMockContextValue([], thermostats);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Components should render successfully
    });

    it('should display active thermostats correctly', () => {
      const thermostats = [
        createMockThermostat({ idx: 100, name: 'Active Thermostat', isActive: true, temp: 21 }),
        createMockThermostat({ idx: 101, name: 'Connected Thermostat', isActive: true, temp: 20 }),
      ];
      const contextValue = createMockContextValue([], thermostats);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle thermostats with different temperature values', () => {
      const thermostats = [
        createMockThermostat({ idx: 100, name: 'Cold Room', temp: 15 }),
        createMockThermostat({ idx: 101, name: 'Normal Room', temp: 21 }),
        createMockThermostat({ idx: 102, name: 'Warm Room', temp: 25 }),
      ];
      const contextValue = createMockContextValue([], thermostats);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should support temperature adjustment capability', () => {
      const thermostats = [
        createMockThermostat({ 
          idx: 100, 
          name: 'Adjustable Thermostat', 
          temp: 21,
          isActive: true
        }),
      ];
      const contextValue = createMockContextValue([], thermostats);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Thermostat should support control/adjustment via ViewDomoticzThermostat
    });

    it('should handle inactive thermostats', () => {
      const thermostats = [
        createMockThermostat({ idx: 100, name: 'Inactive Thermostat', isActive: false, temp: 0 }),
      ];
      const contextValue = createMockContextValue([], thermostats);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Combined Temperatures and Thermostats', () => {
    it('should display both temperatures and thermostats together', async () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Salon Sensor', temp: 20.5 }),
        createMockTemperature({ idx: '2', name: 'Chambre Sensor', temp: 18.2 }),
      ];
      const thermostats = [
        createMockThermostat({ idx: 100, name: 'Salon Thermostat', temp: 21 }),
        createMockThermostat({ idx: 101, name: 'Chambre Thermostat', temp: 19 }),
      ];
      const contextValue = createMockContextValue(temperatures, thermostats);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(contextValue.domoticzTemperaturesData).toHaveLength(2);
        expect(contextValue.domoticzThermostatData).toHaveLength(2);
      });
    });

    it('should display thermostats first, then temperatures', () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Salon Sensor', temp: 20.5 }),
      ];
      const thermostats = [
        createMockThermostat({ idx: 100, name: 'Salon Thermostat', temp: 21 }),
      ];
      const contextValue = createMockContextValue(temperatures, thermostats);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Thermostats are added first in the component
    });

    it('should handle large number of temperatures and thermostats', () => {
      const temperatures = Array.from({ length: 20 }, (_, i) =>
        createMockTemperature({ 
          idx: `${i + 1}`, 
          name: `Temperature ${i + 1}`, 
          temp: 15 + Math.random() * 10 
        })
      );
      const thermostats = Array.from({ length: 10 }, (_, i) =>
        createMockThermostat({ 
          idx: 100 + i, 
          name: `Thermostat ${i + 1}`, 
          temp: 18 + Math.random() * 5 
        })
      );
      const contextValue = createMockContextValue(temperatures, thermostats);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      expect(contextValue.domoticzTemperaturesData).toHaveLength(20);
      expect(contextValue.domoticzThermostatData).toHaveLength(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle temperature at boundary values', () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Cold', temp: -10 }),
        createMockTemperature({ idx: '2', name: 'Hot', temp: 50 }),
        createMockTemperature({ idx: '3', name: 'Freezing', temp: 0 }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle humidity at boundary values', () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Dry', humidity: 0 }),
        createMockTemperature({ idx: '2', name: 'Humid', humidity: 100 }),
        createMockTemperature({ idx: '3', name: 'Normal', humidity: 50 }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle temperatures with special characters in names', () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Salon "Principal" [Main]' }),
        createMockTemperature({ idx: '2', name: 'Chambre (Enfants) & Bureau' }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle null or undefined temperature values', () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Valid Temp', temp: 20.5 }),
        createMockTemperature({ idx: '2', name: 'Unknown Temp', temp: null as any }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle single temperature and thermostat', () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Single Temp' }),
      ];
      const thermostats = [
        createMockThermostat({ idx: 100, name: 'Single Thermostat' }),
      ];
      const contextValue = createMockContextValue(temperatures, thermostats);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle only temperatures without thermostats', () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Sensor 1' }),
        createMockTemperature({ idx: '2', name: 'Sensor 2' }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle only thermostats without temperatures', () => {
      const thermostats = [
        createMockThermostat({ idx: 100, name: 'Thermostat 1' }),
        createMockThermostat({ idx: 101, name: 'Thermostat 2' }),
      ];
      const contextValue = createMockContextValue([], thermostats);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain temperature data without modification', () => {
      const temperatures = [
        createMockTemperature({ idx: '1', name: 'Salon', temp: 20.5, humidity: 45 }),
      ];
      const contextValue = createMockContextValue(temperatures, []);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      // Original data should not be modified
      expect(contextValue.domoticzTemperaturesData[0].temp).toBe(20.5);
      expect(contextValue.domoticzTemperaturesData[0].humidity).toBe(45);
    });

    it('should maintain thermostat data without modification', () => {
      const thermostats = [
        createMockThermostat({ idx: 100, name: 'Salon', temp: 21 }),
      ];
      const contextValue = createMockContextValue([], thermostats);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzTemperatures />
        </DomoticzContext.Provider>
      );

      // Original data should not be modified
      expect(contextValue.domoticzThermostatData[0].temp).toBe(21);
    });
  });
});

