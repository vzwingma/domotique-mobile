import { connectToDomoticz } from '../index.controller';
import callDomoticz from '@/app/services/ClientHTTP.service';
import DomoticzConfig from '@/app/models/domoticzConfig.model';

jest.mock('@/app/services/ClientHTTP.service');
jest.mock('@/hooks/AndroidToast', () => ({
    showToast: jest.fn(),
    ToastDuration: { SHORT: 'SHORT', LONG: 'LONG' },
}));

const mockCallDomoticz = callDomoticz as jest.Mock;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeDomoticzConfig(overrides: Partial<any> = {}): any {
    return {
        status: 'OK',
        version: '2024.1',
        Revision: '12345',
        ...overrides,
    };
}

// ─── connectToDomoticz ─────────────────────────────────────────────────────────

describe('connectToDomoticz', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('appelle setIsLoading(true) au démarrage', async () => {
        mockCallDomoticz.mockResolvedValue(makeDomoticzConfig());
        const setIsLoading = jest.fn();
        const storeConnexionData = jest.fn();
        const setError = jest.fn();

        connectToDomoticz({ setIsLoading, storeConnexionData, setError });
        
        expect(setIsLoading).toHaveBeenCalledWith(true);
    });

    it('appelle callDomoticz avec GET_CONFIG', async () => {
        mockCallDomoticz.mockResolvedValue(makeDomoticzConfig());
        const setIsLoading = jest.fn();
        const storeConnexionData = jest.fn();
        const setError = jest.fn();

        connectToDomoticz({ setIsLoading, storeConnexionData, setError });
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockCallDomoticz).toHaveBeenCalledWith(
            expect.stringContaining('getconfig')
        );
    });

    it('mappe correctement la réponse API vers DomoticzConfig', async () => {
        mockCallDomoticz.mockResolvedValue(makeDomoticzConfig({
            status: 'OK',
            version: '2024.1',
            Revision: '12345'
        }));
        const setIsLoading = jest.fn();
        const storeConnexionData = jest.fn();
        const setError = jest.fn();

        connectToDomoticz({ setIsLoading, storeConnexionData, setError });
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(storeConnexionData).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'OK',
                version: '2024.1',
                revision: '12345'
            })
        );
    });

    it('appelle setIsLoading(false) après succès', async () => {
        mockCallDomoticz.mockResolvedValue(makeDomoticzConfig());
        const setIsLoading = jest.fn();
        const storeConnexionData = jest.fn();
        const setError = jest.fn();

        connectToDomoticz({ setIsLoading, storeConnexionData, setError });
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(setIsLoading).toHaveBeenCalledWith(false);
    });

    it('appelle setIsLoading(false) et setError en cas d\'erreur réseau', async () => {
        const networkError = new Error('Network error');
        mockCallDomoticz.mockRejectedValue(networkError);
        const setIsLoading = jest.fn();
        const storeConnexionData = jest.fn();
        const setError = jest.fn();

        connectToDomoticz({ setIsLoading, storeConnexionData, setError });
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(setIsLoading).toHaveBeenCalledWith(false);
        expect(setError).toHaveBeenCalledWith(networkError);
    });

    it('ne remplit pas storeConnexionData en cas d\'erreur', async () => {
        mockCallDomoticz.mockRejectedValue(new Error('Network error'));
        const setIsLoading = jest.fn();
        const storeConnexionData = jest.fn();
        const setError = jest.fn();

        connectToDomoticz({ setIsLoading, storeConnexionData, setError });
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(storeConnexionData).not.toHaveBeenCalled();
    });

    it('stocke la configuration même avec des données partielles', async () => {
        mockCallDomoticz.mockResolvedValue(makeDomoticzConfig({
            status: 'OK',
            version: '2024.1'
        }));
        const setIsLoading = jest.fn();
        const storeConnexionData = jest.fn();
        const setError = jest.fn();

        connectToDomoticz({ setIsLoading, storeConnexionData, setError });
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(storeConnexionData).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'OK' })
        );
    });

    it('gère les erreurs de timeout', async () => {
        const timeoutError = new Error('Timeout');
        mockCallDomoticz.mockRejectedValue(timeoutError);
        const setIsLoading = jest.fn();
        const storeConnexionData = jest.fn();
        const setError = jest.fn();

        connectToDomoticz({ setIsLoading, storeConnexionData, setError });
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(setError).toHaveBeenCalledWith(timeoutError);
        expect(setIsLoading).toHaveBeenCalledWith(false);
    });
});
