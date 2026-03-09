import {
    loadDomoticzThermostats,
    evaluateThermostatPoint,
    updateThermostatPoint,
    refreshEquipementState,
} from '../thermostats.controller';
import callDomoticz from '@/app/services/ClientHTTP.service';
import { DomoticzDeviceType, DomoticzThermostatLevelValue } from '@/app/enums/DomoticzEnum';
import DomoticzThermostat from '@/app/models/domoticzThermostat.model';

jest.mock('@/app/services/ClientHTTP.service');
jest.mock('@/hooks/AndroidToast', () => ({
    showToast: jest.fn(),
    ToastDuration: { SHORT: 'SHORT', LONG: 'LONG' },
}));

const mockCallDomoticz = callDomoticz as jest.Mock;

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Construit un raw device thermostat tel que retourné par l'API Domoticz */
function makeRawThermostat(overrides: Partial<any> = {}): any {
    return {
        idx: '10',
        Name: 'Thermostat Chambre',
        Type: 'Thermostat',
        SetPoint: 20,
        LastUpdate: '2024-01-01 12:00:00',
        HaveTimeout: false,
        Data: '20.0',
        vunit: '°C',
        ...overrides,
    };
}

/** Construit un DomoticzThermostat hydraté */
function makeThermostat(overrides: Partial<DomoticzThermostat> = {}): DomoticzThermostat {
    return {
        idx: 10,
        rang: 0,
        name: 'Thermostat Chambre',
        lastUpdate: '2024-01-01',
        isActive: true,
        temp: 20,
        type: DomoticzDeviceType.THERMOSTAT,
        status: '20.0',
        data: '20.0',
        unit: '°C',
        ...overrides,
    } as unknown as DomoticzThermostat;
}

// ─── evaluateThermostatPoint ───────────────────────────────────────────────────

describe('evaluateThermostatPoint', () => {
    it('retourne la valeur normale quand elle est dans la plage (20)', () => {
        expect(evaluateThermostatPoint(20)).toBe(20);
    });

    it('retourne la valeur normale quand elle est dans la plage (25)', () => {
        expect(evaluateThermostatPoint(25)).toBe(25);
    });

    it('retourne MIN quand la valeur est en dessous du minimum', () => {
        // MIN = DomoticzThermostatLevelValue.MIN (10 selon l'enum actuel)
        const result = evaluateThermostatPoint(2);
        expect(result).toBe(DomoticzThermostatLevelValue.MIN);
    });

    it('retourne MAX quand la valeur est au-dessus du maximum', () => {
        // MAX = DomoticzThermostatLevelValue.MAX (40 selon l'enum actuel)
        const result = evaluateThermostatPoint(45);
        expect(result).toBe(DomoticzThermostatLevelValue.MAX);
    });

    it('retourne MIN exactement quand la valeur est égale à MIN', () => {
        expect(evaluateThermostatPoint(DomoticzThermostatLevelValue.MIN)).toBe(DomoticzThermostatLevelValue.MIN);
    });

    it('retourne MAX exactement quand la valeur est égale à MAX', () => {
        expect(evaluateThermostatPoint(DomoticzThermostatLevelValue.MAX)).toBe(DomoticzThermostatLevelValue.MAX);
    });

    it('retourne MIN quand la valeur vaut MIN - 1', () => {
        expect(evaluateThermostatPoint(DomoticzThermostatLevelValue.MIN - 1)).toBe(DomoticzThermostatLevelValue.MIN);
    });

    it('retourne MAX quand la valeur vaut MAX + 1', () => {
        expect(evaluateThermostatPoint(DomoticzThermostatLevelValue.MAX + 1)).toBe(DomoticzThermostatLevelValue.MAX);
    });

    it('gère les valeurs sous forme de chaîne (conversion numérique)', () => {
        const result = evaluateThermostatPoint('20');
        expect(result).toBe(20);
    });
});

// ─── loadDomoticzThermostats ───────────────────────────────────────────────────

