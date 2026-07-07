import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

const mockUseFonts = jest.fn();
const mockPreventAutoHideAsync = jest.fn();
const mockHideAsync = jest.fn();

jest.mock('expo-font', () => ({
  useFonts: (...args: any[]) => mockUseFonts(...args),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: (...args: any[]) => mockPreventAutoHideAsync(...args),
  hideAsync: (...args: any[]) => mockHideAsync(...args),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: {
    font: { MaterialCommunityIcons: 'mci-font-asset' },
  },
}));

jest.mock('../../assets/fonts/SpaceMono-Regular.ttf', () => 'SpaceMono-Regular.ttf');

jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  Stack.Screen = function MockStackScreen() {
    return null;
  };
  return { Stack };
});

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children?: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('@/app/services/DomoticzContextProvider', () => ({
  DomoticzContextProvider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

describe('RootLayout', () => {
  beforeEach(() => {
    mockUseFonts.mockReset();
    mockPreventAutoHideAsync.mockReset();
    mockHideAsync.mockReset();
    mockUseFonts.mockReturnValue([true]);
  });

  it('charge les fontes MaterialCommunityIcons au demarrage', async () => {
    const RootLayout = require('../_layout').default;

    render(<RootLayout />);

    expect(mockUseFonts).toHaveBeenCalledWith(
      expect.objectContaining({
        SpaceMono: expect.anything(),
        MaterialCommunityIcons: 'mci-font-asset',
      })
    );

    await waitFor(() => expect(mockHideAsync).toHaveBeenCalled());
  });
});
