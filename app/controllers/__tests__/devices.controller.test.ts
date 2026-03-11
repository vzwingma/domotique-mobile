import { loadDomoticzDevices, onClickDeviceIcon, updateDeviceLevel, addActionForFavorite, refreshEquipementState, getBlindGroupLabel, getLightsGroupLabel, getStatusLabel } from '../devices.controller';
import callDomoticz from '@/app/services/ClientHTTP.service';
import { getFavoritesFromStorage, saveFavoritesToStorage } from '@/app/services/DataUtils.service';
import { DomoticzDeviceType, DomoticzDeviceStatus, DomoticzSwitchType } from '@/app/enums/DomoticzEnum';
import DomoticzDevice from '@/app/models/domoticzDevice.model';

jest.mock('@/app/services/ClientHTTP.service');
jest.mock('@/app/services/DataUtils.service', () => ({
    ...jest.requireActual('@/app/services/DataUtils.service'),
    getFavoritesFromStorage: jest.fn(),
    saveFavoritesToStorage: jest.fn(),
}));
jest.mock('@/hooks/AndroidToast', () => ({
    showToast: jest.fn(),
    ToastDuration: { SHORT: 'SHORT', LONG: 'LONG' },
}));

afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
});

const mockCallDomoticz = callDomoticz as jest.Mock;
const mockGetFavorites = getFavoritesFromStorage as jest.Mock;
const mockSaveFavorites = saveFavoritesToStorage as jest.Mock;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeRawDevice(overrides: Partial<any> = {}): any {
    return {
        idx: '113',
        Name: 'Lumière Salon',
        Status: 'On',
        Level: 100,
        Type: 'Light/Switch',
        SwitchType: DomoticzSwitchType.ONOFF,
        LastUpdate: '2024-01-01 12:00:00',
        HaveTimeout: false,
        Data: '',
        ...overrides,
    };
}

function makeDevice(overrides: Partial<DomoticzDevice> = {}): DomoticzDevice {
    return {
        idx: 113,
        rang: 0,
        name: 'Lumière Salon',
        lastUpdate: '2024-01-01',
        isActive: true,
        level: 100,
        unit: '%',
        consistantLevel: true,
        type: DomoticzDeviceType.LUMIERE,
        subType: 'Light/Switch',
        switchType: DomoticzSwitchType.ONOFF as any,
        status: DomoticzDeviceStatus.ON,
        data: '',
        isGroup: false,
        ...overrides,
    } as unknown as DomoticzDevice;
}

// ─── loadDomoticzDevices ───────────────────────────────────────────────────────

