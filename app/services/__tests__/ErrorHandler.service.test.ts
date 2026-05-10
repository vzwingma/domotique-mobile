/**
 * Tests unitaires pour ErrorHandler.service.ts
 * 
 * Couvre:
 * - Classification des erreurs (réseau, API, parsing, inconnue)
 * - Génération des messages utilisateur en français
 * - Logging avec traceId
 * - Affichage des toasts
 * - Couverture ≥90%
 */

// Mock react-native-get-random-values et uuid avant l'import du service
jest.mock('react-native-get-random-values', () => {});
jest.mock('uuid', () => ({
  v7: jest.fn(() => 'aaaabbbb-cccc-dddd-eeee-ffffaaaabbbb'),
}));

import {
  handleError,
  generateTraceId,
  DomoticzError,
  ErrorType
} from '../ErrorHandler.service';

// ─── Setup ───────────────────────────────────────────────────────────────────────

describe('ErrorHandler.service', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let mockShowToast: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockShowToast = jest.fn();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // ─── Tests: DomoticzError Class ─────────────────────────────────────────────────

  describe('DomoticzError', () => {
    it('should create a DomoticzError instance with all properties', () => {
      const originalError = new Error('Original error');
      const error = new DomoticzError(
        'ERR_001',
        'User message',
        'trace123',
        ErrorType.NETWORK_ERROR,
        originalError
      );

      expect(error).toBeInstanceOf(DomoticzError);
      expect(error.code).toBe('ERR_001');
      expect(error.message).toBe('User message');
      expect(error.traceId).toBe('trace123');
      expect(error.errorType).toBe(ErrorType.NETWORK_ERROR);
      expect(error.originalError).toBe(originalError);
      expect(error.name).toBe('DomoticzError');
    });

    it('should work without originalError parameter', () => {
      const error = new DomoticzError(
        'ERR_002',
        'Test message',
        'trace456',
        ErrorType.API_ERROR
      );

      expect(error.originalError).toBeUndefined();
      expect(error.errorType).toBe(ErrorType.API_ERROR);
    });
  });

  // ─── Tests: Network Errors ──────────────────────────────────────────────────────

  describe('Network Error Classification and Handling', () => {
    it('should classify and handle network connection error', () => {
      const networkError = new Error('Network request failed');
      const result = handleError(networkError, 'testContext', 'trace123', mockShowToast);

      expect(result).toBeInstanceOf(DomoticzError);
      expect(result.errorType).toBe(ErrorType.NETWORK_ERROR);
      expect(result.message).toContain('connexion réseau');
      expect(mockShowToast).toHaveBeenCalledWith(result.message);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should classify and handle SSL/TLS certificate error', () => {
      const sslError = new Error('SSL certificate problem: self signed certificate');
      const result = handleError(sslError, 'loadDevices', 'traceSSL', mockShowToast);

      expect(result.errorType).toBe(ErrorType.NETWORK_ERROR);
      expect(result.message).toContain('SSL/TLS');
      expect(mockShowToast).toHaveBeenCalledWith(result.message);
    });

    it('should classify timeout errors as network errors', () => {
      const timeoutError = new Error('Request timeout');
      const result = handleError(timeoutError, 'context', 'trace', mockShowToast);

      expect(result.errorType).toBe(ErrorType.NETWORK_ERROR);
      expect(result.message).toContain('connexion réseau');
    });

    it('should classify ECONNREFUSED as network error', () => {
      const connError = new Error('ECONNREFUSED: Connection refused');
      const result = handleError(connError, 'context', 'trace', mockShowToast);

      expect(result.errorType).toBe(ErrorType.NETWORK_ERROR);
    });

    it('should classify ENOTFOUND as network error', () => {
      const dnsError = new Error('ENOTFOUND: getaddrinfo ENOTFOUND domoticz.local');
      const result = handleError(dnsError, 'context', 'trace', mockShowToast);

      expect(result.errorType).toBe(ErrorType.NETWORK_ERROR);
    });
  });

  // ─── Tests: API Errors ──────────────────────────────────────────────────────────

  describe('API Error Classification and Handling', () => {
    it('should classify HTTP 401 error as authentication error', () => {
      const apiError = new Error('HTTP 401: Unauthorized');
      const result = handleError(apiError, 'auth', 'trace', mockShowToast);

      expect(result.errorType).toBe(ErrorType.API_ERROR);
      expect(result.message).toContain('Authentification');
      expect(mockShowToast).toHaveBeenCalledWith(result.message);
    });

    it('should classify HTTP 403 error as forbidden', () => {
      const apiError = new Error('HTTP 403: Forbidden');
      const result = handleError(apiError, 'context', 'trace', mockShowToast);

      expect(result.errorType).toBe(ErrorType.API_ERROR);
      expect(result.message).toContain('Authentification');
    });

    it('should classify HTTP 404 error as not found', () => {
      const apiError = new Error('HTTP 404: Not Found');
      const result = handleError(apiError, 'context', 'trace', mockShowToast);

      expect(result.errorType).toBe(ErrorType.API_ERROR);
      expect(result.message).toContain('Ressource non trouvée');
    });

    it('should classify HTTP 500 error as server error', () => {
      const apiError = new Error('HTTP 500: Internal Server Error');
      const result = handleError(apiError, 'context', 'trace', mockShowToast);

      expect(result.errorType).toBe(ErrorType.API_ERROR);
      expect(result.message).toContain('Erreur serveur');
    });

    it('should classify Domoticz API status ERR as API error', () => {
      const domoticzError = new Error('/json.htm?type=devices - ERR: Invalid request');
      const result = handleError(domoticzError, 'loadDevices', 'trace', mockShowToast);

      expect(result.errorType).toBe(ErrorType.API_ERROR);
      expect(result.message).toContain('communication avec le serveur');
    });

    it('should classify generic HTTP error', () => {
      const httpError = new Error('HTTP error status code');
      const result = handleError(httpError, 'context', 'trace', mockShowToast);

      expect(result.errorType).toBe(ErrorType.API_ERROR);
    });
  });

  // ─── Tests: Parse Errors ────────────────────────────────────────────────────────

  describe('Parse Error Classification and Handling', () => {
    it('should classify JSON parse error', () => {
      const parseError = new Error('JSON.parse: unexpected token < in JSON at position 0');
      const result = handleError(parseError, 'parseData', 'trace', mockShowToast);

      expect(result.errorType).toBe(ErrorType.PARSE_ERROR);
      expect(result.message).toContain('traitement des données');
      expect(mockShowToast).toHaveBeenCalledWith(result.message);
    });

    it('should classify parse error variants', () => {
      const error1 = new Error('Parse error: Invalid JSON');
      const result1 = handleError(error1, 'context', 'trace', mockShowToast);

      expect(result1.errorType).toBe(ErrorType.PARSE_ERROR);

      const error2 = new Error('Unexpected token in JSON');
      const result2 = handleError(error2, 'context', 'trace');

      expect(result2.errorType).toBe(ErrorType.PARSE_ERROR);
    });
  });

  // ─── Tests: Unknown Errors ──────────────────────────────────────────────────────

  describe('Unknown Error Classification and Handling', () => {
    it('should classify unclassifiable error as UNKNOWN_ERROR', () => {
      const unknownError = new Error('Something went wrong');
      const result = handleError(unknownError, 'context', 'trace', mockShowToast);

      expect(result.errorType).toBe(ErrorType.UNKNOWN_ERROR);
      expect(result.message).toContain('inattendue');
      expect(mockShowToast).toHaveBeenCalledWith(result.message);
    });

    it('should handle non-Error objects', () => {
      const result = handleError('string error', 'context', 'trace', mockShowToast);

      expect(result).toBeInstanceOf(DomoticzError);
      expect(result.errorType).toBe(ErrorType.UNKNOWN_ERROR);
      expect(mockShowToast).toHaveBeenCalled();
    });

    it('should handle null or undefined', () => {
      const result1 = handleError(null, 'context', 'trace', mockShowToast);
      expect(result1).toBeInstanceOf(DomoticzError);
      expect(result1.errorType).toBe(ErrorType.UNKNOWN_ERROR);

      const result2 = handleError(undefined, 'context', 'trace', mockShowToast);
      expect(result2).toBeInstanceOf(DomoticzError);
      expect(result2.errorType).toBe(ErrorType.UNKNOWN_ERROR);
    });

    it('should handle object with message property', () => {
      const customError = { message: 'Custom error message' };
      const result = handleError(customError, 'context', 'trace', mockShowToast);

      expect(result).toBeInstanceOf(DomoticzError);
      expect(result.errorType).toBe(ErrorType.UNKNOWN_ERROR);
    });
  });

  // ─── Tests: Toast Integration ────────────────────────────────────────────────────

  describe('Toast Display Integration', () => {
    it('should display toast when showToast is provided', () => {
      const error = new Error('Test error');
      handleError(error, 'context', 'trace123', mockShowToast);

      expect(mockShowToast).toHaveBeenCalledTimes(1);
      expect(mockShowToast).toHaveBeenCalledWith(expect.any(String));
    });

    it('should NOT display toast when showToast is not provided', () => {
      const error = new Error('Test error');
      handleError(error, 'context', 'trace123');

      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('should display user-friendly message in French', () => {
      const networkError = new Error('Network request failed');
      const result = handleError(networkError, 'context', 'trace', mockShowToast);

      const toastMessage = mockShowToast.mock.calls[0][0];
      expect(toastMessage).toMatch(/[àâäéèêëïîôöùûüœæç]/); // Contains French accents
      expect(toastMessage).not.toMatch(/Network|request/i); // No English tech terms
    });
  });

  // ─── Tests: Logging with TraceId ────────────────────────────────────────────────

  describe('Logging with TraceId', () => {
    it('should log error with traceId', () => {
      const error = new Error('Test error');
      handleError(error, 'loadDevices', 'abc123def456', mockShowToast);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('abc123def456')
      );
    });

    it('should log error with context', () => {
      const error = new Error('Test error');
      handleError(error, 'loadDevices', 'trace', mockShowToast);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('loadDevices')
      );
    });

    it('should log error with error type', () => {
      const error = new Error('Network request failed');
      handleError(error, 'context', 'trace', mockShowToast);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('NETWORK_ERROR')
      );
    });

    it('should log original error message', () => {
      const originalMsg = 'SSL certificate problem';
      const error = new Error(originalMsg);
      handleError(error, 'context', 'trace', mockShowToast);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(originalMsg)
      );
    });
  });

  // ─── Tests: DomoticzError Structure ──────────────────────────────────────────────

  describe('DomoticzError Structure', () => {
    it('should generate unique error codes', () => {
      const error1 = new Error('Error 1');
      const result1 = handleError(error1, 'context', 'trace1', mockShowToast);

      // Wait slightly to ensure different timestamp
      jest.useFakeTimers();
      jest.advanceTimersByTime(10);

      const error2 = new Error('Error 2');
      const result2 = handleError(error2, 'context', 'trace2', mockShowToast);

      jest.useRealTimers();

      expect(result1.code).not.toBe(result2.code);
      expect(result1.code).toMatch(/^[A-Z_]+_\d+$/);
    });

    it('should preserve traceId in DomoticzError', () => {
      const error = new Error('Test');
      const traceId = 'custom-trace-id-12345';
      const result = handleError(error, 'context', traceId, mockShowToast);

      expect(result.traceId).toBe(traceId);
    });

    it('should preserve context in logs', () => {
      const error = new Error('Test');
      handleError(error, 'myContext', 'trace', mockShowToast);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[myContext]')
      );
    });

    it('should preserve original error', () => {
      const originalError = new Error('Original message');
      const result = handleError(originalError, 'context', 'trace');

      expect(result.originalError).toBe(originalError);
      expect(result.originalError?.message).toBe('Original message');
    });

    it('should not set originalError for non-Error inputs', () => {
      const result1 = handleError('string', 'context', 'trace');
      expect(result1.originalError).toBeUndefined();

      const result2 = handleError({ message: 'obj' }, 'context', 'trace');
      expect(result2.originalError).toBeUndefined();
    });
  });

  // ─── Tests: generateTraceId ─────────────────────────────────────────────────────

  describe('generateTraceId', () => {
    it('should generate trace IDs without dashes', () => {
      const traceId = generateTraceId();

      expect(traceId).not.toContain('-');
      expect(traceId).toHaveLength(32); // UUID without dashes
    });

    it('should generate alphanumeric trace IDs', () => {
      const traceId = generateTraceId();

      expect(traceId).toMatch(/^[a-f0-9]{32}$/i);
    });

    it('should generate consistent format with mocked uuid', () => {
      const traceId = generateTraceId();

      // With mocked uuid returning 'aaaabbbb-cccc-dddd-eeee-ffffaaaabbbb'
      expect(traceId).toBe('aaaabbbbccccddddeeeeffffaaaabbbb');
    });
  });

  // ─── Tests: Real-world Scenarios ─────────────────────────────────────────────────

  describe('Real-world Error Scenarios', () => {
    it('should handle device loading failure with network error', () => {
      const networkError = new Error('Failed to fetch https://domoticz.local:8080/json.htm?type=devices');
      const result = handleError(
        networkError,
        'loadDomoticzDevices',
        'trace-load-devices-001',
        mockShowToast
      );

      expect(result.errorType).toBe(ErrorType.NETWORK_ERROR);
      expect(result.traceId).toBe('trace-load-devices-001');
      expect(mockShowToast).toHaveBeenCalled();
      expect(result.message).toContain('connexion');
    });

    it('should handle authentication failure', () => {
      const authError = new Error('GET https://domoticz.local:8080/json.htm 401 Unauthorized');
      const result = handleError(authError, 'connectToDomoticz', 'trace-auth-001', mockShowToast);

      expect(result.errorType).toBe(ErrorType.API_ERROR);
      expect(result.message).toContain('Authentification');
    });

    it('should handle malformed JSON response', () => {
      const parseError = new Error('Unexpected token < in JSON at position 0');
      const result = handleError(parseError, 'parseDevices', 'trace-parse-001', mockShowToast);

      expect(result.errorType).toBe(ErrorType.PARSE_ERROR);
      expect(result.message).toContain('traitement des données');
    });

    it('should handle device command failure', () => {
      const cmdError = new Error('POST https://domoticz.local:8080/json.htm?type=command - ERR: Unknown device');
      const result = handleError(
        cmdError,
        'updateDeviceState',
        'trace-cmd-001',
        mockShowToast
      );

      expect(result.errorType).toBe(ErrorType.API_ERROR);
      expect(result.message).toContain('communication');
    });
  });
});
