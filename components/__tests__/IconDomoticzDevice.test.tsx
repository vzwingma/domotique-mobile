/**
 * Tests pour les fonctions exportées de IconDomoticzDevice.tsx
 *
 * On teste uniquement les fonctions pures :
 *   - getLightIcon(device)
 *   - getVoletIcon(device)
 *
 * Le composant IconDomoticzDevice lui-même n'est pas testé ici car il
 * nécessite un contexte React (DomoticzContext) plus complexe.
 */

// ─── Mocks des assets PNG ──────────────────────────────────────────────────────
// Ces mocks sont hoistés avant l'import du module source.
jest.mock('../../assets/icons/window-shutter-closed.png',       () => 'window-shutter-closed');
jest.mock('../../assets/icons/window-shutter-opened.png',       () => 'window-shutter-opened');
jest.mock('../../assets/icons/window-shutter-mid-opened.png',   () => 'window-shutter-mid-opened');
jest.mock('../../assets/icons/window-shutter-group-closed.png', () => 'window-shutter-group-closed');
jest.mock('../../assets/icons/window-shutter-group-opened.png', () => 'window-shutter-group-opened');
jest.mock('../../assets/icons/window-shutter-group-mid-opened.png', () => 'window-shutter-group-mid-opened');

// ─── Mocks des dépendances du module (contexte + contrôleur) ──────────────────
jest.mock('@/app/services/DomoticzContextProvider', () => ({
  DomoticzContext: { Consumer: jest.fn(), Provider: jest.fn() },
}));
jest.mock('@/app/controllers/devices.controller', () => ({
  onClickDeviceIcon: jest.fn(),
}));

import { getLightIcon, getVoletIcon } from '../IconDomoticzDevice';
import DomoticzDevice from '@/app/models/domoticzDevice.model';
import { DomoticzDeviceType, DomoticzSwitchType } from '@/app/enums/DomoticzEnum';

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
