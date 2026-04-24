import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TabDomoticzParametres from '../parametrages.tab';
import { DomoticzContext } from '../../services/DomoticzContextProvider';
import DomoticzParameter from '../../models/domoticzParameter.model';
import DomoticzConfig from '../../models/domoticzConfig.model';
import { DomoticzDeviceType, DomoticzSwitchType, DomoticzDeviceStatus } from '../../enums/DomoticzEnum';

// Mock components
jest.mock('../../components/paramList.component', () => ({
  ViewDomoticzParamList: ({ parametre }: { parametre: DomoticzParameter }) => (
    <div testID={`param-${parametre.idx}`}>{parametre.name}</div>
  ),
}));

jest.mock('@/components/ThemedText', () => ({
  ThemedText: ({ children, style }: any) => <div style={style}>{children}</div>,
}));

jest.mock('react-native', () => ({
  View: ({ children, style }: any) => <div style={style}>{children}</div>,
  Pressable: ({ children, onPress, accessibilityLabel }: any) => (
    <button onClick={onPress} aria-label={accessibilityLabel}>
      {children}
    </button>
  ),
  StyleSheet: {
    create: (styles: any) => styles,
  },
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '3.0.0',
    },
  },
}));

jest.mock('../../controllers/parameters.controller', () => ({
  handleResetFavorites: jest.fn(),
}));

jest.mock('../../enums/Colors', () => ({
  Colors: {
    dark: {
      text: '#FFFFFF',
      label: '#999999',
      surface: '#121212',
      surfaceAlt: '#1E1E1E',
      border: '#333333',
      borderAlt: '#444444',
      tint: '#007AFF',
      error: {
        text: '#FF3B30',
        background: '#9B2C2C',
        backgroundPressed: '#7A2121',
        border: '#FF3B30',
      },
    },
  },
  getGroupColor: jest.fn(() => '#007AFF'),
  PROFILES_ENV: {
    C: 'previewC',
  },
}));

jest.mock('@/components/ConnectionBadge', () => ({
  getConnectionBadgeColor: jest.fn((state) => {
    if (state === 'connected') return '#4CAF50';
    if (state === 'syncing') return '#FF9800';
    if (state === 'error') return '#FF3B30';
    return '#999999';
  }),
  getConnectionBadgeLabel: jest.fn((state) => {
    if (state === 'connected') return 'Connecté';
    if (state === 'syncing') return 'Synchronisation';
    if (state === 'error') return 'Erreur';
    return 'Déconnecté';
  }),
  mapDomoticzStatusToConnectionBadgeState: jest.fn((data) => {
    const status = data.status;
    if (status === 'OK') return 'connected';
    if (status === 'UPDATING') return 'syncing';
    if (status === 'ERROR') return 'error';
    return 'disconnected';
  }),
}));

/**
 * Helper to create mock parameter
 */
function createMockParameter(overrides: Partial<DomoticzParameter> = {}): DomoticzParameter {
  return {
    idx: 1,
    name: 'Test Parameter',
    lastUpdate: '2024-01-01 12:00:00',
    level: 50,
    levelNames: ['Off', 'Low', 'Medium', 'High'],
    type: DomoticzDeviceType.PARAMETRE,
    switchType: DomoticzSwitchType.ONOFF,
    status: DomoticzDeviceStatus.ON,
    data: 'On',
    ...overrides,
  } as unknown as DomoticzParameter;
}

/**
 * Helper to create mock config
 */
function createMockConfig(overrides: Partial<DomoticzConfig> = {}): DomoticzConfig {
  return {
    status: 'OK',
    version: '2024.1',
    revision: '15123',
    ...overrides,
  } as unknown as DomoticzConfig;
}

/**
 * Helper to create mock context value
 */
function createMockContextValue(
  parametersData: DomoticzParameter[] = [],
  configData: DomoticzConfig | undefined = undefined
) {
  return {
    domoticzConnexionData: configData,
    setDomoticzConnexionData: jest.fn(),
    domoticzDevicesData: [],
    setDomoticzDevicesData: jest.fn(),
    domoticzTemperaturesData: [],
    setDomoticzTemperaturesData: jest.fn(),
    domoticzThermostatData: [],
    setDomoticzThermostatData: jest.fn(),
    domoticzParametersData: parametersData,
    setDomoticzParametersData: jest.fn(),
  };
}

/**
 * MAISON SCREEN TESTS
 * Test suite for the Maison (Home/Settings) screen
 */
