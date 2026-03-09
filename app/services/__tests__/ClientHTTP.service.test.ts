/**
 * Tests unitaires pour ClientHTTP.service.ts
 *
 * Couvre :
 *  - Construction de l'URL (remplacement des placeholders <IDX>, <CMD>, <LEVEL>, <TEMP>)
 *  - Succès HTTP 200 + status "OK"
 *  - Erreur HTTP 400/500
 *  - Status Domoticz "ERR"
 *  - Réseau indisponible (fetch reject)
 *  - Présence du header Authorization: Basic
 */

// Mock react-native-get-random-values et uuid avant l'import du service
jest.mock('react-native-get-random-values', () => {});
jest.mock('uuid', () => ({
  v7: jest.fn(() => 'aaaabbbb-cccc-dddd-eeee-ffffaaaabbbb'),
}));

import callDomoticz from '../ClientHTTP.service';
import { SERVICES_URL, SERVICES_PARAMS } from '../../enums/APIconstants';

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Crée une Response mock avec status et body JSON */
function makeFetchResponse(status: number, body: object, statusText = ''): Response {
  return {
    status,
    statusText,
    ok: status >= 200 && status < 300,
    json: jest.fn().mockResolvedValue(body),
    headers: new Headers(),
  } as unknown as Response;
}

// ─── Setup ───────────────────────────────────────────────────────────────────────

