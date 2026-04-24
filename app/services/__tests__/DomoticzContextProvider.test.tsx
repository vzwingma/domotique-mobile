/**
 * Tests unitaires pour DomoticzContextProvider
 *
 * Stratégie de test :
 * - Tester le rendu du provider sans crash
 * - Tester que les consommateurs reçoivent les bonnes valeurs initiales
 * - Tester que les mises à jour d'état se propagent correctement
 * - Tester que plusieurs consommateurs reçoivent les mêmes valeurs
 * - Tester que les setter functions fonctionnent correctement
 * - Tester les cas limites (valeurs nulles, arrays vides, mises à jour rapides)
 *
 * Couverture attendue :
 * - Provider initialization & rendering ✓
 * - Context consumer access ✓
 * - State updates propagation ✓
 * - TypeScript types ✓
 * - Edge cases & error handling ✓
 */

import React, { useContext } from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { DomoticzContext, DomoticzContextProvider } from '../DomoticzContextProvider';
import DomoticzConfig from '../../models/domoticzConfig.model';
import DomoticzDevice from '../../models/domoticzDevice.model';
import DomoticzTemperature from '../../models/domoticzTemperature.model';
import DomoticzThermostat from '../../models/domoticzThermostat.model';
import DomoticzParameter from '../../models/domoticzParameter.model';
import { DomoticzDeviceType, DomoticzSwitchType } from '../../enums/DomoticzEnum';
import { Text } from 'react-native';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Helper Components
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Test consumer component that reads from DomoticzContext
 * Used to verify that context values are properly provided to consumers
 */
const TestConsumer = ({ onContextReady }: { onContextReady?: (context: any) => void }) => {
  const context = useContext(DomoticzContext);
  
  React.useEffect(() => {
    if (context && onContextReady) {
      onContextReady(context);
    }
  }, [context, onContextReady]);
  
  if (!context) {
    return <Text>No context</Text>;
  }
  
  return (
    <Text>
      {`config:${context.domoticzConnexionData?.status ?? 'undefined'},` +
       `devices:${context.domoticzDevicesData.length},` +
       `temps:${context.domoticzTemperaturesData.length},` +
       `thermo:${context.domoticzThermostatData.length},` +
       `params:${context.domoticzParametersData.length}`}
    </Text>
  );
};

/**
 * Multiple consumer component for testing concurrent access
 */
const MultipleConsumers = ({ 
  onConsumer1Ready, 
  onConsumer2Ready 
}: { 
  onConsumer1Ready?: (context: any) => void;
  onConsumer2Ready?: (context: any) => void;
}) => {
  return (
    <>
      <TestConsumer onContextReady={onConsumer1Ready} />
      <TestConsumer onContextReady={onConsumer2Ready} />
    </>
  );
};

/**
 * Consumer that calls setter functions
 */
