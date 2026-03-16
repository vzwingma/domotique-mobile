import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FavoriteCard } from '../favoriteCard.component';
import DomoticzDevice from '@/app/models/domoticzDevice.model';
import { DomoticzDeviceStatus, DomoticzDeviceType, DomoticzSwitchType } from '@/app/enums/DomoticzEnum';
import { DomoticzContext } from '@/app/services/DomoticzContextProvider';

const mockPerformDevicePrimaryAction = jest.fn();
const mockGetStatusLabel = jest.fn();
const mockGetLevel = jest.fn();
const mockUpdateDeviceLevel = jest.fn();
const mockOverrideNextValue = jest.fn();

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

const mockIsDeviceOn = jest.fn();

jest.mock('@/app/controllers/devices.controller', () => ({
  getLevel: (...args: any[]) => mockGetLevel(...args),
  getStatusLabel: (...args: any[]) => mockGetStatusLabel(...args),
  isDeviceOn: (...args: any[]) => mockIsDeviceOn(...args),
  updateDeviceLevel: (...args: any[]) => mockUpdateDeviceLevel(...args),
  overrideNextValue: (...args: any[]) => mockOverrideNextValue(...args),
}));

jest.mock('@/app/enums/Colors', () => ({
  Colors: {
    domoticz: { color: '#f5c727' },
    dark: { icon: '#ffffff', text: '#ECEDEE', background: '#151718' },
  },
  getGroupColor: jest.fn(() => '#ffffff'),
  PROFILES_ENV: { C: 'previewC', V: 'previewV' },
}));

function makeDevice(overrides: Partial<DomoticzDevice> = {}): DomoticzDevice {
  return {
    idx: 101,
    rang: 0,
    name: 'Lampe salon',
    isGroup: false,
    isActive: true,
    level: 100,
    unit: '',
    consistantLevel: true,
    type: DomoticzDeviceType.LUMIERE,
    subType: 'Switch',
    switchType: DomoticzSwitchType.ONOFF,
    status: DomoticzDeviceStatus.ON,
    data: '',
    lastUpdate: '2024-01-01',
    ...overrides,
  } as DomoticzDevice;
}

function renderWithContext(device: DomoticzDevice) {
  const setDomoticzDevicesData = jest.fn();
  const rendered = render(
    <DomoticzContext.Provider value={{ setDomoticzDevicesData } as any}>
      <FavoriteCard device={device} />
    </DomoticzContext.Provider>,
  );
  return { ...rendered, setDomoticzDevicesData };
}