describe('callDomoticz', () => {
  const FAKE_URL = 'http://domoticz-test:8080/';
  const FAKE_AUTH = 'dGVzdDp0ZXN0'; // base64 test:test

  beforeEach(() => {
    jest.clearAllMocks();
    // Injection des variables d'environnement avant chaque test
    process.env.EXPO_PUBLIC_DOMOTICZ_URL = FAKE_URL;
    process.env.EXPO_PUBLIC_DOMOTICZ_AUTH = FAKE_AUTH;
    // Réinitialise le module pour que API_URL / API_AUTH soient recalculés
    // (les constantes sont lues au chargement du module, donc on spy sur fetch)
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_DOMOTICZ_URL;
    delete process.env.EXPO_PUBLIC_DOMOTICZ_AUTH;
  });

  // ─── Construction de l'URL ────────────────────────────────────────────────────

  describe('Construction de l\'URL', () => {
    it('utilise l\'URL de base sans paramètre pour GET_CONFIG', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(200, { status: 'OK', result: [] })
      );

      await callDomoticz(SERVICES_URL.GET_DEVICES);

      const calledUrl: string = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(calledUrl).toContain('getdevices');
    });

    it('remplace <IDX> dans l\'URL par la valeur fournie', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(200, { status: 'OK' })
      );

      await callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_ON_OFF, [
        { key: SERVICES_PARAMS.IDX, value: '42' },
        { key: SERVICES_PARAMS.CMD, value: 'On' },
      ]);

      const calledUrl: string = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(calledUrl).toContain('idx=42');
      expect(calledUrl).not.toContain('<IDX>');
    });

    it('remplace <CMD> dans l\'URL par la valeur fournie', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(200, { status: 'OK' })
      );

      await callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_ON_OFF, [
        { key: SERVICES_PARAMS.IDX, value: '10' },
        { key: SERVICES_PARAMS.CMD, value: 'Close' },
      ]);

      const calledUrl: string = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(calledUrl).toContain('switchcmd=Close');
      expect(calledUrl).not.toContain('<CMD>');
    });

    it('remplace <LEVEL> dans l\'URL par la valeur fournie', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(200, { status: 'OK' })
      );

      await callDomoticz(SERVICES_URL.CMD_BLINDS_LIGHTS_SET_LEVEL, [
        { key: SERVICES_PARAMS.IDX, value: '55' },
        { key: SERVICES_PARAMS.LEVEL, value: '75' },
      ]);

      const calledUrl: string = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(calledUrl).toContain('level=75');
      expect(calledUrl).not.toContain('<LEVEL>');
    });

    it('remplace <TEMP> dans l\'URL par la valeur fournie', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(200, { status: 'OK' })
      );

      await callDomoticz(SERVICES_URL.CMD_THERMOSTAT_SET_POINT, [
        { key: SERVICES_PARAMS.IDX, value: '99' },
        { key: SERVICES_PARAMS.TEMP, value: '21.5' },
      ]);

      const calledUrl: string = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(calledUrl).toContain('setpoint=21.5');
      expect(calledUrl).not.toContain('<TEMP>');
    });

    it('conserve l\'URL inchangée si aucun paramètre n\'est passé', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(200, { status: 'OK', result: [] })
      );

      await callDomoticz(SERVICES_URL.GET_TEMPS);

      const calledUrl: string = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(calledUrl).toContain('getdevices&filter=temp');
    });
  });

  // ─── Header Authorization ─────────────────────────────────────────────────────

  describe('Header Authorization', () => {
    it('envoie un header Authorization: Basic dans la requête', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(200, { status: 'OK', result: [] })
      );

      await callDomoticz(SERVICES_URL.GET_DEVICES);

      const requestInit: RequestInit = (global.fetch as jest.Mock).mock.calls[0][1];
      const headers = requestInit.headers as Headers;
      expect(headers.get('Authorization')).toMatch(/^Basic /);
    });

    it('envoie un header Content-Type: application/json', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(200, { status: 'OK', result: [] })
      );

      await callDomoticz(SERVICES_URL.GET_DEVICES);

      const requestInit: RequestInit = (global.fetch as jest.Mock).mock.calls[0][1];
      const headers = requestInit.headers as Headers;
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('utilise la méthode GET', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(200, { status: 'OK', result: [] })
      );

      await callDomoticz(SERVICES_URL.GET_DEVICES);

      const requestInit: RequestInit = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(requestInit.method).toBe('GET');
    });
  });

  // ─── Succès HTTP 200 ──────────────────────────────────────────────────────────

  describe('Succès HTTP 200', () => {
    it('retourne les données JSON pour un status 200 + status "OK"', async () => {
      const fakeData = { status: 'OK', result: [{ idx: 1, Name: 'Lumière' }] };
      (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(200, fakeData));

      const result = await callDomoticz(SERVICES_URL.GET_DEVICES);

      expect(result).toEqual(fakeData);
    });

    it('retourne les données pour n\'importe quel status 2xx', async () => {
      const fakeData = { status: 'OK', result: [] };
      (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(201, fakeData));

      const result = await callDomoticz(SERVICES_URL.GET_DEVICES);

      expect(result).toEqual(fakeData);
    });
  });

  // ─── Erreur HTTP 4xx / 5xx ────────────────────────────────────────────────────

  describe('Erreur HTTP', () => {
    it('throw une erreur pour un status HTTP 400', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(400, {}, 'Bad Request')
      );

      await expect(callDomoticz(SERVICES_URL.GET_DEVICES)).rejects.toThrow();
    });

    it('throw une erreur pour un status HTTP 500', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(500, {}, 'Internal Server Error')
      );

      await expect(callDomoticz(SERVICES_URL.GET_DEVICES)).rejects.toThrow();
    });

    it('throw une erreur pour un status HTTP 401', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(401, {}, 'Unauthorized')
      );

      await expect(callDomoticz(SERVICES_URL.GET_DEVICES)).rejects.toThrow();
    });

    it('throw une erreur pour un status HTTP 404', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        makeFetchResponse(404, {}, 'Not Found')
      );

      await expect(callDomoticz(SERVICES_URL.GET_DEVICES)).rejects.toThrow();
    });
  });

  // ─── Status Domoticz "ERR" ────────────────────────────────────────────────────

  describe('Status Domoticz "ERR"', () => {
    it('throw une erreur quand data.status === "ERR"', async () => {
      const errData = { status: 'ERR', message: 'Device not found' };
      (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(200, errData));

      await expect(callDomoticz(SERVICES_URL.GET_DEVICES)).rejects.toThrow();
    });

    it('inclut le message d\'erreur Domoticz dans l\'exception', async () => {
      const errData = { status: 'ERR', message: 'Device not found' };
      (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(200, errData));

      await expect(callDomoticz(SERVICES_URL.GET_DEVICES)).rejects.toThrow(
        /Device not found/
      );
    });
  });

  // ─── Réseau indisponible ──────────────────────────────────────────────────────

  describe('Réseau indisponible', () => {
    it('throw une erreur quand fetch rejette (réseau indisponible)', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network request failed'));

      await expect(callDomoticz(SERVICES_URL.GET_DEVICES)).rejects.toThrow();
    });

    it('propage le message d\'erreur réseau', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network request failed'));

      await expect(callDomoticz(SERVICES_URL.GET_DEVICES)).rejects.toThrow(
        /Network request failed/
      );
    });

    it('throw une erreur quand fetch rejette avec TypeError (CORS)', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      await expect(callDomoticz(SERVICES_URL.GET_DEVICES)).rejects.toThrow();
    });
  });
});
