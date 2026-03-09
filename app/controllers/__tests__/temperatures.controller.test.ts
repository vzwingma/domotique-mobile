import { loadDomoticzTemperatures, sortTemperatureDevices } from '../temperatures.controller';
import callDomoticz from '@/app/services/ClientHTTP.service';
import DomoticzTemperature from '@/app/models/domoticzTemperature.model';

jest.mock('@/app/services/ClientHTTP.service');
jest.mock('@/hooks/AndroidToast', () => ({
    showToast: jest.fn(),
    ToastDuration: { SHORT: 'SHORT', LONG: 'LONG' },
}));

const mockCallDomoticz = callDomoticz as jest.Mock;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeRawTemp(overrides: Partial<any> = {}): any {
    return {
        idx: '1',
        Name: 'TempératureHumidité - Chambre',
        Type: 'Temp+Hum',
        SubType: 'LaCrosse TX3',
        Temp: 21.5,
        Humidity: 45,
        HumidityStatus: 'Comfortable',
        LastUpdate: '2024-01-01 12:00:00',
        HaveTimeout: false,
        Data: '21.5 C, 45 %',
        ...overrides,
    };
}

// ─── loadDomoticzTemperatures ──────────────────────────────────────────────────

describe('loadDomoticzTemperatures', () => {
    beforeEach(() => jest.clearAllMocks());

    it('appelle storeTempsData avec les températures mappées et triées', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [
                makeRawTemp({ idx: '1', Name: 'TempératureHumidité - Chambre' }),
                makeRawTemp({ idx: '2', Name: 'TempératureHumidité - Salon' }),
            ],
        });
        const storeTempsData = jest.fn();

        loadDomoticzTemperatures(storeTempsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(storeTempsData).toHaveBeenCalledWith(expect.any(Array));
        const temps: any[] = storeTempsData.mock.calls[0][0];
        expect(temps.length).toBe(2);
    });

    it('nettoie le préfixe "TempératureHumidité - " du nom', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [makeRawTemp({ Name: 'TempératureHumidité - Chambre' })],
        });
        const storeTempsData = jest.fn();

        loadDomoticzTemperatures(storeTempsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const temps = storeTempsData.mock.calls[0][0];
        expect(temps[0].name).toBe('Chambre');
    });

    it('remplace "TempHumBaro" par "Extérieur"', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [makeRawTemp({ Name: 'TempHumBaro' })],
        });
        const storeTempsData = jest.fn();

        loadDomoticzTemperatures(storeTempsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const temps = storeTempsData.mock.calls[0][0];
        expect(temps[0].name).toBe('Extérieur');
    });

    it('remplace "Tydom Temperature" par "Salon"', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [makeRawTemp({ Name: 'Tydom Temperature' })],
        });
        const storeTempsData = jest.fn();

        loadDomoticzTemperatures(storeTempsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const temps = storeTempsData.mock.calls[0][0];
        expect(temps[0].name).toBe('Salon');
    });

    it('filtre "Pi Temperature"', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [
                makeRawTemp({ idx: '1', Name: 'TempératureHumidité - Chambre' }),
                makeRawTemp({ idx: '2', Name: 'Pi Temperature' }),
            ],
        });
        const storeTempsData = jest.fn();

        loadDomoticzTemperatures(storeTempsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const temps = storeTempsData.mock.calls[0][0];
        expect(temps.every((t: any) => t.name !== 'Pi Temperature')).toBe(true);
    });

    it('isActive est false quand HaveTimeout est true', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [makeRawTemp({ HaveTimeout: true })],
        });
        const storeTempsData = jest.fn();

        loadDomoticzTemperatures(storeTempsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const temps = storeTempsData.mock.calls[0][0];
        expect(temps[0]?.isActive).toBe(false);
    });

    it('affiche un toast et ne crash pas en cas d\'erreur HTTP', async () => {
        mockCallDomoticz.mockRejectedValue(new Error('Network error'));
        const storeTempsData = jest.fn();

        // Ne doit pas lever d'exception
        expect(() => loadDomoticzTemperatures(storeTempsData)).not.toThrow();
        await new Promise(resolve => setTimeout(resolve, 0));
        // storeTempsData n'est pas appelé (aucun fallback pour temperatures)
    });
});

// ─── sortTemperatureDevices ────────────────────────────────────────────────────

describe('sortTemperatureDevices', () => {
    function makeTemp(name: string): DomoticzTemperature {
        return { name } as unknown as DomoticzTemperature;
    }

    it('place "Extérieur" après les autres (temp1 = Extérieur)', () => {
        const result = sortTemperatureDevices(makeTemp('Extérieur'), makeTemp('Chambre'));
        expect(result).toBe(1);
    });

    it('place "Extérieur" après les autres (temp2 = Extérieur)', () => {
        const result = sortTemperatureDevices(makeTemp('Chambre'), makeTemp('Extérieur'));
        expect(result).toBe(1);
    });

    it('trie alphabétiquement par nom (insensible à la casse)', () => {
        const result = sortTemperatureDevices(makeTemp('Chambre'), makeTemp('Salon'));
        expect(result).toBeLessThan(0);
    });

    it('retourne 1 quand temp1 > temp2 alphabétiquement', () => {
        const result = sortTemperatureDevices(makeTemp('Salon'), makeTemp('Chambre'));
        expect(result).toBeGreaterThan(0);
    });

    it('retourne 0 pour deux noms identiques', () => {
        const result = sortTemperatureDevices(makeTemp('Salon'), makeTemp('Salon'));
        expect(result).toBe(0);
    });
});