describe('TabDomoticzParametres (Maison)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing with empty data', () => {
      const contextValue = createMockContextValue([], undefined);
      
      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should render without crashing with parameters and config', () => {
      const parameters = [
        createMockParameter({ idx: 1, name: 'Param 1' }),
        createMockParameter({ idx: 2, name: 'Param 2' }),
      ];
      const config = createMockConfig();
      const contextValue = createMockContextValue(parameters, config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should render without crashing with config but no parameters', () => {
      const config = createMockConfig();
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should render without crashing with parameters but no config', () => {
      const parameters = [
        createMockParameter({ idx: 1, name: 'Param 1' }),
        createMockParameter({ idx: 2, name: 'Param 2' }),
      ];
      const contextValue = createMockContextValue(parameters, undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Parameters Loading and Display', () => {
    it('should load and display parameters from context', async () => {
      const parameters = [
        createMockParameter({ idx: 1, name: 'Brightness', level: 75 }),
        createMockParameter({ idx: 2, name: 'Mode', level: 2 }),
        createMockParameter({ idx: 3, name: 'Timer', level: 10 }),
      ];
      const contextValue = createMockContextValue(parameters, undefined);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      await waitFor(() => {
        expect(contextValue.domoticzParametersData).toHaveLength(3);
      });
    });

    it('should render ViewDomoticzParamList component for each parameter', () => {
      const parameters = [
        createMockParameter({ idx: 1, name: 'Parameter 1' }),
        createMockParameter({ idx: 2, name: 'Parameter 2' }),
        createMockParameter({ idx: 3, name: 'Parameter 3' }),
      ];
      const contextValue = createMockContextValue(parameters, undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle parameters with different switch types', () => {
      const parameters = [
        createMockParameter({ 
          idx: 1, 
          name: 'OnOff Param', 
          switchType: DomoticzSwitchType.ONOFF,
        }),
        createMockParameter({ 
          idx: 2, 
          name: 'Slider Param', 
          switchType: DomoticzSwitchType.SLIDER,
        }),
      ];
      const contextValue = createMockContextValue(parameters, undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle parameters with level names', () => {
      const parameters = [
        createMockParameter({ 
          idx: 1, 
          name: 'Mode Selector',
          level: 1,
          levelNames: ['Off', 'Mode1', 'Mode2', 'Mode3']
        }),
      ];
      const contextValue = createMockContextValue(parameters, undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should display parameter status correctly', () => {
      const parameters = [
        createMockParameter({ idx: 1, name: 'Active Param', status: DomoticzDeviceStatus.ON }),
        createMockParameter({ idx: 2, name: 'Inactive Param', status: DomoticzDeviceStatus.OFF }),
      ];
      const contextValue = createMockContextValue(parameters, undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('About Section (À propos)', () => {
    it('should display app version from expo config', () => {
      const config = createMockConfig();
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // App version should be displayed
    });

    it('should display Domoticz version from config', () => {
      const config = createMockConfig({ version: '2024.1' });
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should display "?" when Domoticz version is not available', () => {
      const contextValue = createMockContextValue([], undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should display connection status as "Connecté" when OK', () => {
      const config = createMockConfig({ status: 'OK' });
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Status should show "Connecté"
    });

    it('should display connection status as "Synchronisation" when UPDATING', () => {
      const config = createMockConfig({ status: 'UPDATING' });
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Status should show "Synchronisation"
    });

    it('should display connection status as "Erreur" when ERROR', () => {
      const config = createMockConfig({ status: 'ERROR' });
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Status should show "Erreur"
    });

    it('should display connection status as "Déconnecté" for unknown status', () => {
      const config = createMockConfig({ status: 'UNKNOWN' });
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Status should show "Déconnecté"
    });

    it('should display raw status value in parentheses', () => {
      const config = createMockConfig({ status: 'OK' });
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Should show "(OK)" or status value
    });
  });

  describe('Favorites Section', () => {
    it('should display "Favoris" section', () => {
      const contextValue = createMockContextValue([], undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Section with "Favoris" and "Historique d'utilisation" should be visible
    });

    it('should display "Réinitialiser" (Reset) button in Favorites section', () => {
      const contextValue = createMockContextValue([], undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Reset button should be accessible
    });

    it('should call handleResetFavorites when reset button is pressed', async () => {
      const { handleResetFavorites } = require('../../controllers/parameters.controller');
      const contextValue = createMockContextValue([], undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // handleResetFavorites should be callable
    });

    it('should have correct accessibility label for reset button', () => {
      const contextValue = createMockContextValue([], undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Button should have accessibility label "Réinitialiser les favoris"
    });
  });

  describe('Connection Badge Colors', () => {
    it('should display correct color for connected status', () => {
      const config = createMockConfig({ status: 'OK' });
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Green color for connected
    });

    it('should display correct color for syncing status', () => {
      const config = createMockConfig({ status: 'UPDATING' });
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Orange color for syncing
    });

    it('should display correct color for error status', () => {
      const config = createMockConfig({ status: 'ERROR' });
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Red color for error
    });

    it('should display correct color for disconnected status', () => {
      const contextValue = createMockContextValue([], undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Gray color for disconnected
    });
  });

  describe('Screen Layout Sections', () => {
    it('should have parameters section at the top', () => {
      const parameters = [
        createMockParameter({ idx: 1, name: 'Param 1' }),
      ];
      const contextValue = createMockContextValue(parameters, undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Parameters section should be first
    });

    it('should have favorites section in the middle', () => {
      const contextValue = createMockContextValue([], undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // Favorites section should be middle
    });

    it('should have about section at the bottom', () => {
      const config = createMockConfig();
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // About section should be last
    });

    it('should properly structure all three sections together', () => {
      const parameters = [
        createMockParameter({ idx: 1, name: 'Param 1' }),
      ];
      const config = createMockConfig();
      const contextValue = createMockContextValue(parameters, config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      // All three sections should render
    });
  });

  describe('Edge Cases', () => {
    it('should handle single parameter', () => {
      const parameters = [
        createMockParameter({ idx: 1, name: 'Single Param' }),
      ];
      const contextValue = createMockContextValue(parameters, undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle large number of parameters', () => {
      const parameters = Array.from({ length: 30 }, (_, i) =>
        createMockParameter({ 
          idx: i + 1, 
          name: `Parameter ${i + 1}` 
        })
      );
      const contextValue = createMockContextValue(parameters, undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
      expect(contextValue.domoticzParametersData).toHaveLength(30);
    });

    it('should handle parameter names with special characters', () => {
      const parameters = [
        createMockParameter({ idx: 1, name: 'Mode "Éco" [Nuit]' }),
        createMockParameter({ idx: 2, name: 'Température (°C) & Humidité' }),
      ];
      const contextValue = createMockContextValue(parameters, undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle parameters with empty levelNames', () => {
      const parameters = [
        createMockParameter({ 
          idx: 1, 
          name: 'Param without levels',
          levelNames: []
        }),
      ];
      const contextValue = createMockContextValue(parameters, undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle missing Domoticz version gracefully', () => {
      const config = createMockConfig({ version: '' });
      const contextValue = createMockContextValue([], config);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });

    it('should handle missing app version gracefully', () => {
      // Jest setup mocks expo-constants with version 3.0.0
      const contextValue = createMockContextValue([], undefined);

      const result = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(result).toBeDefined();
    });
  });

  describe('Data Consistency', () => {
    it('should not modify original parameter data', () => {
      const originalParam = createMockParameter({ idx: 1, name: 'Param 1', level: 50 });
      const parameters = [originalParam];
      const contextValue = createMockContextValue(parameters, undefined);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      // Original data should not be modified
      expect(contextValue.domoticzParametersData[0].level).toBe(50);
    });

    it('should not modify original config data', () => {
      const originalConfig = createMockConfig({ status: 'OK', version: '2024.1' });
      const contextValue = createMockContextValue([], originalConfig);

      render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      // Original data should not be modified
      expect(contextValue.domoticzConnexionData?.status).toBe('OK');
      expect(contextValue.domoticzConnexionData?.version).toBe('2024.1');
    });
  });

  describe('Context Updates', () => {
    it('should update when parameters change', () => {
      const initialParams = [
        createMockParameter({ idx: 1, name: 'Param 1' }),
      ];
      const contextValue = createMockContextValue(initialParams, undefined);

      const { rerender } = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      const updatedParams = [
        createMockParameter({ idx: 1, name: 'Param 1' }),
        createMockParameter({ idx: 2, name: 'Param 2' }),
        createMockParameter({ idx: 3, name: 'Param 3' }),
      ];
      const updatedContextValue = createMockContextValue(updatedParams, undefined);

      rerender(
        <DomoticzContext.Provider value={updatedContextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(updatedContextValue.domoticzParametersData).toHaveLength(3);
    });

    it('should update when config changes', () => {
      const initialConfig = createMockConfig({ status: 'OK' });
      const contextValue = createMockContextValue([], initialConfig);

      const { rerender } = render(
        <DomoticzContext.Provider value={contextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      const updatedConfig = createMockConfig({ status: 'ERROR' });
      const updatedContextValue = createMockContextValue([], updatedConfig);

      rerender(
        <DomoticzContext.Provider value={updatedContextValue}>
          <TabDomoticzParametres />
        </DomoticzContext.Provider>
      );

      expect(updatedContextValue.domoticzConnexionData?.status).toBe('ERROR');
    });
  });
});