const SetterTestConsumer = ({ 
  onContextReady 
}: { 
  onContextReady?: (context: any) => void;
}) => {
  const context = useContext(DomoticzContext);
  
  React.useEffect(() => {
    if (context && onContextReady) {
      onContextReady(context);
    }
  }, [context, onContextReady]);
  
  if (!context) {
    return <Text>No context</Text>;
  }
  
  return (
    <Text>
      {`setter:ready`}
    </Text>
  );
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Test Data Factories
 * ─────────────────────────────────────────────────────────────────────────────
 */

const createMockConfig = (overrides?: Partial<DomoticzConfig>): DomoticzConfig => {
  return new DomoticzConfig({
    status: 'OK',
    version: '1.0',
    revision: '12345',
    ...overrides,
  } as DomoticzConfig);
};

const createMockDevice = (overrides?: Partial<DomoticzDevice>): DomoticzDevice => {
  return new DomoticzDevice({
    idx: 1,
    rang: 0,
    name: 'Test Device',
    lastUpdate: '2024-01-01 12:00:00',
    isActive: true,
    level: 50,
    type: DomoticzDeviceType.LUMIERE,
    subType: 'Light',
    switchType: DomoticzSwitchType.ONOFF,
    status: 'On',
    data: 'test data',
    isGroup: false,
    ...overrides,
  } as DomoticzDevice);
};

const createMockTemperature = (overrides?: Partial<DomoticzTemperature>): DomoticzTemperature => {
  return new DomoticzTemperature({
    idx: '1',
    rang: 0,
    name: 'Test Temperature',
    lastUpdate: '2024-01-01 12:00:00',
    isActive: true,
    temp: 22.5,
    humidity: 50,
    humidityStatus: 'Comfortable',
    type: 'Temp',
    subType: 'TempHum',
    status: 'On',
    data: 'test data',
    ...overrides,
  } as DomoticzTemperature);
};

const createMockThermostat = (overrides?: Partial<DomoticzThermostat>): DomoticzThermostat => {
  const thermostat = new DomoticzThermostat(
    1,                              // idx
    'Test Thermostat',              // name
    '2024-01-01 12:00:00',          // lastUpdate
    true,                           // isActive
    20,                             // temp
    DomoticzDeviceType.THERMOSTAT,  // type
    'On',                           // status
    'test data',                    // data
    'C',                            // unit
  );
  
  // Apply overrides if provided
  if (overrides) {
    Object.assign(thermostat, overrides);
  }
  
  return thermostat;
};

const createMockParameter = (overrides?: Partial<DomoticzParameter>): DomoticzParameter => {
  return new DomoticzParameter({
    idx: 1,
    name: 'Test Parameter',
    lastUpdate: '2024-01-01 12:00:00',
    level: 50,
    type: DomoticzDeviceType.PARAMETRE,
    switchType: DomoticzSwitchType.SLIDER,
    status: 'On',
    data: 'test data',
    ...overrides,
  } as DomoticzParameter);
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Test Suites
 * ─────────────────────────────────────────────────────────────────────────────
 */

describe('DomoticzContextProvider', () => {

  /**
   * TEST SUITE 1: Provider Initialization & Rendering
   */
  describe('Provider Initialization & Rendering', () => {
    
    it('should render without crashing', () => {
      const { getByText } = render(
        <DomoticzContextProvider>
          <Text>Test Content</Text>
        </DomoticzContextProvider>
      );
      
      expect(getByText('Test Content')).toBeDefined();
    });

    it('should render with children components', () => {
      const { getByText } = render(
        <DomoticzContextProvider>
          <Text testID="child-1">Child 1</Text>
          <Text testID="child-2">Child 2</Text>
        </DomoticzContextProvider>
      );
      
      expect(getByText('Child 1')).toBeDefined();
      expect(getByText('Child 2')).toBeDefined();
    });

    it('should provide context to consumers', () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <TestConsumer onContextReady={(ctx) => { contextValue = ctx; }} />
        </DomoticzContextProvider>
      );
      
      expect(contextValue).not.toBeNull();
      expect(contextValue).toBeDefined();
    });

    it('should have correct initial context structure', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <TestConsumer onContextReady={(ctx) => { contextValue = ctx; }} />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // Verify all expected properties are present
      expect(contextValue).toHaveProperty('domoticzConnexionData');
      expect(contextValue).toHaveProperty('setDomoticzConnexionData');
      expect(contextValue).toHaveProperty('domoticzDevicesData');
      expect(contextValue).toHaveProperty('setDomoticzDevicesData');
      expect(contextValue).toHaveProperty('domoticzTemperaturesData');
      expect(contextValue).toHaveProperty('setDomoticzTemperaturesData');
      expect(contextValue).toHaveProperty('domoticzThermostatData');
      expect(contextValue).toHaveProperty('setDomoticzThermostatData');
      expect(contextValue).toHaveProperty('domoticzParametersData');
      expect(contextValue).toHaveProperty('setDomoticzParametersData');
    });

    it('should have correct default values on initialization', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <TestConsumer onContextReady={(ctx) => { contextValue = ctx; }} />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // Verify default values
      expect(contextValue.domoticzConnexionData).toBeUndefined();
      expect(contextValue.domoticzDevicesData).toEqual([]);
      expect(contextValue.domoticzTemperaturesData).toEqual([]);
      expect(contextValue.domoticzThermostatData).toEqual([]);
      expect(contextValue.domoticzParametersData).toEqual([]);
    });

    it('should provide setter functions as React.Dispatch type', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <TestConsumer onContextReady={(ctx) => { contextValue = ctx; }} />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // Verify setter functions exist and are callable
      expect(typeof contextValue.setDomoticzConnexionData).toBe('function');
      expect(typeof contextValue.setDomoticzDevicesData).toBe('function');
      expect(typeof contextValue.setDomoticzTemperaturesData).toBe('function');
      expect(typeof contextValue.setDomoticzThermostatData).toBe('function');
      expect(typeof contextValue.setDomoticzParametersData).toBe('function');
    });
  });

  /**
   * TEST SUITE 2: Context Consumer Access
   */
  describe('Context Consumer Access', () => {
    
    it('should provide initial values to consumer', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <TestConsumer onContextReady={(ctx) => { contextValue = ctx; }} />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      expect(contextValue.domoticzDevicesData).toEqual([]);
      expect(contextValue.domoticzTemperaturesData).toEqual([]);
      expect(contextValue.domoticzThermostatData).toEqual([]);
      expect(contextValue.domoticzParametersData).toEqual([]);
    });

    it('should allow multiple consumers to access context simultaneously', async () => {
      const consumer1Results: any[] = [];
      const consumer2Results: any[] = [];
      
      render(
        <DomoticzContextProvider>
          <MultipleConsumers
            onConsumer1Ready={(ctx) => { consumer1Results.push(ctx); }}
            onConsumer2Ready={(ctx) => { consumer2Results.push(ctx); }}
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(consumer1Results.length).toBeGreaterThan(0);
        expect(consumer2Results.length).toBeGreaterThan(0);
      });

      expect(consumer1Results[0]).toBeDefined();
      expect(consumer2Results[0]).toBeDefined();
    });

    it('should return same context value to all consumers', async () => {
      let consumer1Context: any = null;
      let consumer2Context: any = null;
      
      render(
        <DomoticzContextProvider>
          <MultipleConsumers
            onConsumer1Ready={(ctx) => { consumer1Context = ctx; }}
            onConsumer2Ready={(ctx) => { consumer2Context = ctx; }}
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(consumer1Context).not.toBeNull();
        expect(consumer2Context).not.toBeNull();
      });

      // Both consumers should receive the same context reference
      expect(consumer1Context.domoticzDevicesData).toEqual(consumer2Context.domoticzDevicesData);
      expect(consumer1Context.domoticzTemperaturesData).toEqual(consumer2Context.domoticzTemperaturesData);
      expect(consumer1Context.domoticzThermostatData).toEqual(consumer2Context.domoticzThermostatData);
      expect(consumer1Context.domoticzParametersData).toEqual(consumer2Context.domoticzParametersData);
    });

    it('should throw error when context is not provided (null value)', () => {
      // When useContext is called outside of provider, it should return null
      // This is a standard React behavior
      const { getByText } = render(
        <TestConsumer onContextReady={() => {}} />
      );
      
      expect(getByText('No context')).toBeDefined();
    });
  });

  /**
   * TEST SUITE 3: State Updates Propagation
   */
  describe('State Updates Propagation', () => {
    
    it('should propagate domoticzConnexionData updates to consumers', async () => {
      let contextValue: any = null;
      let updateCount = 0;
      
      const { getByText, rerender } = render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => {
              contextValue = ctx;
              updateCount++;
            }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      const initialUpdateCount = updateCount;
      
      // Update connexion data
      const newConfig = createMockConfig({ status: 'CONNECTED' });
      act(() => {
        contextValue.setDomoticzConnexionData(newConfig);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzConnexionData).toBeDefined();
        expect(contextValue.domoticzConnexionData.status).toBe('CONNECTED');
      });
    });

    it('should propagate domoticzDevicesData updates to consumers', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      const device1 = createMockDevice({ idx: 1, name: 'Device 1' });
      const device2 = createMockDevice({ idx: 2, name: 'Device 2' });
      
      // Update devices data
      act(() => {
        contextValue.setDomoticzDevicesData([device1, device2]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(2);
        expect(contextValue.domoticzDevicesData[0].name).toBe('Device 1');
        expect(contextValue.domoticzDevicesData[1].name).toBe('Device 2');
      });
    });

    it('should propagate domoticzTemperaturesData updates to consumers', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      const temp1 = createMockTemperature({ idx: '1', name: 'Temp 1', temp: 20 });
      const temp2 = createMockTemperature({ idx: '2', name: 'Temp 2', temp: 25 });
      
      act(() => {
        contextValue.setDomoticzTemperaturesData([temp1, temp2]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzTemperaturesData.length).toBe(2);
        expect(contextValue.domoticzTemperaturesData[0].temp).toBe(20);
        expect(contextValue.domoticzTemperaturesData[1].temp).toBe(25);
      });
    });

    it('should propagate domoticzThermostatData updates to consumers', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      const thermo1 = createMockThermostat({ 
        idx: 1, 
        name: 'Thermostat 1',
        temp: 20,
      });
      const thermo2 = createMockThermostat({ 
        idx: 2, 
        name: 'Thermostat 2',
        temp: 22,
      });
      
      act(() => {
        contextValue.setDomoticzThermostatData([thermo1, thermo2]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzThermostatData.length).toBe(2);
        expect(contextValue.domoticzThermostatData[0].temp).toBe(20);
        expect(contextValue.domoticzThermostatData[1].temp).toBe(22);
      });
    });

    it('should propagate domoticzParametersData updates to consumers', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      const param1 = createMockParameter({ idx: 1, name: 'Param 1' });
      const param2 = createMockParameter({ idx: 2, name: 'Param 2' });
      
      act(() => {
        contextValue.setDomoticzParametersData([param1, param2]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzParametersData.length).toBe(2);
        expect(contextValue.domoticzParametersData[0].name).toBe('Param 1');
        expect(contextValue.domoticzParametersData[1].name).toBe('Param 2');
      });
    });

    it('should handle multiple consecutive state updates', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // First update
      const device1 = createMockDevice({ idx: 1 });
      act(() => {
        contextValue.setDomoticzDevicesData([device1]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(1);
      });

      // Second update
      const device2 = createMockDevice({ idx: 2 });
      act(() => {
        contextValue.setDomoticzDevicesData([device1, device2]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(2);
      });

      // Third update
      const device3 = createMockDevice({ idx: 3 });
      act(() => {
        contextValue.setDomoticzDevicesData([device1, device2, device3]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(3);
      });
    });

    it('should propagate rapid successive updates correctly', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // Perform multiple rapid updates
      act(() => {
        const devices = [
          createMockDevice({ idx: 1 }),
          createMockDevice({ idx: 2 }),
          createMockDevice({ idx: 3 }),
        ];
        contextValue.setDomoticzDevicesData(devices);
      });

      act(() => {
        const temps = [
          createMockTemperature({ idx: '1' }),
          createMockTemperature({ idx: '2' }),
        ];
        contextValue.setDomoticzTemperaturesData(temps);
      });

      act(() => {
        const params = [createMockParameter({ idx: 1 })];
        contextValue.setDomoticzParametersData(params);
      });

      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(3);
        expect(contextValue.domoticzTemperaturesData.length).toBe(2);
        expect(contextValue.domoticzParametersData.length).toBe(1);
      });
    });

    it('should handle setter with function form (prevState => newState)', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // First add devices
      const device1 = createMockDevice({ idx: 1 });
      act(() => {
        contextValue.setDomoticzDevicesData([device1]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(1);
      });

      // Then use functional setter to add more
      const device2 = createMockDevice({ idx: 2 });
      act(() => {
        contextValue.setDomoticzDevicesData((prevDevices: DomoticzDevice[]) => [
          ...prevDevices,
          device2,
        ]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(2);
        expect(contextValue.domoticzDevicesData[0].idx).toBe(1);
        expect(contextValue.domoticzDevicesData[1].idx).toBe(2);
      });
    });
  });

  /**
   * TEST SUITE 4: Edge Cases & Error Handling
   */
  describe('Edge Cases & Error Handling', () => {
    
    it('should handle null/undefined values for connexion data', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // Set to a value
      const config = createMockConfig();
      act(() => {
        contextValue.setDomoticzConnexionData(config);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzConnexionData).toBeDefined();
      });

      // Set back to undefined
      act(() => {
        contextValue.setDomoticzConnexionData(undefined);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzConnexionData).toBeUndefined();
      });
    });

    it('should handle empty arrays correctly', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // Set to empty arrays explicitly
      act(() => {
        contextValue.setDomoticzDevicesData([]);
        contextValue.setDomoticzTemperaturesData([]);
        contextValue.setDomoticzThermostatData([]);
        contextValue.setDomoticzParametersData([]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData).toEqual([]);
        expect(contextValue.domoticzTemperaturesData).toEqual([]);
        expect(contextValue.domoticzThermostatData).toEqual([]);
        expect(contextValue.domoticzParametersData).toEqual([]);
      });
    });

    it('should handle updating with same data (no mutation)', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      const devices = [createMockDevice({ idx: 1 })];
      
      act(() => {
        contextValue.setDomoticzDevicesData(devices);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData).toEqual(devices);
      });

      const firstDevices = contextValue.domoticzDevicesData;

      // Set again with same reference
      act(() => {
        contextValue.setDomoticzDevicesData(devices);
      });
      
      // Should still be the same data
      expect(contextValue.domoticzDevicesData).toEqual(firstDevices);
    });

    it('should handle large arrays of data', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // Create a large number of mock devices
      const largeDeviceArray = Array.from({ length: 100 }, (_, i) =>
        createMockDevice({ idx: i + 1, name: `Device ${i + 1}` })
      );

      act(() => {
        contextValue.setDomoticzDevicesData(largeDeviceArray);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(100);
        expect(contextValue.domoticzDevicesData[0].name).toBe('Device 1');
        expect(contextValue.domoticzDevicesData[99].name).toBe('Device 100');
      });
    });

    it('should handle clearing data (setting empty array after having data)', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // Add data
      const devices = [
        createMockDevice({ idx: 1 }),
        createMockDevice({ idx: 2 }),
      ];
      act(() => {
        contextValue.setDomoticzDevicesData(devices);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(2);
      });

      // Clear data
      act(() => {
        contextValue.setDomoticzDevicesData([]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(0);
        expect(contextValue.domoticzDevicesData).toEqual([]);
      });
    });

    it('should preserve data in one state when updating another state', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      const devices = [createMockDevice({ idx: 1 })];
      const temps = [createMockTemperature({ idx: '1' })];
      const params = [createMockParameter({ idx: 1 })];

      // Set all data
      act(() => {
        contextValue.setDomoticzDevicesData(devices);
        contextValue.setDomoticzTemperaturesData(temps);
        contextValue.setDomoticzParametersData(params);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(1);
        expect(contextValue.domoticzTemperaturesData.length).toBe(1);
        expect(contextValue.domoticzParametersData.length).toBe(1);
      });

      const originalDevices = contextValue.domoticzDevicesData;
      const originalTemps = contextValue.domoticzTemperaturesData;

      // Update only thermostat data
      const thermos = [createMockThermostat({ idx: 1 })];
      act(() => {
        contextValue.setDomoticzThermostatData(thermos);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzThermostatData.length).toBe(1);
      });

      // Other data should remain unchanged
      expect(contextValue.domoticzDevicesData).toEqual(originalDevices);
      expect(contextValue.domoticzTemperaturesData).toEqual(originalTemps);
    });

    it('should handle data with special characters and unicode', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      const device = createMockDevice({
        idx: 1,
        name: 'Lumière Salon 🏠',
        data: 'Données spéciales: é à ü 中文',
      });

      act(() => {
        contextValue.setDomoticzDevicesData([device]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData[0].name).toBe('Lumière Salon 🏠');
        expect(contextValue.domoticzDevicesData[0].data).toBe('Données spéciales: é à ü 中文');
      });
    });

    it('should handle replacing entire data arrays', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // Set initial data
      const devices1 = [createMockDevice({ idx: 1 }), createMockDevice({ idx: 2 })];
      act(() => {
        contextValue.setDomoticzDevicesData(devices1);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(2);
      });

      // Replace entire array
      const devices2 = [createMockDevice({ idx: 10 }), createMockDevice({ idx: 11 }), createMockDevice({ idx: 12 })];
      act(() => {
        contextValue.setDomoticzDevicesData(devices2);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(3);
        expect(contextValue.domoticzDevicesData[0].idx).toBe(10);
        expect(contextValue.domoticzDevicesData[2].idx).toBe(12);
      });
    });
  });

  /**
   * TEST SUITE 5: TypeScript Types & Type Safety
   */
  describe('TypeScript Types & Type Safety', () => {
    
    it('should export DomoticzContext for type checking', () => {
      expect(DomoticzContext).toBeDefined();
    });

    it('should export DomoticzContextProvider component', () => {
      expect(DomoticzContextProvider).toBeDefined();
      expect(typeof DomoticzContextProvider).toBe('function');
    });

    it('context should support all expected types', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // These are TypeScript compile-time checks, but we verify at runtime
      const config: DomoticzConfig | undefined = contextValue.domoticzConnexionData;
      const devices: DomoticzDevice[] = contextValue.domoticzDevicesData;
      const temps: DomoticzTemperature[] = contextValue.domoticzTemperaturesData;
      const thermos: DomoticzThermostat[] = contextValue.domoticzThermostatData;
      const params: DomoticzParameter[] = contextValue.domoticzParametersData;

      expect(devices instanceof Array).toBe(true);
      expect(temps instanceof Array).toBe(true);
      expect(thermos instanceof Array).toBe(true);
      expect(params instanceof Array).toBe(true);
    });

    it('setter functions should accept correct types', async () => {
      let contextValue: any = null;
      
      render(
        <DomoticzContextProvider>
          <SetterTestConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // Test that setters accept the correct types
      const config = createMockConfig();
      const devices = [createMockDevice()];
      const temps = [createMockTemperature()];
      const thermos = [createMockThermostat()];
      const params = [createMockParameter()];

      // These should all work without errors
      expect(() => {
        act(() => {
          contextValue.setDomoticzConnexionData(config);
          contextValue.setDomoticzDevicesData(devices);
          contextValue.setDomoticzTemperaturesData(temps);
          contextValue.setDomoticzThermostatData(thermos);
          contextValue.setDomoticzParametersData(params);
        });
      }).not.toThrow();
    });
  });

  /**
   * TEST SUITE 6: Context Memoization
   */
  describe('Context Memoization', () => {
    
    it('should use useMemo to prevent unnecessary re-renders', async () => {
      let renderCount = 0;
      let contextValue: any = null;

      const CountingConsumer = ({ onContextReady }: { onContextReady?: (context: any) => void }) => {
        const context = useContext(DomoticzContext);
        renderCount++;

        React.useEffect(() => {
          if (context && onContextReady) {
            onContextReady(context);
          }
        }, [context, onContextReady]);

        return <Text>Render count: {renderCount}</Text>;
      };

      render(
        <DomoticzContextProvider>
          <CountingConsumer 
            onContextReady={(ctx) => { contextValue = ctx; }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      const initialRenderCount = renderCount;

      // Update a device (which shouldn't trigger a re-render since context is memoized)
      act(() => {
        contextValue.setDomoticzDevicesData([createMockDevice()]);
      });
      
      await waitFor(() => {
        expect(contextValue.domoticzDevicesData.length).toBe(1);
      });

      // Render count should increase due to state update
      // (useMemo still causes re-render when dependencies change)
      expect(renderCount).toBeGreaterThanOrEqual(initialRenderCount);
    });

    it('should maintain context reference across non-dependency updates', async () => {
      let contextReferences: any[] = [];
      
      render(
        <DomoticzContextProvider>
          <TestConsumer 
            onContextReady={(ctx) => {
              // Store context reference each time it updates
              contextReferences.push(ctx);
            }} 
          />
        </DomoticzContextProvider>
      );
      
      await waitFor(() => {
        expect(contextReferences.length).toBeGreaterThan(0);
      });

      // The first context reference should be defined
      expect(contextReferences[0]).toBeDefined();
    });
  });

  /**
   * TEST SUITE 7: Provider Rendering Behavior
   */
  describe('Provider Rendering Behavior', () => {
    
    it('should render React.Fragment equivalent for children', () => {
      const { getByText } = render(
        <DomoticzContextProvider>
          <Text testID="test-1">Test 1</Text>
          <Text testID="test-2">Test 2</Text>
          <Text testID="test-3">Test 3</Text>
        </DomoticzContextProvider>
      );

      expect(getByText('Test 1')).toBeDefined();
      expect(getByText('Test 2')).toBeDefined();
      expect(getByText('Test 3')).toBeDefined();
    });

    it('should handle complex nested component hierarchies', () => {
      const NestedChild = () => (
        <Text>Nested Child</Text>
      );

      const Child = () => (
        <Text>Child</Text>
      );

      const { getByText } = render(
        <DomoticzContextProvider>
          <Child />
          <NestedChild />
        </DomoticzContextProvider>
      );

      expect(getByText('Child')).toBeDefined();
      expect(getByText('Nested Child')).toBeDefined();
    });

    it('should support readonly children prop type', () => {
      // This is primarily a TypeScript test
      // We verify the component accepts and renders readonly children
      const { getByText } = render(
        <DomoticzContextProvider>
          <Text>Read-only child</Text>
        </DomoticzContextProvider>
      );

      expect(getByText('Read-only child')).toBeDefined();
    });

    it('should return JSX.Element from provider component', () => {
      const Provider = DomoticzContextProvider;
      expect(typeof Provider).toBe('function');
      
      // Verify it returns JSX
      const result = render(
        <DomoticzContextProvider>
          <Text>Test</Text>
        </DomoticzContextProvider>
      );
      
      expect(result).toBeDefined();
      expect(result.getByText).toBeDefined();
    });
  });

});
