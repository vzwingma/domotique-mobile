/* eslint-disable @typescript-eslint/no-require-imports -- Jest mock factories load their dependencies locally. */
import React from 'react';
import type { SliderProps } from '@react-native-community/slider';
import { fireEvent, render } from '@testing-library/react-native';
import { ViewBlindDevice } from '../blindDevice.component';
import DomoticzDevice from '../../models/domoticzDevice.model';
import { DomoticzDeviceStatus, DomoticzDeviceType, DomoticzSwitchType } from '../../enums/DomoticzEnum';
import { DomoticzContext } from '../../services/DomoticzContextProvider';

const mockUpdateDeviceLevel = jest.fn();

jest.mock('../../enums/Colors', () => {
  const actual = jest.requireActual<typeof import('../../enums/Colors')>('../../enums/Colors');
  return {
    __esModule: true,
    ...actual,
    PROFILES_ENV: { C: 'previewC', V: 'previewV' },
    PROFILE: undefined,
  };
});

jest.mock('../../controllers/devices.controller', () => {
  const actual = jest.requireActual<typeof import('../../controllers/devices.controller')>(
    '../../controllers/devices.controller',
  );
  return {
    ...actual,
    updateDeviceLevel: (...args: Parameters<typeof actual.updateDeviceLevel>) => mockUpdateDeviceLevel(...args),
  };
});

jest.mock('@react-native-community/slider', () => {
  const { View } = require('react-native');
  return function MockSlider(props: SliderProps) {
    return <View testID="slider" {...props} />;
  };
});

jest.mock('@/components/IconDomoticzDevice', () => {
  const { View } = require('react-native');
  return {
    IconDomoticzDevice: () => <View />,
    performDevicePrimaryAction: jest.fn(),
  };
});

function makeDevice(overrides: Partial<DomoticzDevice> = {}): DomoticzDevice {
  return {
    idx: 201,
    rang: 0,
    name: 'Volet salon',
    isGroup: false,
    lastUpdate: '2026-11-10 21:00:00',
    isActive: true,
    level: 60,
    unit: '%',
    consistantLevel: true,
    type: DomoticzDeviceType.VOLET,
    subType: 'Blind',
    switchType: DomoticzSwitchType.SLIDER,
    status: DomoticzDeviceStatus.ON,
    data: '',
    ...overrides,
  };
}

function renderDevice(device = makeDevice()) {
  const setDevices = jest.fn();
  const context: NonNullable<React.ContextType<typeof DomoticzContext>> = {
    domoticzConnexionData: undefined,
    setDomoticzConnexionData: jest.fn(),
    domoticzDevicesData: [device],
    setDomoticzDevicesData: setDevices,
    domoticzTemperaturesData: [],
    setDomoticzTemperaturesData: jest.fn(),
    domoticzThermostatData: [],
    setDomoticzThermostatData: jest.fn(),
    domoticzParametersData: [],
    setDomoticzParametersData: jest.fn(),
  };
  return {
    ...render(
      <DomoticzContext.Provider value={context}>
        <ViewBlindDevice device={device} />
      </DomoticzContext.Provider>,
    ),
    setDevices,
  };
}

function setProfile(profile: string | undefined) {
  const colors = jest.requireMock<{ PROFILE: string | undefined }>('../../enums/Colors');
  colors.PROFILE = profile;
}

describe('blindDevice : isolation des profils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setProfile('previewV');
  });

  it('active la course segmentee uniquement en previewV', () => {
    const colors = jest.requireMock<{ PROFILE: string; PROFILES_ENV: { V: string } }>('../../enums/Colors');
    expect(colors.PROFILE).toBe('previewV');
    expect(colors.PROFILES_ENV.V).toBe('previewV');
    const { getByTestId, queryByText } = renderDevice();
    const slider = getByTestId('slider');
    expect(slider.props.minimumValue).toBe(0);
    expect(slider.props.maximumValue).toBe(1);
    expect(slider.props.step).toBe(0);
    expect(slider.props.value).toBeCloseTo(11 / 15, 12);
    expect(queryByText('10\u00a0%', { includeHiddenElements: true })).toBeNull();
  });

  it.each(['previewC', 'production', undefined])('garde le slider lineaire en profil %s', profile => {
    setProfile(profile);
    const { getByTestId, queryByText } = renderDevice();
    const slider = getByTestId('slider');
    expect(slider.props.minimumValue).toBe(0);
    expect(slider.props.maximumValue).toBe(100);
    expect(slider.props.step).toBe(1);
    expect(slider.props.value).toBe(60);
    expect(queryByText('10\u00a0%', { includeHiddenElements: true })).toBeNull();
  });

  it.each([
    [0, 0.1],
    [1 / 6, 5],
    [1 / 3, 10],
    [2 / 3, 50],
    [11 / 15, 60],
    [1, 100],
  ])('envoie un niveau Domoticz %s -> %s apres le geste', (position, expectedLevel) => {
    const device = makeDevice({ level: 30 });
    const { getByTestId, setDevices } = renderDevice(device);
    fireEvent(getByTestId('slider'), 'responderStart');
    fireEvent(getByTestId('slider'), 'valueChange', position);
    fireEvent(getByTestId('slider'), 'responderEnd');
    expect(mockUpdateDeviceLevel).toHaveBeenCalledTimes(1);
    expect(mockUpdateDeviceLevel).toHaveBeenCalledWith(device.idx, device, expectedLevel, setDevices);
  });

  it('conserve la commande lineaire du profil previewC', () => {
    setProfile('previewC');
    const device = makeDevice();
    const { getByTestId, setDevices } = renderDevice(device);
    fireEvent(getByTestId('slider'), 'responderStart');
    fireEvent(getByTestId('slider'), 'valueChange', 5);
    fireEvent(getByTestId('slider'), 'responderEnd');
    expect(mockUpdateDeviceLevel).toHaveBeenCalledWith(device.idx, device, 5, setDevices);
  });

  it('desactive le slider du volet inactif', () => {
    const { getByTestId } = renderDevice(makeDevice({ isActive: false }));
    expect(getByTestId('slider').props.disabled).toBe(true);
  });

  it('ne rend aucun slider pour un volet ONOFF', () => {
    const { queryByTestId } = renderDevice(makeDevice({ switchType: DomoticzSwitchType.ONOFF }));
    expect(queryByTestId('slider')).toBeNull();
  });
});