describe('FavoriteCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.EXPO_PUBLIC_MY_ENVIRONMENT;
    mockGetLevel.mockReturnValue(100);
    mockGetStatusLabel.mockReturnValue('Allumée');
    mockIsDeviceOn.mockImplementation((d: any) => d.status !== 'Off' && d.level > 0);
  });

  it('rend un favori actif sans slider (quick action uniquement)', () => {
    const { getByText, getByLabelText, queryByTestId } = renderWithContext(makeDevice());

    expect(getByText('Lampe salon')).toBeTruthy();
    expect(getByText('État : Allumée')).toBeTruthy();
    expect(getByLabelText('Éteindre Lampe salon')).toBeTruthy();
    expect(queryByTestId('slider')).toBeNull();
  });

  it('affiche "Déconnecté" quand le favori est inactif', () => {
    const { getByText, getByLabelText } = renderWithContext(makeDevice({ isActive: false }));

    expect(getByText('Déconnecté')).toBeTruthy();
    expect(getByLabelText('Éteindre Lampe salon').props.accessibilityState).toEqual({ disabled: true });
  });

  it('déclenche performDevicePrimaryAction sur action icône et bouton rapide', () => {
    const device = makeDevice();
    const { getByLabelText, setDomoticzDevicesData } = renderWithContext(device);

    fireEvent.press(getByLabelText('Action rapide éteindre Lampe salon'));
    fireEvent.press(getByLabelText('Éteindre Lampe salon'));

    expect(mockPerformDevicePrimaryAction).toHaveBeenCalledTimes(2);
    expect(mockPerformDevicePrimaryAction).toHaveBeenNthCalledWith(1, device, setDomoticzDevicesData);
    expect(mockPerformDevicePrimaryAction).toHaveBeenNthCalledWith(2, device, setDomoticzDevicesData);
  });

  it('calcule le libellé "Ouvrir" pour un volet OFF', () => {
    const device = makeDevice({
      name: 'Volet chambre',
      type: DomoticzDeviceType.VOLET,
      status: DomoticzDeviceStatus.OFF,
      level: 0,
    });
    const { getByLabelText } = renderWithContext(device);
    expect(getByLabelText('Ouvrir Volet chambre')).toBeTruthy();
  });

  it('snapshot favori actif', () => {
    const setDomoticzDevicesData = jest.fn();
    const { toJSON } = render(
      <DomoticzContext.Provider value={{ setDomoticzDevicesData } as any}>
        <FavoriteCard device={makeDevice()} />
      </DomoticzContext.Provider>,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

// =============================================================================
// Mode previewC — slider dans la tuile favori
// =============================================================================
describe('FavoriteCard — mode previewC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_MY_ENVIRONMENT = 'previewC';
    mockGetLevel.mockReturnValue(50);
    mockGetStatusLabel.mockReturnValue('50');
    mockIsDeviceOn.mockImplementation((d: any) => d.status !== 'Off' && d.level > 0);
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_MY_ENVIRONMENT;
  });

  it('affiche un slider pour un volet actif en previewC', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.VOLET,
      switchType: DomoticzSwitchType.SLIDER,
      status: DomoticzDeviceStatus.ON,
      level: 50,
      isActive: true,
    });
    const { getByTestId } = renderWithContext(device);
    expect(getByTestId('slider')).toBeTruthy();
  });

  it('affiche un slider pour une lumière dimmable active en previewC', () => {
    const device = makeDevice({
      type: DomoticzDeviceType.LUMIERE,
      switchType: DomoticzSwitchType.SLIDER,
      status: DomoticzDeviceStatus.ON,
      level: 50,
      isActive: true,
    });
    const { getByTestId } = renderWithContext(device);
    expect(getByTestId('slider')).toBeTruthy();
  });

  it("n'affiche pas de slider pour une lumière switch (ONOFF) en previewC", () => {
    const device = makeDevice({
      type: DomoticzDeviceType.LUMIERE,
      switchType: DomoticzSwitchType.ONOFF,
      status: DomoticzDeviceStatus.ON,
      level: 0,
      isActive: true,
    });
    const { queryByTestId } = renderWithContext(device);
    expect(queryByTestId('slider')).toBeNull();
  });

  it("n'affiche pas de slider pour un appareil inactif en previewC", () => {
    const device = makeDevice({
      type: DomoticzDeviceType.VOLET,
      switchType: DomoticzSwitchType.SLIDER,
      isActive: false,
    });
    const { queryByTestId } = renderWithContext(device);
    expect(queryByTestId('slider')).toBeNull();
  });

  it("n'affiche pas de slider hors mode previewC", () => {
    process.env.EXPO_PUBLIC_MY_ENVIRONMENT = 'production';
    const device = makeDevice({
      type: DomoticzDeviceType.VOLET,
      switchType: DomoticzSwitchType.SLIDER,
      status: DomoticzDeviceStatus.ON,
      level: 50,
      isActive: true,
    });
    const { queryByTestId } = renderWithContext(device);
    expect(queryByTestId('slider')).toBeNull();
  });

  it('les icône et bouton action sont toujours présents avec le slider', () => {
    const device = makeDevice({
      name: 'Volet salon',
      type: DomoticzDeviceType.VOLET,
      switchType: DomoticzSwitchType.SLIDER,
      status: DomoticzDeviceStatus.ON,
      level: 50,
      isActive: true,
    });
    const { getByTestId, getByLabelText } = renderWithContext(device);
    expect(getByTestId('device-icon')).toBeTruthy();
    expect(getByLabelText('Fermer Volet salon')).toBeTruthy();
    expect(getByTestId('slider')).toBeTruthy();
  });
});

