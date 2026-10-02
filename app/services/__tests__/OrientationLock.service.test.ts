/**
 * Tests unitaires du service OrientationLock (Plan d'Action 004, T3.1)
 *
 * Couvre :
 *  - isTabletScreen : seuil 600dp sur le plus petit côté, indépendant de l'orientation
 *  - lockOrientationForDevice : tablette → verrou paysage ; téléphone / Web → aucun appel ;
 *    échec de lockAsync → logué, jamais propagé
 *
 * `Platform.OS` et `Dimensions.get` sont pilotés via un Proxy sur le module react-native réel
 * (cf. devices.tabs.test.tsx : un spread `{...actual}` évaluerait des exports natifs non dispo en Jest).
 */
import * as ScreenOrientation from 'expo-screen-orientation';
import { Logger } from '../Logger.service';
import { TABLET_MIN_SMALLEST_WIDTH, isTabletScreen, lockOrientationForDevice } from '../OrientationLock.service';

let mockPlatformOS = 'android';
let mockScreen = { width: 400, height: 800 };

jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  return new Proxy(actualReactNative, {
    get(target, prop, receiver) {
      if (prop === 'Platform') {
        return { OS: mockPlatformOS };
      }
      if (prop === 'Dimensions') {
        return { get: () => ({ ...mockScreen, scale: 1, fontScale: 1 }) };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
});

jest.mock('../Logger.service', () => ({
  Logger: { debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const mockLockAsync = ScreenOrientation.lockAsync as jest.Mock;

describe('OrientationLock.service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockLockAsync.mockImplementation(() => Promise.resolve());
    mockPlatformOS = 'android';
    mockScreen = { width: 400, height: 800 };
  });

  describe('isTabletScreen', () => {
    it('seuil exposé = 600dp', () => {
      expect(TABLET_MIN_SMALLEST_WIDTH).toBe(600);
    });

    it.each([
      [375, 812, false],
      [812, 375, false],
      [599, 1000, false],
      [1000, 599, false],
      [600, 600, true],
      [600, 960, true],
      [960, 600, true],
      [800, 1280, true],
      [1280, 800, true],
    ])('%ix%i → %s', (width, height, expected) => {
      expect(isTabletScreen(width, height)).toBe(expected);
    });
  });

  describe('lockOrientationForDevice', () => {
    it('tablette Android (portrait au démarrage) → verrou paysage', async () => {
      mockScreen = { width: 800, height: 1280 };
      await lockOrientationForDevice();
      expect(mockLockAsync).toHaveBeenCalledTimes(1);
      expect(mockLockAsync).toHaveBeenCalledWith(ScreenOrientation.OrientationLock.LANDSCAPE);
    });

    it('tablette Android déjà en paysage → verrou paysage', async () => {
      mockScreen = { width: 1280, height: 800 };
      await lockOrientationForDevice();
      expect(mockLockAsync).toHaveBeenCalledWith(ScreenOrientation.OrientationLock.LANDSCAPE);
    });

    it('téléphone Android → aucun verrou (orientation app.json conservée)', async () => {
      mockScreen = { width: 375, height: 812 };
      await lockOrientationForDevice();
      expect(mockLockAsync).not.toHaveBeenCalled();
    });

    it('Web (même large) → aucun verrou', async () => {
      mockPlatformOS = 'web';
      mockScreen = { width: 1920, height: 1080 };
      await lockOrientationForDevice();
      expect(mockLockAsync).not.toHaveBeenCalled();
    });

    it('échec de lockAsync → logué en warn, non propagé', async () => {
      mockScreen = { width: 1280, height: 800 };
      const failure = new Error('unsupported');
      mockLockAsync.mockImplementation(() => Promise.reject(failure));

      await expect(lockOrientationForDevice()).resolves.toBeUndefined();
      expect(Logger.warn).toHaveBeenCalledWith(expect.stringContaining('Orientation'), failure);
      expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('succès → log debug', async () => {
      mockScreen = { width: 1280, height: 800 };
      await lockOrientationForDevice();
      expect(Logger.debug).toHaveBeenCalledWith(expect.stringContaining('verrouillage paysage'));
      expect(Logger.warn).not.toHaveBeenCalled();
    });
  });
});