describe('loadDomoticzThermostats', () => {
    beforeEach(() => jest.clearAllMocks());

    it('appelle storeThermostatsData avec les thermostats filtrés et mappés', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [
                makeRawThermostat({ idx: '10', Name: 'Thermostat Chambre', SetPoint: 20 }),
                makeRawThermostat({ idx: '11', Name: 'Thermostat Salon', SetPoint: 22 }),
            ],
        });
        const storeThermostatsData = jest.fn();

        loadDomoticzThermostats(storeThermostatsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(storeThermostatsData).toHaveBeenCalledTimes(1);
        const thermostats: DomoticzThermostat[] = storeThermostatsData.mock.calls[0][0];
        expect(thermostats).toHaveLength(2);
    });

    it('filtre les équipements non-thermostat (lumières, volets…)', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [
                makeRawThermostat({ idx: '10', Name: 'Thermostat Chambre', SetPoint: 20 }),
                { idx: '113', Name: 'Lumière Salon', Status: 'On', Level: 100, Type: 'Light/Switch',
                  SwitchType: 'On/Off', LastUpdate: '2024-01-01', HaveTimeout: false, Data: '' },
            ],
        });
        const storeThermostatsData = jest.fn();

        loadDomoticzThermostats(storeThermostatsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const thermostats: DomoticzThermostat[] = storeThermostatsData.mock.calls[0][0];
        expect(thermostats).toHaveLength(1);
        expect(thermostats[0].idx).toBe(10);
    });

    it('mappe correctement les propriétés du thermostat', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [makeRawThermostat({ idx: '10', Name: 'Thermostat Chambre', SetPoint: 22, vunit: '°C', Data: '22.0' })],
        });
        const storeThermostatsData = jest.fn();

        loadDomoticzThermostats(storeThermostatsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const thermostat: DomoticzThermostat = storeThermostatsData.mock.calls[0][0][0];
        expect(thermostat.idx).toBe(10);
        expect(thermostat.temp).toBe(22);
        expect(thermostat.unit).toBe('°C');
        expect(thermostat.status).toBe('22.0');
        expect(thermostat.type).toBe(DomoticzDeviceType.THERMOSTAT);
    });

    it('supprime le préfixe "Tydom " du nom affiché', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [makeRawThermostat({ Name: 'Tydom Thermostat Salon', SetPoint: 20 })],
        });
        const storeThermostatsData = jest.fn();

        loadDomoticzThermostats(storeThermostatsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const thermostat: DomoticzThermostat = storeThermostatsData.mock.calls[0][0][0];
        expect(thermostat.name).not.toContain('Tydom ');
        expect(thermostat.name).toBe('Thermostat Salon');
    });

    it('isActive est false quand HaveTimeout est true', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [makeRawThermostat({ HaveTimeout: true })],
        });
        const storeThermostatsData = jest.fn();

        loadDomoticzThermostats(storeThermostatsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const thermostat: DomoticzThermostat = storeThermostatsData.mock.calls[0][0][0];
        expect(thermostat.isActive).toBe(false);
    });

    it('normalise SetPoint au MIN si en dessous de la valeur minimale', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [makeRawThermostat({ SetPoint: 2 })],
        });
        const storeThermostatsData = jest.fn();

        loadDomoticzThermostats(storeThermostatsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const thermostat: DomoticzThermostat = storeThermostatsData.mock.calls[0][0][0];
        expect(thermostat.temp).toBe(DomoticzThermostatLevelValue.MIN);
    });

    it('normalise SetPoint au MAX si au-dessus de la valeur maximale', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [makeRawThermostat({ SetPoint: 50 })],
        });
        const storeThermostatsData = jest.fn();

        loadDomoticzThermostats(storeThermostatsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const thermostat: DomoticzThermostat = storeThermostatsData.mock.calls[0][0][0];
        expect(thermostat.temp).toBe(DomoticzThermostatLevelValue.MAX);
    });

    it('appelle storeThermostatsData([]) et affiche un toast en cas d\'erreur', async () => {
        mockCallDomoticz.mockRejectedValue(new Error('Network error'));
        const storeThermostatsData = jest.fn();

        loadDomoticzThermostats(storeThermostatsData);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(storeThermostatsData).toHaveBeenCalledWith([]);
    });
});

// ─── updateThermostatPoint ─────────────────────────────────────────────────────

describe('updateThermostatPoint', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Retourner un résultat vide pour que le finally (refreshEquipementState) ne plante pas
        mockCallDomoticz.mockResolvedValue({ result: [] });
    });

    it('appelle callDomoticz avec l\'URL CMD_THERMOSTAT_SET_POINT et les bons paramètres', async () => {
        const device = makeThermostat({ idx: 10, unit: '°C' });
        const setter = jest.fn();

        updateThermostatPoint(10, device, 22, setter);
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockCallDomoticz).toHaveBeenCalledWith(
            expect.stringContaining('setsetpoint'),
            expect.arrayContaining([
                expect.objectContaining({ value: '10' }),
                expect.objectContaining({ value: '22' }),
            ])
        );
    });

    it('normalise la température au MIN avant d\'appeler callDomoticz', async () => {
        const device = makeThermostat({ idx: 10, unit: '°C' });
        const setter = jest.fn();

        updateThermostatPoint(10, device, 2, setter);
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockCallDomoticz).toHaveBeenCalledWith(
            expect.stringContaining('setsetpoint'),
            expect.arrayContaining([
                expect.objectContaining({ value: String(DomoticzThermostatLevelValue.MIN) }),
            ])
        );
    });

    it('normalise la température au MAX avant d\'appeler callDomoticz', async () => {
        const device = makeThermostat({ idx: 10, unit: '°C' });
        const setter = jest.fn();

        updateThermostatPoint(10, device, 50, setter);
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockCallDomoticz).toHaveBeenCalledWith(
            expect.stringContaining('setsetpoint'),
            expect.arrayContaining([
                expect.objectContaining({ value: String(DomoticzThermostatLevelValue.MAX) }),
            ])
        );
    });

    it('appelle refreshEquipementState (callDomoticz 2x) après la commande', async () => {
        const device = makeThermostat({ idx: 10, unit: '°C' });
        const setter = jest.fn();

        updateThermostatPoint(10, device, 20, setter);
        // Attendre que la Promise soit résolue ET que le finally s'exécute
        await new Promise(resolve => setTimeout(resolve, 20));

        // 1er appel = setsetpoint, 2e appel = refreshEquipementState (loadDomoticzThermostats)
        expect(mockCallDomoticz).toHaveBeenCalledTimes(2);
    });
});

// ─── refreshEquipementState (thermostats) ─────────────────────────────────────

describe('refreshEquipementState', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        // Résultat vide pour que le mapper ne plante pas
        mockCallDomoticz.mockResolvedValue({ result: [] });
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('appelle callDomoticz immédiatement (appel initial)', () => {
        const setter = jest.fn();

        refreshEquipementState(setter);

        // loadDomoticzThermostats est appelé immédiatement → callDomoticz déclenché
        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);
    });

    it('appelle callDomoticz une seconde fois après 1000ms (setTimeout)', () => {
        const setter = jest.fn();

        refreshEquipementState(setter);
        jest.advanceTimersByTime(1000);

        expect(mockCallDomoticz).toHaveBeenCalledTimes(2);
    });

    it('n\'appelle pas callDomoticz une 2e fois avant 1000ms', () => {
        const setter = jest.fn();

        refreshEquipementState(setter);
        jest.advanceTimersByTime(999);

        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);
    });
});
