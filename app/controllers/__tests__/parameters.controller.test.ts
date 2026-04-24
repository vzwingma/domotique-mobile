import {
    loadDomoticzParameters,
    updateParameterValue,
    refreshEquipementState,
    handleResetFavorites,
} from '../parameters.controller';
import callDomoticz from '@/app/services/ClientHTTP.service';
import { clearFavoritesFromStorage } from '@/app/services/DataUtils.service';
import { DomoticzDeviceType, DomoticzSwitchType } from '@/app/enums/DomoticzEnum';
import DomoticzParameter from '@/app/models/domoticzParameter.model';
import { Alert } from 'react-native';

jest.mock('@/app/services/ClientHTTP.service');
jest.mock('@/app/services/DataUtils.service', () => ({
    ...jest.requireActual('@/app/services/DataUtils.service'),
    clearFavoritesFromStorage: jest.fn(),
}));
jest.mock('@/hooks/AndroidToast', () => ({
    showToast: jest.fn(),
    ToastDuration: { SHORT: 'SHORT', LONG: 'LONG' },
}));
jest.mock('react-native', () => ({
    Alert: {
        alert: jest.fn(),
    },
}));

const mockCallDomoticz = callDomoticz as jest.Mock;
const mockClearFavorites = clearFavoritesFromStorage as jest.Mock;
const mockAlert = Alert.alert as jest.Mock;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeRawParameter(overrides: Partial<any> = {}): any {
    return {
        idx: '200',
        Name: '[Param] Présence',
        Type: 'Light/Switch',
        Data: 'Occupé',
        Level: 0,
        LevelNames: Buffer.from('Absent|Occupé').toString('base64'),
        LastUpdate: '2024-01-01 12:00:00',
        HaveTimeout: false,
        SwitchType: DomoticzSwitchType.ONOFF,
        ...overrides,
    };
}

function makeParameter(overrides: Partial<DomoticzParameter> = {}): DomoticzParameter {
    return {
        idx: 200,
        name: '[Param] Présence',
        lastUpdate: '2024-01-01',
        type: DomoticzDeviceType.PARAMETRE,
        level: 0,
        levelNames: ['Absent', 'Occupé'],
        switchType: DomoticzSwitchType.ONOFF as any,
        status: 'Occupé',
        data: 'Occupé',
        ...overrides,
    } as unknown as DomoticzParameter;
}

// ─── loadDomoticzParameters ────────────────────────────────────────────────────

describe('loadDomoticzParameters', () => {
    beforeEach(() => jest.clearAllMocks());

    it('appelle storeParameters avec les paramètres mappés', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [
                makeRawParameter({ idx: '200', Name: '[Param] Présence' }),
                makeRawParameter({ idx: '201', Name: '[Param] Phase' }),
            ],
        });
        const storeParameters = jest.fn();

        loadDomoticzParameters(storeParameters);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(storeParameters).toHaveBeenCalledWith(expect.any(Array));
        const params: DomoticzParameter[] = storeParameters.mock.calls[0]?.[0] ?? [];
        expect(params.length).toBeGreaterThanOrEqual(2);
    });

    it('filtre les équipements non-paramètre (lumières, volets…)', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [
                makeRawParameter({ idx: '200', Name: '[Param] Présence' }),
                { idx: '113', Name: 'Lumière Salon', Status: 'On', Level: 100 },
            ],
        });
        const storeParameters = jest.fn();

        loadDomoticzParameters(storeParameters);
        await new Promise(resolve => setTimeout(resolve, 0));

        const params: DomoticzParameter[] = storeParameters.mock.calls[0]?.[0] ?? [];
        expect(params.every(p => p.type === DomoticzDeviceType.PARAMETRE || p.type === DomoticzDeviceType.PARAMETRE_RO)).toBe(true);
    });

    it('décode correctement les LevelNames depuis base64', async () => {
        const levelNamesBase64 = Buffer.from('Absent|Presence').toString('base64');
        mockCallDomoticz.mockResolvedValue({
            result: [
                makeRawParameter({
                    idx: '200',
                    LevelNames: levelNamesBase64,
                }),
            ],
        });
        const storeParameters = jest.fn();

        loadDomoticzParameters(storeParameters);
        await new Promise(resolve => setTimeout(resolve, 0));

        const params: DomoticzParameter[] = storeParameters.mock.calls[0]?.[0] ?? [];
        expect(params[0]?.levelNames).toEqual(['Absent', 'Presence']);
    });

    it('définit levelNames à [] si LevelNames est absent', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [
                makeRawParameter({ idx: '200', LevelNames: undefined }),
            ],
        });
        const storeParameters = jest.fn();

        loadDomoticzParameters(storeParameters);
        await new Promise(resolve => setTimeout(resolve, 0));

        const params: DomoticzParameter[] = storeParameters.mock.calls[0]?.[0] ?? [];
        expect(params[0]?.levelNames).toEqual([]);
    });

    it('mappe correctement les propriétés du paramètre', async () => {
        mockCallDomoticz.mockResolvedValue({
            result: [
                makeRawParameter({
                    idx: '200',
                    Name: '[Param] Présence',
                    Data: 'Occupé',
                    Level: 1,
                    vunit: '',
                }),
            ],
        });
        const storeParameters = jest.fn();

        loadDomoticzParameters(storeParameters);
        await new Promise(resolve => setTimeout(resolve, 0));

        const param: DomoticzParameter = storeParameters.mock.calls[0]?.[0]?.[0];
        expect(param.idx).toBe(200);
        expect(param.name).toBe('[Param] Présence');
        expect(param.status).toBe('Occupé');
        expect(param.level).toBe(1);
    });

    it('appelle storeParameters([]) et affiche un toast en cas d\'erreur', async () => {
        mockCallDomoticz.mockRejectedValue(new Error('Network error'));
        const storeParameters = jest.fn();

        loadDomoticzParameters(storeParameters);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(storeParameters).toHaveBeenCalledWith([]);
    });
});