describe('loadDomoticzDevices', () => {
    beforeEach(() => jest.clearAllMocks());

    it('appelle storeDevicesData avec les lumières et volets triés', async () => {
        const rawDevices = [
            makeRawDevice({ idx: '113', Name: 'Lumière Salon', Level: 100 }),
            makeRawDevice({ idx: '85', Name: 'Volet Salon', Level: 50 }),
        ];
        mockCallDomoticz.mockResolvedValue({ result: rawDevices });
        const storeDevicesData = jest.fn();

        loadDomoticzDevices(storeDevicesData);
        await Promise.resolve(); // flush microtasks

        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(storeDevicesData).toHaveBeenCalledWith(expect.any(Array));
    });

    it('détecte le groupe via le préfixe [Grp] dans le nom', async () => {
        const rawDevices = [
            makeRawDevice({ idx: '122', Name: '[Grp] Lumière Salon', Level: 100 }),
        ];
        mockCallDomoticz.mockResolvedValue({ result: rawDevices });
        const storeDevicesData = jest.fn();

        loadDomoticzDevices(storeDevicesData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const devices: DomoticzDevice[] = storeDevicesData.mock.calls[0]?.[0] ?? [];
        const group = devices.find(d => d.idx === 122);
        expect(group?.isGroup).toBe(true);
    });

    it('supprime le préfixe [Grp] du nom affiché', async () => {
        mockCallDomoticz.mockResolvedValue({ result: [makeRawDevice({ idx: '122', Name: '[Grp] Toutes lumières' })] });
        const storeDevicesData = jest.fn();

        loadDomoticzDevices(storeDevicesData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const devices: DomoticzDevice[] = storeDevicesData.mock.calls[0]?.[0] ?? [];
        expect(devices[0]?.name).not.toContain('[Grp]');
    });

    it('appelle storeDevicesData([]) et affiche un toast en cas d\'erreur', async () => {
        mockCallDomoticz.mockRejectedValue(new Error('Network error'));
        const storeDevicesData = jest.fn();

        loadDomoticzDevices(storeDevicesData);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(storeDevicesData).toHaveBeenCalledWith([]);
    });

    it('isActive est false quand HaveTimeout est true', async () => {
        mockCallDomoticz.mockResolvedValue({ result: [makeRawDevice({ idx: '113', Name: 'Lumière Salon', HaveTimeout: true })] });
        const storeDevicesData = jest.fn();

        loadDomoticzDevices(storeDevicesData);
        await new Promise(resolve => setTimeout(resolve, 0));

        const devices: DomoticzDevice[] = storeDevicesData.mock.calls[0]?.[0] ?? [];
        expect(devices[0]?.isActive).toBe(false);
    });
});

// ─── onClickDeviceIcon ─────────────────────────────────────────────────────────

describe('onClickDeviceIcon', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCallDomoticz.mockResolvedValue({});
        mockGetFavorites.mockResolvedValue([]);
    });

    it('ne fait rien si l\'équipement est inactif', () => {
        const device = makeDevice({ isActive: false });
        const setter = jest.fn();
        onClickDeviceIcon(device, setter);
        expect(mockCallDomoticz).not.toHaveBeenCalled();
    });

    it('appelle updateDeviceState (ON→OFF) pour un équipement ONOFF actif et allumé', async () => {
        const device = makeDevice({ switchType: DomoticzSwitchType.ONOFF as any, status: DomoticzDeviceStatus.ON });
        const setter = jest.fn();

        onClickDeviceIcon(device, setter);
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockCallDomoticz).toHaveBeenCalled();
    });

    it('appelle updateDeviceLevel pour un équipement SLIDER actif', async () => {
        const device = makeDevice({ switchType: DomoticzSwitchType.SLIDER as any, status: DomoticzDeviceStatus.ON, level: 60 });
        const setter = jest.fn();

        onClickDeviceIcon(device, setter);
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockCallDomoticz).toHaveBeenCalled();
    });
});

// ─── updateDeviceLevel ─────────────────────────────────────────────────────────

describe('updateDeviceLevel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCallDomoticz.mockResolvedValue({});
        mockGetFavorites.mockResolvedValue([]);
    });

    it('appelle CMD_BLINDS_LIGHTS_SET_LEVEL quand level > 0', async () => {
        const device = makeDevice({ idx: 113 });
        const setter = jest.fn();

        updateDeviceLevel(113, device, 50, setter);
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockCallDomoticz).toHaveBeenCalledWith(
            expect.stringContaining('switchlight'),
            expect.arrayContaining([
                expect.objectContaining({ value: '113' }),
                expect.objectContaining({ value: '50' }),
            ])
        );
    });

    it('appelle CMD_BLINDS_LIGHTS_ON_OFF (Off) quand level = 0', async () => {
        const device = makeDevice({ idx: 113 });
        const setter = jest.fn();

        updateDeviceLevel(113, device, 0, setter);
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockCallDomoticz).toHaveBeenCalledWith(
            expect.stringContaining('switchlight'),
            expect.arrayContaining([
                expect.objectContaining({ value: '113' }),
                expect.objectContaining({ value: 'Off' }),
            ])
        );
    });

    it('plafonne le level à 100', async () => {
        const device = makeDevice({ idx: 113 });
        const setter = jest.fn();

        updateDeviceLevel(113, device, 99, setter);
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockCallDomoticz).toHaveBeenCalledWith(
            expect.anything(),
            expect.arrayContaining([expect.objectContaining({ value: '100' })])
        );
    });
});

// ─── addActionForFavorite ──────────────────────────────────────────────────────

describe('addActionForFavorite', () => {
    beforeEach(() => jest.clearAllMocks());

    it('ajoute un nouveau favori si absent de la liste', async () => {
        mockGetFavorites.mockResolvedValue([]);
        const device = makeDevice({ idx: 42, name: 'Nouvelle lumière' });

        addActionForFavorite(device);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockSaveFavorites).toHaveBeenCalledWith([
            expect.objectContaining({ idx: 42, nbOfUse: 1 }),
        ]);
    });

    it('incrémente nbOfUse si le favori existe déjà', async () => {
        mockGetFavorites.mockResolvedValue([
            { idx: 42, nbOfUse: 5, name: 'Lumière', type: DomoticzDeviceType.LUMIERE, subType: '' },
        ]);
        const device = makeDevice({ idx: 42 });

        addActionForFavorite(device);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockSaveFavorites).toHaveBeenCalledWith([
            expect.objectContaining({ idx: 42, nbOfUse: 6 }),
        ]);
    });
});

