/**
 * Tests unitaires pour device.component.tsx
 *
 * Stratégie : on teste principalement la fonction getStatusLabel() via le
 * rendu complet du composant ViewDomoticzDevice.
 * Les dépendances externes (contexte, services, slider, icônes) sont mockées.
 *
 * Couvre (T06, T04, T05, T07) :
 *  - Appareil inactif → "Déconnecté"
 *  - Volet fermé (status="Off") → "Fermé"
 *  - Volet ouvert (status="On") → "Ouvert"
 *  - Lumière individuelle Off → "Éteinte"
 *  - Lumière individuelle On → "Allumé"
 *  - Groupe lumière Off → "Éteintes"
 *  - Groupe lumière On → "Allumées"
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { ViewDomoticzDevice } from '../device.component';
import DomoticzDevice from '@/app/models/domoticzDevice.model';
import { DomoticzDeviceType, DomoticzSwitchType } from '@/app/enums/DomoticzEnum';

// ─── Mocks des dépendances externes ──────────────────────────────────────────

// Contexte Domoticz
jest.mock('@/app/services/DomoticzContextProvider', () => ({
  DomoticzContext: {
    _currentValue: { setDomoticzDevicesData: jest.fn() },
    // Implémentation minimale pour useContext
    Consumer: ({ children }: any) => children({ setDomoticzDevicesData: jest.fn() }),
    Provider: ({ children }: any) => children,
  },
}));

// Contrôleur des équipements
jest.mock('@/app/controllers/devices.controller', () => ({
  updateDeviceLevel: jest.fn(),
  refreshEquipementState: jest.fn(),
  getLevel: jest.fn((device: any) => device.level ?? 0),
  overrideNextValue: jest.fn(),
  isDeviceOn: jest.fn((device: any) => {
    if (device.switchType === 'On/Off') return device.status === 'On';
    return device.status !== 'Off' && device.level > 0;
  }),
  getStatusLabel: jest.fn((device: any) => {
    if (!device.isActive) return 'Déconnecté';
    if (device.type === 'Volet') {
      if (device.status === 'Off') return 'Fermé';
      if (device.level >= 99) return 'Ouvert';
      if (device.status === 'On') return 'Ouvert';
      return 'Fermé';
    }
    if (device.isGroup) {
      if (!device.consistantLevel) return 'Mixte';
      return device.status === 'On' ? 'Allumées' : 'Éteintes';
    }
    // Lumière individuelle : variateur >= 99 → Allumée
    if (device.switchType === 'Dimmer' && device.status !== 'Off' && device.level >= 99) return 'Allumée';
    return device.status === 'On' ? 'Allumée' : 'Éteinte';
  }),
}));

// Service HTTP
jest.mock('@/app/services/ClientHTTP.service', () => ({
  default: jest.fn().mockResolvedValue({}),
}));

// Slider
jest.mock('@react-native-community/slider', () => {
  const { View } = require('react-native');
  return (props: any) => <View testID="slider" {...props} />;
});

// Icône personnalisée
jest.mock('@/components/IconDomoticzDevice', () => {
  const { View } = require('react-native');
  return (props: any) => <View testID="icon-device" />;
});

// Vecteur d'icônes (déjà dans jest.setup.ts mais on renforce)
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// ─── Factory : crée un DomoticzDevice minimal (objet littéral, pas new DomoticzDevice)
// Le constructeur de DomoticzDevice n'assigne pas `isActive` (readonly avec default false),
// donc on utilise un cast vers DomoticzDevice pour éviter ce problème.
function makeDevice(overrides: Partial<DomoticzDevice>): DomoticzDevice {
  return {
    idx: 1,
    rang: 0,
    name: 'Test Device',
    isGroup: false,
    lastUpdate: '2024-01-01',
    isActive: true,
    level: 100,
    unit: '',
    consistantLevel: true,
    type: DomoticzDeviceType.LUMIERE,
    subType: 'Switch',
    switchType: DomoticzSwitchType.ONOFF,
    status: 'On',
    data: '',
    ...overrides,
  } as DomoticzDevice;
}

// ─── Provider minimal pour DomoticzContext ────────────────────────────────────
// Utilisation directe de React.createContext pour envelopper le composant
const MockContext = React.createContext<any>({ setDomoticzDevicesData: jest.fn() });

// On re-mock DomoticzContextProvider pour utiliser notre MockContext
jest.mock('@/app/services/DomoticzContextProvider', () => {
  const React = require('react');
  const MockCtx = React.createContext({ setDomoticzDevicesData: jest.fn() });
  return { DomoticzContext: MockCtx };
});

function renderDevice(device: DomoticzDevice) {
  return render(<ViewDomoticzDevice device={device} />);
}

// =============================================================================
// QA03-1 : Appareil inactif → "Déconnecté"
// =============================================================================
describe('device.component — appareil inactif', () => {
  it('affiche "Déconnecté" quand isActive=false', () => {
    const device = makeDevice({ isActive: false });
    const { getByText } = renderDevice(device);
    expect(getByText('Déconnecté')).toBeTruthy();
  });
});

// =============================================================================
// QA03-2 : Volets
// =============================================================================
describe('device.component — volets (T07)', () => {
  it('affiche "Fermé" pour un volet avec status="Off"', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.VOLET,
      status: 'Off',
      isActive: true,
    });
    const { getByText } = renderDevice(device);
    expect(getByText('Fermé')).toBeTruthy();
  });

  it('affiche "Ouvert" pour un volet avec status="On"', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.VOLET,
      status: 'On',
      isActive: true,
    });
    const { getByText } = renderDevice(device);
    expect(getByText('Ouvert')).toBeTruthy();
  });
});

// =============================================================================
// QA03-3 : Lumières individuelles (T05)
// =============================================================================
describe('device.component — lumières individuelles (T05)', () => {
  it('affiche "Éteinte" pour une lumière Off (ONOFF)', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.LUMIERE,
      switchType: DomoticzSwitchType.ONOFF,
      isGroup: false,
      status: 'Off',
      isActive: true,
    });
    const { getByText } = renderDevice(device);
    expect(getByText('Éteinte')).toBeTruthy();
  });

  it('affiche "Allumée" pour une lumière On (ONOFF)', () => {
    const device = makeDevice({
      name: 'Lumière Salon',
      type: DomoticzDeviceType.LUMIERE,
      switchType: DomoticzSwitchType.ONOFF,
      isGroup: false,
      status: 'On',
      isActive: true,
    });
    const { getByText } = renderDevice(device);
    expect(getByText('Allumée')).toBeTruthy();
  });

  it("marque l'action principale comme active pour une lumière switch allumée", () => {
    const device = makeDevice({
      name: 'Lumière Salon',
      type: DomoticzDeviceType.LUMIERE,
      switchType: DomoticzSwitchType.ONOFF,
      isGroup: false,
      status: 'On',
      level: 0,
      isActive: true,
    });
    const { getByLabelText } = renderDevice(device);
    expect(getByLabelText('Action principale lumière Lumière Salon')).toHaveProp('accessibilityState', expect.objectContaining({ selected: true }));
  });

  it('affiche "Éteinte" pour une lumière variateur Off', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.LUMIERE,
      switchType: DomoticzSwitchType.SLIDER,
      isGroup: false,
      status: 'Off',
      level: 0,
      isActive: true,
    });
    const { getByText } = renderDevice(device);
    expect(getByText('Éteinte')).toBeTruthy();
  });
});

// =============================================================================
// QA03-4 : Groupes de lumières (T04)
// =============================================================================
describe('device.component — groupes de lumières (T04)', () => {
  it('affiche "Éteintes" pour un groupe Off', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.LUMIERE,
      isGroup: true,
      status: 'Off',
      level: 0,
      consistantLevel: true,
      isActive: true,
    });
    const { getByText } = renderDevice(device);
    expect(getByText('Éteintes')).toBeTruthy();
  });

  it('affiche "Allumées" pour un groupe On (level=100)', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.LUMIERE,
      isGroup: true,
      status: 'On',
      level: 100,
      consistantLevel: true,
      isActive: true,
    });
    const { getByText } = renderDevice(device);
    expect(getByText('Allumées')).toBeTruthy();
  });

  it('affiche "Mixte" pour un groupe avec niveau incohérent', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.LUMIERE,
      isGroup: true,
      status: 'On',
      level: 50,
      consistantLevel: false,
      isActive: true,
    });
    const { getByText } = renderDevice(device);
    expect(getByText('Mixte')).toBeTruthy();
  });
});

// =============================================================================
// QA03-5 : Slider présent pour un volet actif (pas de BlindActionsBar)
// =============================================================================
describe('device.component — slider pour les volets', () => {
  it('affiche un slider pour un volet actif (SLIDER)', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.VOLET,
      switchType: DomoticzSwitchType.SLIDER,
      status: 'Off',
      isActive: true,
    });
    const { getByTestId } = renderDevice(device);
    expect(getByTestId('slider')).toBeTruthy();
  });

  it("n'affiche pas de boutons Ouvrir/Stop/Fermer pour un volet", () => {
    const device = makeDevice({
      type: DomoticzDeviceType.VOLET,
      switchType: DomoticzSwitchType.SLIDER,
      status: 'Off',
      isActive: true,
    });
    const { queryByLabelText } = renderDevice(device);
    expect(queryByLabelText('Ouvrir le volet')).toBeNull();
    expect(queryByLabelText('Stopper le volet')).toBeNull();
    expect(queryByLabelText('Fermer le volet')).toBeNull();
  });
});

// =============================================================================
// QA03-6 : Règle level >= 99 → état plein (volet individuel et lumière variateur)
// =============================================================================
describe('device.component — niveau >= 99 → état plein', () => {
  it('affiche "Ouvert" pour un volet individuel avec level=99', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.VOLET,
      isGroup: false,
      status: '99',
      level: 99,
      isActive: true,
    });
    const { getByText } = renderDevice(device);
    expect(getByText('Ouvert')).toBeTruthy();
  });

  it('affiche "Ouvert" pour un volet individuel avec level=100 et status=On', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.VOLET,
      isGroup: false,
      status: 'On',
      level: 100,
      isActive: true,
    });
    const { getByText } = renderDevice(device);
    expect(getByText('Ouvert')).toBeTruthy();
  });

  it('affiche "Allumée" pour une lumière variateur avec level=99', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.LUMIERE,
      switchType: DomoticzSwitchType.SLIDER,
      isGroup: false,
      status: 'On',
      level: 99,
      isActive: true,
    });
    const { getByText } = renderDevice(device);
    expect(getByText('Allumée')).toBeTruthy();
  });

  it('affiche "Allumée" pour une lumière variateur avec level=100', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.LUMIERE,
      switchType: DomoticzSwitchType.SLIDER,
      isGroup: false,
      status: 'On',
      level: 100,
      isActive: true,
    });
    const { getByText } = renderDevice(device);
    expect(getByText('Allumée')).toBeTruthy();
  });
});
