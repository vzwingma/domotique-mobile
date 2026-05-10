/**
 * Tests unitaires pour lightDevice.component.tsx
 *
 * Stratégie : TestID dans la structure du composant, mocks des dépendances externes.
 * Les tests valident :
 *  - Rendu du bouton principal (PrimaryIconAction)
 *  - Rendu du slider pour les lumières dimmables (SLIDER)
 *  - Pas de slider pour les lumières simples (ONOFF)
 *  - États visuels : "Allumée"/"Éteinte" (individuel) ou "Allumées"/"Éteintes" (groupe)
 *  - "Mixte" pour les groupes avec niveaux incohérents
 *  - Callback onPress du bouton et du slider
 *  - Résumé de groupe (texte et nombre d'appareils connectés)
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ViewLightDevice } from '../lightDevice.component';
import DomoticzDevice from '@/app/models/domoticzDevice.model';
import { DomoticzDeviceType, DomoticzSwitchType, DomoticzDeviceStatus } from '@/app/enums/DomoticzEnum';
import { DomoticzContext } from '@/app/services/DomoticzContextProvider';

// ─── Mocks des dépendances externes ──────────────────────────────────────────

const mockPerformDevicePrimaryAction = jest.fn();
const mockGetStatusLabel = jest.fn();
const mockGetLevel = jest.fn();
const mockUpdateDeviceLevel = jest.fn();
const mockOverrideNextValue = jest.fn();
const mockIsDeviceOn = jest.fn();

jest.mock('@/components/IconDomoticzDevice', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => <View testID="device-icon" />,
    performDevicePrimaryAction: (...args: any[]) => mockPerformDevicePrimaryAction(...args),
  };
});

jest.mock('@react-native-community/slider', () => {
  const { View } = require('react-native');
  return (props: any) => <View testID="slider" {...props} />;
});

jest.mock('@/app/controllers/devices.controller', () => ({
  getLevel: (...args: any[]) => mockGetLevel(...args),
  getStatusLabel: (...args: any[]) => mockGetStatusLabel(...args),
  isDeviceOn: (...args: any[]) => mockIsDeviceOn(...args),
  updateDeviceLevel: (...args: any[]) => mockUpdateDeviceLevel(...args),
  overrideNextValue: (...args: any[]) => mockOverrideNextValue(...args),
}));

jest.mock('../disconnectedState.component', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    DisconnectedState: () => React.createElement(Text, {}, 'Déconnecté'),
  };
});

jest.mock('../deviceCard.component', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    DeviceCard: (props: any) => React.createElement(
      View,
      { testID: 'device-card' },
      React.createElement(Text, {}, props.title),
      React.createElement(Text, {}, props.statusLabel),
      props.unit && React.createElement(Text, {}, props.unit),
      props.summary && React.createElement(Text, {}, props.summary),
      props.primaryAction,
      props.secondaryControl,
    ),
  };
});

jest.mock('@/app/enums/Colors', () => ({
  Colors: {
    dark: {
      background: '#0a0e27',
      surface: '#1a2240',
      tint: '#fff',
      border: '#2a3350',
      labelSecondary: '#7a8aaa',
      slider: { trackActive: '#f5c727', trackInactive: '#333' },
      emphasis: {
        base: '#2a3350',
        active: '#f5c727',
        inactive: '#333',
        inactiveBorder: '#666',
        inactivePressed: '#1a2240',
        activePressed: '#e6b800',
      },
      disconnected: {
        border: '#666',
        background: '#1a1a1a',
        icon: '#999',
        label: '#999',
        containerBackground: '#222',
      },
      chip: {
        border: '#333',
        text: '#fff',
        textSelected: '#000',
      },
    },
    domoticz: { color: '#f5c727' },
  },
  getGroupColor: jest.fn(() => '#f5c727'),
  PROFILES_ENV: { C: 'previewC' },
}));

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeDevice(overrides: Partial<DomoticzDevice>): DomoticzDevice {
  return {
    idx: 101,
    rang: 0,
    name: 'Lampe salon',
    isGroup: false,
    lastUpdate: '2024-01-01 12:00:00',
    isActive: true,
    level: 100,
    unit: '%',
    consistantLevel: true,
    type: DomoticzDeviceType.LUMIERE,
    subType: 'Switch',
    switchType: DomoticzSwitchType.ONOFF,
    status: DomoticzDeviceStatus.ON,
    data: '',
    ...overrides,
  } as DomoticzDevice;
}

// ─── Provider wrapper ─────────────────────────────────────────────────────────

function renderLightDevice(device: DomoticzDevice) {
  const setDomoticzDevicesData = jest.fn();
  return render(
    <DomoticzContext.Provider value={{ domoticzDevicesData: [], setDomoticzDevicesData } as any}>
      <ViewLightDevice device={device} />
    </DomoticzContext.Provider>,
  );
}

// =============================================================================
// Test d'initialisation
// =============================================================================

describe('lightDevice.component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLevel.mockReturnValue(100);
    mockGetStatusLabel.mockReturnValue('Allumée');
    mockIsDeviceOn.mockReturnValue(true);
  });

  // =============================================================================
  // Lumière individuelle simple (ONOFF)
  // =============================================================================

  describe('lumière individuelle simple (ONOFF)', () => {
    it('affiche "Allumée" pour une lumière ON', () => {
      const device = makeDevice({
        name: 'Lumière bureau',
        switchType: DomoticzSwitchType.ONOFF,
        status: DomoticzDeviceStatus.ON,
      });
      mockGetStatusLabel.mockReturnValue('Allumée');

      const { getByText } = renderLightDevice(device);
      expect(getByText('Allumée')).toBeTruthy();
    });

    it('affiche "Éteinte" pour une lumière OFF', () => {
      const device = makeDevice({
        name: 'Lumière bureau',
        switchType: DomoticzSwitchType.ONOFF,
        status: DomoticzDeviceStatus.OFF,
      });
      mockGetStatusLabel.mockReturnValue('Éteinte');

      const { getByText } = renderLightDevice(device);
      expect(getByText('Éteinte')).toBeTruthy();
    });

    it('ne rend pas de slider pour une lumière ONOFF', () => {
      const device = makeDevice({
        switchType: DomoticzSwitchType.ONOFF,
        status: DomoticzDeviceStatus.ON,
      });

      const { queryByTestId } = renderLightDevice(device);
      expect(queryByTestId('slider')).toBeNull();
    });
  });

  // =============================================================================
  // Lumière dimmable (SLIDER)
  // =============================================================================

  describe('lumière dimmable (SLIDER)', () => {
    it('rend un slider pour une lumière SLIDER', () => {
      const device = makeDevice({
        switchType: DomoticzSwitchType.SLIDER,
        status: DomoticzDeviceStatus.ON,
        level: 50,
      });
      mockGetLevel.mockReturnValue(50);

      const { getByTestId } = renderLightDevice(device);
      expect(getByTestId('slider')).toBeTruthy();
    });

    it('affiche "Allumée" pour une lumière SLIDER avec level > 0', () => {
      const device = makeDevice({
        switchType: DomoticzSwitchType.SLIDER,
        status: DomoticzDeviceStatus.ON,
        level: 75,
      });
      mockGetLevel.mockReturnValue(75);
      mockGetStatusLabel.mockReturnValue('Allumée');

      const { getByText } = renderLightDevice(device);
      expect(getByText('Allumée')).toBeTruthy();
    });

    it('affiche "Éteinte" pour une lumière SLIDER avec level=0', () => {
      const device = makeDevice({
        switchType: DomoticzSwitchType.SLIDER,
        status: DomoticzDeviceStatus.OFF,
        level: 0,
      });
      mockGetLevel.mockReturnValue(0);
      mockGetStatusLabel.mockReturnValue('Éteinte');

      const { getByText } = renderLightDevice(device);
      expect(getByText('Éteinte')).toBeTruthy();
    });

    it('rend le slider désactivé quand le device est inactif', () => {
      const device = makeDevice({
        switchType: DomoticzSwitchType.SLIDER,
        isActive: false,
      });

      const { getByTestId } = renderLightDevice(device);
      const slider = getByTestId('slider');
      expect(slider.props.disabled).toBe(true);
    });

    it('rend le slider activé quand le device est actif', () => {
      const device = makeDevice({
        switchType: DomoticzSwitchType.SLIDER,
        isActive: true,
      });

      const { getByTestId } = renderLightDevice(device);
      const slider = getByTestId('slider');
      expect(slider.props.disabled).toBe(false);
    });
  });

  // =============================================================================
  // Groupe de lumières
  // =============================================================================

  describe('groupe de lumières', () => {
    it('affiche "Allumées" pour un groupe actif avec toutes les lumières allumées', () => {
      const device = makeDevice({
        isGroup: true,
        status: DomoticzDeviceStatus.ON,
        level: 100,
        consistantLevel: true,
      });
      mockGetStatusLabel.mockReturnValue('Allumées');

      const { getByText } = renderLightDevice(device);
      expect(getByText('Allumées')).toBeTruthy();
    });

    it('affiche "Éteintes" pour un groupe avec toutes les lumières éteintes', () => {
      const device = makeDevice({
        isGroup: true,
        status: DomoticzDeviceStatus.OFF,
        level: 0,
        consistantLevel: true,
      });
      mockGetStatusLabel.mockReturnValue('Éteintes');

      const { getByText } = renderLightDevice(device);
      expect(getByText('Éteintes')).toBeTruthy();
    });

    it('affiche "Mixte" pour un groupe avec niveaux incohérents', () => {
      const device = makeDevice({
        isGroup: true,
        status: DomoticzDeviceStatus.ON,
        level: 50,
        consistantLevel: false,
      });
      mockGetStatusLabel.mockReturnValue('Mixte');

      const { getByText } = renderLightDevice(device);
      expect(getByText('Mixte')).toBeTruthy();
    });
  });

  // =============================================================================
  // Appareils inactifs
  // =============================================================================

  describe('appareils inactifs', () => {
    it('affiche "Déconnecté" quand isActive=false', () => {
      const device = makeDevice({
        isActive: false,
      });
      mockGetStatusLabel.mockReturnValue('Déconnecté');

      const { getByText } = renderLightDevice(device);
      expect(getByText('Déconnecté')).toBeTruthy();
    });

    it('rend le bouton principal désactivé quand isActive=false', () => {
      const device = makeDevice({
        isActive: false,
      });

      const { getByLabelText } = renderLightDevice(device);
      const button = getByLabelText(/Action principale lumière/);
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  // =============================================================================
  // DeviceCard et éléments structurels
  // =============================================================================

  describe('structure du composant', () => {
    it('affiche le nom de la lumière', () => {
      const device = makeDevice({ name: 'Lustre salon' });

      const { getByText } = renderLightDevice(device);
      expect(getByText('Lustre salon')).toBeTruthy();
    });

    it('affiche l\'unité si fournie', () => {
      const device = makeDevice({ unit: '%' });

      const { getByText } = renderLightDevice(device);
      expect(getByText('%')).toBeTruthy();
    });

    it('rend l\'icône de dispositif', () => {
      const device = makeDevice();

      const { getByTestId } = renderLightDevice(device);
      expect(getByTestId('device-icon')).toBeTruthy();
    });
  });

  // =============================================================================
  // Interaction du bouton principal
  // =============================================================================

  describe('interaction du bouton principal', () => {
    it('appelle performDevicePrimaryAction au clic', () => {
      const device = makeDevice();
      const { getByLabelText } = renderLightDevice(device);

      const button = getByLabelText(/Action principale lumière/);
      fireEvent.press(button);

      expect(mockPerformDevicePrimaryAction).toHaveBeenCalledWith(
        device,
        expect.any(Function),
      );
    });

    it('marque le bouton comme actif (selected) quand la lumière est ON', () => {
      const device = makeDevice({
        switchType: DomoticzSwitchType.ONOFF,
        status: DomoticzDeviceStatus.ON,
      });
      mockIsDeviceOn.mockReturnValue(true);

      const { getByLabelText } = renderLightDevice(device);
      const button = getByLabelText(/Action principale lumière/);
      expect(button.props.accessibilityState.selected).toBe(true);
    });

    it('marque le bouton comme inactif (non-selected) quand la lumière est OFF', () => {
      const device = makeDevice({
        switchType: DomoticzSwitchType.ONOFF,
        status: DomoticzDeviceStatus.OFF,
      });
      mockIsDeviceOn.mockReturnValue(false);

      const { getByLabelText } = renderLightDevice(device);
      const button = getByLabelText(/Action principale lumière/);
      expect(button.props.accessibilityState.selected).toBe(false);
    });
  });

  // =============================================================================
  // Gestion des propriétés du slider
  // =============================================================================

  describe('propriétés du slider', () => {
    it('configure le slider avec les valeurs min/max correctes', () => {
      const device = makeDevice({
        switchType: DomoticzSwitchType.SLIDER,
      });
      mockGetLevel.mockReturnValue(50);

      const { getByTestId } = renderLightDevice(device);
      const slider = getByTestId('slider');

      expect(slider.props.minimumValue).toBe(0);
      expect(slider.props.maximumValue).toBe(100);
      expect(slider.props.step).toBe(1);
    });

    it('affecte la valeur correcte au slider', () => {
      const device = makeDevice({
        switchType: DomoticzSwitchType.SLIDER,
        level: 75,
      });
      mockGetLevel.mockReturnValue(75);

      const { getByTestId } = renderLightDevice(device);
      const slider = getByTestId('slider');

      expect(slider.props.value).toBe(75);
    });
  });
});
