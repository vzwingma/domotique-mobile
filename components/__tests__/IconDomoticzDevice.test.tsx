/**
 * Tests pour IconDomoticzDevice.tsx :
 *
 * Fonctions pures :
 *   - getLightIcon(device)
 *   - getVoletIcon(device)
 *
 * Composant IconDomoticzDevice :
 *   - handleLumierePress : clic lumière individuelle / groupe
 *   - handleVoletPress   : clic volet individuel / groupe
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

// ─── Mocks des assets PNG ──────────────────────────────────────────────────────
jest.mock('../../assets/icons/window-shutter-closed.png',           () => 'window-shutter-closed');
jest.mock('../../assets/icons/window-shutter-opened.png',           () => 'window-shutter-opened');
jest.mock('../../assets/icons/window-shutter-mid-opened.png',       () => 'window-shutter-mid-opened');
jest.mock('../../assets/icons/window-shutter-group-closed.png',     () => 'window-shutter-group-closed');
jest.mock('../../assets/icons/window-shutter-group-opened.png',     () => 'window-shutter-group-opened');
jest.mock('../../assets/icons/window-shutter-group-mid-opened.png', () => 'window-shutter-group-mid-opened');

// ─── Mock @expo/vector-icons ── remplace MaterialCommunityIcons par un composant pressable
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { TouchableOpacity } = require('react-native');
  return {
    MaterialCommunityIcons: ({ onPress, testID }: any) => (
      <TouchableOpacity testID={testID || 'material-icon'} onPress={onPress} />
    ),
  };
});

// ─── Mock du contexte Domoticz ─────────────────────────────────────────────────
// Utilise un vrai React.createContext pour que useContext() fonctionne correctement
// avec le renderer concurrent de React 18.
const mockSetDomoticzDevicesData = jest.fn();
jest.mock('@/app/services/DomoticzContextProvider', () => {
  const React = require('react');
  const DomoticzContext = React.createContext(null);
  return { DomoticzContext };
});

// ─── Mock du contrôleur ────────────────────────────────────────────────────────
const mockOnClickDeviceIcon = jest.fn();
jest.mock('@/app/controllers/devices.controller', () => ({
  onClickDeviceIcon: (...args: any[]) => mockOnClickDeviceIcon(...args),
}));

// ─── Mock des couleurs ─────────────────────────────────────────────────────────
jest.mock('@/app/enums/Colors', () => ({
  getGroupColor: jest.fn(() => 'white'),
}));

import { getLightIcon, getVoletIcon } from '../IconDomoticzDevice';
import IconDomoticzDevice from '../IconDomoticzDevice';
import DomoticzDevice from '@/app/models/domoticzDevice.model';
import { DomoticzDeviceType, DomoticzSwitchType } from '@/app/enums/DomoticzEnum';
import { DomoticzContext } from '@/app/services/DomoticzContextProvider';

// ─── Fabrique de devices ───────────────────────────────────────────────────────

function makeDevice(overrides: Partial<{
  idx: number;
  rang: number;
  name: string;
  lastUpdate: string;
  level: number;
  type: DomoticzDeviceType;
  subType: string;
  switchType: DomoticzSwitchType;
  status: string;
  data: string;
  isGroup: boolean;
}>): DomoticzDevice {
  return new DomoticzDevice({
    idx: 1,
    rang: 0,
    name: 'Test Device',
    lastUpdate: '2024-01-01',
    level: 0,
    type: DomoticzDeviceType.LUMIERE,
    subType: 'Switch',
    switchType: DomoticzSwitchType.ONOFF,
    status: 'On',
    data: '',
    isGroup: false,
    ...overrides,
  } as DomoticzDevice);
}

// ─── getLightIcon ──────────────────────────────────────────────────────────────

describe('getLightIcon', () => {

  describe('équipement simple (isGroup = false)', () => {
    it('ON  → "lightbulb-outline"', () => {
      const device = makeDevice({ status: 'On', isGroup: false });
      expect(getLightIcon(device)).toBe('lightbulb-outline');
    });

    it('Off → "lightbulb-off-outline"', () => {
      const device = makeDevice({ status: 'Off', isGroup: false });
      expect(getLightIcon(device)).toBe('lightbulb-off-outline');
    });
  });

  describe('groupe (isGroup = true)', () => {
    it('ON  → "lightbulb-multiple-outline"', () => {
      const device = makeDevice({ status: 'On', isGroup: true });
      expect(getLightIcon(device)).toBe('lightbulb-multiple-outline');
    });

    it('Off → "lightbulb-multiple-off-outline"', () => {
      const device = makeDevice({ status: 'Off', isGroup: true });
      expect(getLightIcon(device)).toBe('lightbulb-multiple-off-outline');
    });
  });

  it('le résultat se termine toujours par "-outline"', () => {
    const combinations = [
      makeDevice({ status: 'On',  isGroup: false }),
      makeDevice({ status: 'Off', isGroup: false }),
      makeDevice({ status: 'On',  isGroup: true  }),
      makeDevice({ status: 'Off', isGroup: true  }),
    ];
    combinations.forEach((d) => {
      expect(getLightIcon(d)).toMatch(/-outline$/);
    });
  });
});

// ─── getVoletIcon ──────────────────────────────────────────────────────────────

describe('getVoletIcon – volet simple (isGroup = false)', () => {

  it('level=0  (status Off) → volet fermé', () => {
    const device = makeDevice({
      isGroup: false, level: 0, status: 'Off',
      type: DomoticzDeviceType.VOLET,
    });
    expect(getVoletIcon(device)).toBe('window-shutter-closed');
  });

  it('level=0  (status On)  → volet fermé (level prévaut)', () => {
    const device = makeDevice({
      isGroup: false, level: 0, status: 'On',
      type: DomoticzDeviceType.VOLET,
    });
    expect(getVoletIcon(device)).toBe('window-shutter-closed');
  });

  it('status=Off (level>0) → volet fermé (status prévaut)', () => {
    const device = makeDevice({
      isGroup: false, level: 50, status: 'Off',
      type: DomoticzDeviceType.VOLET,
    });
    expect(getVoletIcon(device)).toBe('window-shutter-closed');
  });

  it('level=100 → volet ouvert', () => {
    const device = makeDevice({
      isGroup: false, level: 100, status: 'On',
      type: DomoticzDeviceType.VOLET,
    });
    expect(getVoletIcon(device)).toBe('window-shutter-opened');
  });

  it('level=50  → volet mi-ouvert', () => {
    const device = makeDevice({
      isGroup: false, level: 50, status: 'On',
      type: DomoticzDeviceType.VOLET,
    });
    expect(getVoletIcon(device)).toBe('window-shutter-mid-opened');
  });

  it('level=1 (intermédiaire minimum) → volet mi-ouvert', () => {
    const device = makeDevice({
      isGroup: false, level: 1, status: 'On',
      type: DomoticzDeviceType.VOLET,
    });
    expect(getVoletIcon(device)).toBe('window-shutter-mid-opened');
  });
});

describe('getVoletIcon – groupe de volets (isGroup = true)', () => {

  it('level=0  (status Off) → groupe fermé', () => {
    const device = makeDevice({
      isGroup: true, level: 0, status: 'Off',
      type: DomoticzDeviceType.VOLET,
    });
    expect(getVoletIcon(device)).toBe('window-shutter-group-closed');
  });

  it('status=Off (level>0) → groupe fermé (status prévaut)', () => {
    const device = makeDevice({
      isGroup: true, level: 50, status: 'Off',
      type: DomoticzDeviceType.VOLET,
    });
    expect(getVoletIcon(device)).toBe('window-shutter-group-closed');
  });

  it('level=100 → groupe ouvert', () => {
    const device = makeDevice({
      isGroup: true, level: 100, status: 'On',
      type: DomoticzDeviceType.VOLET,
    });
    expect(getVoletIcon(device)).toBe('window-shutter-group-opened');
  });

  it('level=50  → groupe mi-ouvert', () => {
    const device = makeDevice({
      isGroup: true, level: 50, status: 'On',
      type: DomoticzDeviceType.VOLET,
    });
    expect(getVoletIcon(device)).toBe('window-shutter-group-mid-opened');
  });

  it('level=1 (intermédiaire minimum) → groupe mi-ouvert', () => {
    const device = makeDevice({
      isGroup: true, level: 1, status: 'On',
      type: DomoticzDeviceType.VOLET,
    });
    expect(getVoletIcon(device)).toBe('window-shutter-group-mid-opened');
  });
});

// ─── Cohérence entre simples et groupes ───────────────────────────────────────

describe('getVoletIcon – cohérence simple vs groupe', () => {
  it('les icônes simple et groupe sont différentes pour le même niveau', () => {
    const simple = makeDevice({ isGroup: false, level: 50, status: 'On' });
    const group  = makeDevice({ isGroup: true,  level: 50, status: 'On' });
    expect(getVoletIcon(simple)).not.toBe(getVoletIcon(group));
  });
});

// =============================================================================
// Tests du composant IconDomoticzDevice — handleLumierePress
// =============================================================================

// Spy sur Alert.alert avant les tests composant
const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

function makeComponentDevice(overrides: Partial<DomoticzDevice> = {}): DomoticzDevice {
  return {
    idx: 1,
    rang: 0,
    name: 'Test Device',
    isGroup: false,
    isActive: true,
    level: 0,
    unit: '%',
    consistantLevel: true,
    type: DomoticzDeviceType.LUMIERE,
    subType: 'Switch',
    switchType: DomoticzSwitchType.ONOFF,
    status: 'On',
    data: '',
    lastUpdate: '2024-01-01',
    ...overrides,
  } as unknown as DomoticzDevice;
}

/** Wrapper fournissant le contexte Domoticz pour les tests composant */
function renderWithContext(ui: React.ReactElement) {
  return render(
    <DomoticzContext.Provider value={{ setDomoticzDevicesData: mockSetDomoticzDevicesData } as any}>
      {ui}
    </DomoticzContext.Provider>
  );
}

