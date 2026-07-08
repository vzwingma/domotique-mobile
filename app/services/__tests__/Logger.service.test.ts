/**
 * Tests unitaires pour Logger.service.ts
 */
import { Logger } from '../Logger.service';

describe('Logger', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('debug appelle console.log en __DEV__', () => {
    Logger.debug('message', { detail: 1 });
    expect(logSpy).toHaveBeenCalledWith('message', { detail: 1 });
  });

  it('warn appelle console.warn en __DEV__', () => {
    Logger.warn('attention');
    expect(warnSpy).toHaveBeenCalledWith('attention');
  });

  it('error appelle toujours console.error, y compris hors __DEV__', () => {
    const originalDev = globalThis.__DEV__;
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;

    Logger.error('erreur critique');
    expect(errorSpy).toHaveBeenCalledWith('erreur critique');

    (globalThis as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  it('debug ne log pas hors __DEV__', () => {
    const originalDev = globalThis.__DEV__;
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;

    Logger.debug('ne doit pas apparaître');
    expect(logSpy).not.toHaveBeenCalled();

    (globalThis as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  it('warn ne log pas hors __DEV__', () => {
    const originalDev = globalThis.__DEV__;
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;

    Logger.warn('ne doit pas apparaître');
    expect(warnSpy).not.toHaveBeenCalled();

    (globalThis as { __DEV__?: boolean }).__DEV__ = originalDev;
  });
});