// ─── refreshEquipementState ────────────────────────────────────────────────────

describe('refreshEquipementState', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        // callDomoticz renvoie un résultat vide pour ne pas planter le mapper
        mockCallDomoticz.mockResolvedValue({ result: [] });
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('appelle callDomoticz immédiatement (appel initial)', () => {
        const setter = jest.fn();

        refreshEquipementState(setter);

        // loadDomoticzDevices est appelé immédiatement → callDomoticz est déclenché
        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);
    });

    it('appelle callDomoticz une seconde fois après 1000ms (setTimeout)', () => {
        const setter = jest.fn();

        refreshEquipementState(setter);
        // Avancer les timers de 1000 ms pour déclencher le setTimeout
        jest.advanceTimersByTime(1000);

        // Le callback du setTimeout appelle loadDomoticzDevices → callDomoticz une 2e fois
        expect(mockCallDomoticz).toHaveBeenCalledTimes(2);
    });

    it('n\'appelle pas callDomoticz une 2e fois avant 1000ms', () => {
        const setter = jest.fn();

        refreshEquipementState(setter);
        jest.advanceTimersByTime(999);

        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);
    });
});

// ─── getBlindGroupLabel ────────────────────────────────────────────────────────

describe('getBlindGroupLabel — libellé groupe de volets', () => {
    it('retourne "Mixte" quand consistantLevel=false', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, consistantLevel: false, level: 50 });
        expect(getBlindGroupLabel(device)).toBe('Mixte');
    });

    it('retourne "Fermé" quand level=0', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, consistantLevel: true, level: 0 });
        expect(getBlindGroupLabel(device)).toBe('Fermé');
    });

    it('retourne "Ouvert" quand level=100', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, consistantLevel: true, level: 100 });
        expect(getBlindGroupLabel(device)).toBe('Ouverts');
    });

    it('retourne le niveau en % quand level est intermédiaire', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, consistantLevel: true, level: 50 });
        expect(getBlindGroupLabel(device)).toBe('50');
        expect(device.unit).toBe('%');
    });
});

describe('getLightsGroupLabel — libellé groupe lumières', () => {
    it('retourne "Allumées" pour un groupe non cohérent mais status=On et level>0 (mix dimmer/switch)', () => {
        const device = makeDevice({
            type: DomoticzDeviceType.LUMIERE,
            isGroup: true,
            consistantLevel: false,
            status: DomoticzDeviceStatus.ON,
            level: 40,
        });
        expect(getLightsGroupLabel(device)).toBe('Allumées');
    });

    it('retourne "Éteintes" pour un groupe status=Off', () => {
        const device = makeDevice({
            type: DomoticzDeviceType.LUMIERE,
            isGroup: true,
            status: DomoticzDeviceStatus.OFF,
            level: 0,
        });
        expect(getLightsGroupLabel(device)).toBe('Éteintes');
    });

    it('retourne "Mixte" pour un groupe non cohérent sans status On explicite', () => {
        const device = makeDevice({
            type: DomoticzDeviceType.LUMIERE,
            isGroup: true,
            consistantLevel: false,
            status: '40 %' as DomoticzDeviceStatus,
            level: 40,
        });
        expect(getLightsGroupLabel(device)).toBe('Mixte');
    });
});

describe('getStatusLabel — volets groupes via getBlindGroupLabel', () => {
    it('retourne "Mixte" pour un groupe de volets avec niveaux incohérents', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, consistantLevel: false, level: 50, isActive: true });
        expect(getStatusLabel(device, 50, false)).toBe('Mixte');
    });

    it('retourne "Fermé" pour un groupe de volets fermés (level=0)', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, consistantLevel: true, level: 0, isActive: true });
        expect(getStatusLabel(device, 0, false)).toBe('Fermé');
    });

    it('retourne "Fermé" pour un volet individuel status=Off', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: false, status: DomoticzDeviceStatus.OFF, isActive: true });
        expect(getStatusLabel(device, 0, false)).toBe('Fermé');
    });
});
