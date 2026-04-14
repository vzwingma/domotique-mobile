/**
 * Tests pour IconDomoticzDevice.tsx :
 *
 * Fonctions pures :
 *   - getLightIcon(device)
 *
 * Composant IconDomoticzDevice :
 *   - handleLumierePress : clic lumière individuelle / groupe
 *   - handleVoletPress   : clic volet individuel / groupe
 *
 * Composant IconVoletSVG :
 *   - nombre de lames selon le niveau d'ouverture
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

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
  // isDeviceOn reflète la logique réelle pour ONOFF (status === 'On')
  isDeviceOn: (device: any) => device.status === 'On',
}));

// ─── Mock des couleurs ─────────────────────────────────────────────────────────
jest.mock('@/app/enums/Colors', () => ({
  getGroupColor: jest.fn(() => 'white'),
}));

import { getLightIcon } from '../IconDomoticzDevice';
import IconDomoticzDevice from '../IconDomoticzDevice';
import { IconVoletSVG } from '../IconVoletSVG';
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
// La fonction getVoletIcon (PNG statique) a été remplacée par IconVoletSVG (SVG dynamique).
// Les tests ci-dessous vérifient le calcul du nombre de lames selon le niveau.

const MAX_SLATS = 8;

function computeSlatCount(level: number, status = 'On'): number {
  const effectiveLevel = status === 'Off' ? 0 : level;
  return Math.round(MAX_SLATS * (100 - effectiveLevel) / 100);
}

describe('IconVoletSVG – nombre de lames selon le niveau', () => {

  it('status=Off (level=100) → toutes les lames visibles (fermé, status prévaut)', () => {
    expect(computeSlatCount(100, 'Off')).toBe(MAX_SLATS);
  });

  it('status=Off (level=50) → toutes les lames visibles (fermé, status prévaut)', () => {
    expect(computeSlatCount(50, 'Off')).toBe(MAX_SLATS);
  });

  it('level=0  (fermé)  → toutes les lames visibles (MAX_SLATS)', () => {
    expect(computeSlatCount(0)).toBe(MAX_SLATS);
  });

  it('level=100 (ouvert) → aucune lame visible (0)', () => {
    expect(computeSlatCount(100)).toBe(0);
  });

  it('level=50  → moitié des lames visibles', () => {
    expect(computeSlatCount(50)).toBe(Math.round(MAX_SLATS / 2));
  });

  it('level=25  → 75% des lames visibles', () => {
    expect(computeSlatCount(25)).toBe(Math.round(MAX_SLATS * 0.75));
  });

  it('level=75  → 25% des lames visibles', () => {
    expect(computeSlatCount(75)).toBe(Math.round(MAX_SLATS * 0.25));
  });

  it('le nombre de lames décroît strictement quand le niveau augmente', () => {
    const counts = [0, 25, 50, 75, 100].map(computeSlatCount);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeLessThanOrEqual(counts[i - 1]);
    }
  });
});

describe('IconVoletSVG – rendu', () => {
  function makeVoletDevice(level: number, isGroup = false): DomoticzDevice {
    return {
      idx: 1, rang: 0, name: 'Volet Test', isGroup,
      isActive: true, level, unit: '%', consistantLevel: true,
      type: DomoticzDeviceType.VOLET, subType: 'Switch',
      switchType: DomoticzSwitchType.ONOFF, status: level === 0 ? 'Off' : 'On',
      data: '', lastUpdate: '2024-01-01',
    } as unknown as DomoticzDevice;
  }

  it('se rend sans erreur pour un volet fermé (level=0)', () => {
    expect(() => render(<IconVoletSVG device={makeVoletDevice(0)} />)).not.toThrow();
  });

  it('se rend sans erreur pour un volet ouvert (level=100)', () => {
    expect(() => render(<IconVoletSVG device={makeVoletDevice(100)} />)).not.toThrow();
  });

  it('se rend sans erreur pour un groupe mi-ouvert (level=50)', () => {
    expect(() => render(<IconVoletSVG device={makeVoletDevice(50, true)} />)).not.toThrow();
  });

  it('se rend sans erreur pour un groupe mixte (!consistantLevel)', () => {
    const mixed = { ...makeVoletDevice(50, true), consistantLevel: false } as unknown as DomoticzDevice;
    expect(() => render(<IconVoletSVG device={mixed} />)).not.toThrow();
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
