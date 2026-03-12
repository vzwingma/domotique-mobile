import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FavoriteCard } from '../favoriteCard.component';
import DomoticzDevice from '@/app/models/domoticzDevice.model';
import { DomoticzDeviceStatus, DomoticzDeviceType, DomoticzSwitchType } from '@/app/enums/DomoticzEnum';
import { DomoticzContext } from '@/app/services/DomoticzContextProvider';

const mockPerformDevicePrimaryAction = jest.fn();
const mockGetStatusLabel = jest.fn();
const mockGetLevel = jest.fn();

jest.mock('@/components/IconDomoticzDevice', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => <View testID="device-icon" />,
    performDevicePrimaryAction: (...args: any[]) => mockPerformDevicePrimaryAction(...args),
  };
});

const mockIsDeviceOn = jest.fn();

jest.mock('@/app/controllers/devices.controller', () => ({
  getLevel: (...args: any[]) => mockGetLevel(...args),
  getStatusLabel: (...args: any[]) => mockGetStatusLabel(...args),
  isDeviceOn: (...args: any[]) => mockIsDeviceOn(...args),
}));

jest.mock('@/app/enums/Colors', () => ({
  Colors: {
    domoticz: { color: '#f5c727' },
    dark: { icon: '#ffffff', text: '#ECEDEE', background: '#151718' },
  },
  getGroupColor: jest.fn(() => '#ffffff'),
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

