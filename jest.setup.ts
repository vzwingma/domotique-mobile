import { jest } from '@jest/globals';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/',
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));