describe('IconDomoticzDevice — handleLumierePress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('clic sur lumière individuelle (isGroup=false) → appelle onClickDeviceIcon directement, sans Alert', () => {
    const device = makeComponentDevice({ type: DomoticzDeviceType.LUMIERE, isGroup: false, status: 'On' });
    const { getByTestId } = renderWithContext(<IconDomoticzDevice device={device} />);
    fireEvent.press(getByTestId('material-icon'));
    expect(mockOnClickDeviceIcon).toHaveBeenCalledTimes(1);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('clic sur groupe lumière (isGroup=true) → Alert.alert est affiché, pas d\'appel direct', () => {
    const device = makeComponentDevice({ type: DomoticzDeviceType.LUMIERE, isGroup: true, status: 'On', level: 100 });
    const { getByTestId } = renderWithContext(<IconDomoticzDevice device={device} />);
    fireEvent.press(getByTestId('material-icon'));
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(mockOnClickDeviceIcon).not.toHaveBeenCalled();
  });

  it('groupe lumière status="Off" → verbe "allumer" dans le message Alert', () => {
    const device = makeComponentDevice({ type: DomoticzDeviceType.LUMIERE, isGroup: true, status: 'Off', level: 0 });
    const { getByTestId } = renderWithContext(<IconDomoticzDevice device={device} />);
    fireEvent.press(getByTestId('material-icon'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Confirmation',
      expect.stringContaining('allumer'),
      expect.any(Array),
    );
  });

  it('groupe lumière status="On", level>0 → verbe "éteindre" dans le message Alert', () => {
    const device = makeComponentDevice({ type: DomoticzDeviceType.LUMIERE, isGroup: true, status: 'On', level: 80 });
    const { getByTestId } = renderWithContext(<IconDomoticzDevice device={device} />);
    fireEvent.press(getByTestId('material-icon'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Confirmation',
      expect.stringContaining('éteindre'),
      expect.any(Array),
    );
  });

  it('groupe lumière level=0 (status="On") → verbe "allumer" (level=0 prévaut sur status)', () => {
    const device = makeComponentDevice({ type: DomoticzDeviceType.LUMIERE, isGroup: true, status: 'On', level: 0 });
    const { getByTestId } = renderWithContext(<IconDomoticzDevice device={device} />);
    fireEvent.press(getByTestId('material-icon'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Confirmation',
      expect.stringContaining('allumer'),
      expect.any(Array),
    );
  });

  it('clic "Confirmer" dans Alert → appelle onClickDeviceIcon', () => {
    let capturedButtons: any[] = [];
    alertSpy.mockImplementationOnce((_title, _message, buttons) => {
      capturedButtons = buttons ?? [];
    });
    const device = makeComponentDevice({ type: DomoticzDeviceType.LUMIERE, isGroup: true, status: 'On', level: 50 });
    const { getByTestId } = renderWithContext(<IconDomoticzDevice device={device} />);
    fireEvent.press(getByTestId('material-icon'));
    const confirmButton = capturedButtons.find((b: any) => b.text === 'Confirmer');
    expect(confirmButton).toBeDefined();
    confirmButton.onPress();
    expect(mockOnClickDeviceIcon).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// Tests du composant IconDomoticzDevice — handleVoletPress
// =============================================================================

describe('IconDomoticzDevice — handleVoletPress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** Retrouve le premier nœud ayant un gestionnaire onPress dans l'arbre rendu */
  function getPressable(rendered: ReturnType<typeof renderWithContext>) {
    return rendered.UNSAFE_root.findAll(
      node => node.props && typeof node.props.onPress === 'function',
    )[0];
  }

  it('clic sur volet individuel (isGroup=false) → appelle onClickDeviceIcon directement, sans Alert', () => {
    const device = makeComponentDevice({ type: DomoticzDeviceType.VOLET, isGroup: false, status: 'Off', level: 0 });
    const rendered = renderWithContext(<IconDomoticzDevice device={device} />);
    const pressable = getPressable(rendered);
    expect(pressable).toBeDefined();
    fireEvent.press(pressable);
    expect(mockOnClickDeviceIcon).toHaveBeenCalledTimes(1);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('clic sur groupe volet (isGroup=true, level=0) → Alert avec verbe "ouvrir"', () => {
    const device = makeComponentDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, status: 'Off', level: 0 });
    const rendered = renderWithContext(<IconDomoticzDevice device={device} />);
    fireEvent.press(getPressable(rendered));
    expect(alertSpy).toHaveBeenCalledWith(
      'Confirmation',
      expect.stringContaining('ouvrir'),
      expect.any(Array),
    );
    expect(mockOnClickDeviceIcon).not.toHaveBeenCalled();
  });

  it('clic sur groupe volet (isGroup=true, level=50) → Alert avec verbe "fermer"', () => {
    const device = makeComponentDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, status: 'On', level: 50 });
    const rendered = renderWithContext(<IconDomoticzDevice device={device} />);
    fireEvent.press(getPressable(rendered));
    expect(alertSpy).toHaveBeenCalledWith(
      'Confirmation',
      expect.stringContaining('fermer'),
      expect.any(Array),
    );
  });

  it('clic "Confirmer" dans Alert volet → appelle onClickDeviceIcon', () => {
    let capturedButtons: any[] = [];
    alertSpy.mockImplementationOnce((_title, _message, buttons) => {
      capturedButtons = buttons ?? [];
    });
    const device = makeComponentDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, status: 'On', level: 50 });
    const rendered = renderWithContext(<IconDomoticzDevice device={device} />);
    fireEvent.press(getPressable(rendered));
    const confirmButton = capturedButtons.find((b: any) => b.text === 'Confirmer');
    expect(confirmButton).toBeDefined();
    confirmButton.onPress();
    expect(mockOnClickDeviceIcon).toHaveBeenCalledTimes(1);
  });
});
