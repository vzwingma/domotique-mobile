/**
 * Tests unitaires pour la fonction showToast (AndroidToast)
 * Vérifie le comportement sur les plateformes web et android
 */

import { Platform, ToastAndroid } from 'react-native';
import { showToast, ToastDuration } from '../AndroidToast';

// Mock minimaliste : on ne charge PAS requireActual pour éviter les modules natifs non disponibles en test.
// AndroidToast.ts n'utilise que Platform.OS, ToastAndroid.show, ToastAndroid.SHORT et ToastAndroid.LONG.
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  ToastAndroid: {
    show: jest.fn(),
    SHORT: 'short',
    LONG: 'long',
  },
}));

describe('showToast - Platform web', () => {
  beforeEach(() => {
    // Simuler la plateforme web
    (Platform as { OS: string }).OS = 'web';
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('appelle console.log avec le message quand durée = SHORT', () => {
    showToast('message web court', ToastDuration.SHORT);
    expect(console.log).toHaveBeenCalledWith('Toast: message web court');
    expect(ToastAndroid.show).not.toHaveBeenCalled();
  });

  it('appelle console.log avec le message quand durée = LONG', () => {
    showToast('message web long', ToastDuration.LONG);
    expect(console.log).toHaveBeenCalledWith('Toast: message web long');
    expect(ToastAndroid.show).not.toHaveBeenCalled();
  });

  it('appelle console.log sans durée spécifiée', () => {
    showToast('message web sans durée');
    expect(console.log).toHaveBeenCalledWith('Toast: message web sans durée');
    expect(ToastAndroid.show).not.toHaveBeenCalled();
  });

  it("n'appelle pas ToastAndroid.show sur la plateforme web", () => {
    showToast('test web');
    expect(ToastAndroid.show).not.toHaveBeenCalled();
  });
});

describe('showToast - Platform android', () => {
  beforeEach(() => {
    // Simuler la plateforme android
    (Platform as { OS: string }).OS = 'android';
    jest.clearAllMocks();
  });

  it('appelle ToastAndroid.show avec SHORT quand durée = ToastDuration.SHORT', () => {
    showToast('message android court', ToastDuration.SHORT);
    expect(ToastAndroid.show).toHaveBeenCalledWith('message android court', ToastAndroid.SHORT);
  });

  it('appelle ToastAndroid.show avec LONG quand durée = ToastDuration.LONG', () => {
    showToast('message android long', ToastDuration.LONG);
    expect(ToastAndroid.show).toHaveBeenCalledWith('message android long', ToastAndroid.LONG);
  });

  it('appelle ToastAndroid.show avec LONG quand aucune durée spécifiée (valeur par défaut LONG)', () => {
    showToast('message android défaut');
    expect(ToastAndroid.show).toHaveBeenCalledWith('message android défaut', ToastAndroid.LONG);
  });

  it("n'appelle pas console.log sur la plateforme android", () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    showToast('test android');
    expect(console.log).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});

describe('ToastDuration enum', () => {
  it('ToastDuration.SHORT a la valeur "SHORT"', () => {
    expect(ToastDuration.SHORT).toBe('SHORT');
  });

  it('ToastDuration.LONG a la valeur "LONG"', () => {
    expect(ToastDuration.LONG).toBe('LONG');
  });
});