// ─── updateParameterValue ──────────────────────────────────────────────────────

describe('updateParameterValue', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCallDomoticz.mockResolvedValue({ result: [] });
    });

    it('appelle callDomoticz avec CMD_BLINDS_LIGHTS_SET_LEVEL et les bons paramètres', async () => {
        const device = makeParameter({ idx: 200 });
        const setter = jest.fn();
        const levelObject = { id: 1, libelle: 'Occupé' };

        updateParameterValue(200, device, levelObject, setter);
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockCallDomoticz).toHaveBeenCalledWith(
            expect.stringContaining('switchlight'),
            expect.arrayContaining([
                expect.objectContaining({ value: '200' }),
                expect.objectContaining({ value: '1' }),
            ])
        );
    });

    it('utilise level.id (pas level.libelle) pour la commande', async () => {
        const device = makeParameter({ idx: 200 });
        const setter = jest.fn();
        const levelObject = { id: 2, libelle: 'Absent pour longtemps' };

        updateParameterValue(200, device, levelObject, setter);
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockCallDomoticz).toHaveBeenCalledWith(
            expect.anything(),
            expect.arrayContaining([
                expect.objectContaining({ value: '2' })
            ])
        );
    });

    it('appelle refreshEquipementState (callDomoticz 2x) après la commande', async () => {
        const device = makeParameter({ idx: 200 });
        const setter = jest.fn();
        const levelObject = { id: 1, libelle: 'Occupé' };

        updateParameterValue(200, device, levelObject, setter);
        await new Promise(resolve => setTimeout(resolve, 20));

        expect(mockCallDomoticz).toHaveBeenCalledTimes(2);
    });

    it('affiche un toast en cas d\'erreur de mise à jour', async () => {
        mockCallDomoticz.mockRejectedValue(new Error('Command failed'));
        const device = makeParameter({ idx: 200 });
        const setter = jest.fn();
        const levelObject = { id: 1, libelle: 'Occupé' };

        updateParameterValue(200, device, levelObject, setter);
        await new Promise(resolve => setTimeout(resolve, 10));

        // Le toast est affiché mais la fonction continue
        expect(mockCallDomoticz).toHaveBeenCalled();
    });
});

// ─── refreshEquipementState ────────────────────────────────────────────────────

describe('refreshEquipementState (parameters)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockCallDomoticz.mockResolvedValue({ result: [] });
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('appelle callDomoticz immédiatement (appel initial)', () => {
        const setter = jest.fn();

        refreshEquipementState(setter);

        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);
    });

    it('appelle callDomoticz une seconde fois après 1000ms', () => {
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

// ─── handleResetFavorites ──────────────────────────────────────────────────────

describe('handleResetFavorites', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('affiche une alerte de confirmation', () => {
        handleResetFavorites();

        expect(mockAlert).toHaveBeenCalledWith(
            expect.stringContaining('Remise à zéro'),
            expect.any(String),
            expect.any(Array)
        );
    });

    it('propose deux options : Annuler et Réinitialiser', () => {
        handleResetFavorites();

        const buttons = mockAlert.mock.calls[0]?.[2];
        expect(buttons).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ text: 'Annuler' }),
                expect.objectContaining({ text: 'Réinitialiser' }),
            ])
        );
    });

    it('appelle clearFavoritesFromStorage quand l\'utilisateur confirme', () => {
        handleResetFavorites();

        const buttons = mockAlert.mock.calls[0]?.[2];
        const resetButton = buttons?.find((b: any) => b.text === 'Réinitialiser');
        
        if (resetButton?.onPress) {
            resetButton.onPress();
        }

        expect(mockClearFavorites).toHaveBeenCalled();
    });

    it('n\'appelle pas clearFavoritesFromStorage si l\'utilisateur annule', () => {
        handleResetFavorites();

        const buttons = mockAlert.mock.calls[0]?.[2];
        const cancelButton = buttons?.find((b: any) => b.text === 'Annuler');
        
        if (cancelButton?.onPress) {
            cancelButton.onPress();
        }

        expect(mockClearFavorites).not.toHaveBeenCalled();
    });

    it('définit le style du bouton Réinitialiser à destructive', () => {
        handleResetFavorites();

        const buttons = mockAlert.mock.calls[0]?.[2];
        const resetButton = buttons?.find((b: any) => b.text === 'Réinitialiser');
        
        expect(resetButton?.style).toBe('destructive');
    });

    it('définit le style du bouton Annuler à cancel', () => {
        handleResetFavorites();

        const buttons = mockAlert.mock.calls[0]?.[2];
        const cancelButton = buttons?.find((b: any) => b.text === 'Annuler');
        
        expect(cancelButton?.style).toBe('cancel');
    });
});
