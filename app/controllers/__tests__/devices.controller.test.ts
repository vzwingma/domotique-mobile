import { loadDomoticzDevices, onClickDeviceIcon, updateDeviceLevel, addActionForFavorite, refreshEquipementState, getBlindGroupLabel, getLightsGroupLabel, getBlindLabel, getSingleLightLabel, getStatusLabel, isDeviceOn } from '../devices.controller';
import callDomoticz from '@/app/services/ClientHTTP.service';
import { getFavoritesFromStorage, saveFavoritesToStorage } from '@/app/services/FavoritesManager.service';
import { DomoticzDeviceType, DomoticzDeviceStatus, DomoticzSwitchType } from '@/app/enums/DomoticzEnum';
import DomoticzDevice from '@/app/models/domoticzDevice.model';

jest.mock('@/app/services/ClientHTTP.service');
jest.mock('@/app/services/FavoritesManager.service', () => ({
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

    it('appelle callDomoticz avec la bonne URL sans paramètres supplémentaires', async () => {
        mockCallDomoticz.mockResolvedValue({ result: [makeRawDevice()] });
        const storeDevicesData = jest.fn();

        loadDomoticzDevices(storeDevicesData);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockCallDomoticz).toHaveBeenCalledWith(expect.any(String));
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

    it('déclenche un refresh post-action (callDomoticz appelé)', async () => {
        const device = makeDevice({ idx: 113 });
        const setter = jest.fn();

        updateDeviceLevel(113, device, 50, setter);
        await new Promise(resolve => setTimeout(resolve, 20));

        expect(mockCallDomoticz).toHaveBeenCalledWith(expect.any(String));
    });
});

describe('double refresh post-commande (devices)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockCallDomoticz.mockResolvedValue({ result: [] });
        mockGetFavorites.mockResolvedValue([]);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('updateDeviceState (via onClickDeviceIcon ONOFF) appelle GET_DEVICES immédiatement puis après 1000ms', async () => {
        const device = makeDevice({ switchType: DomoticzSwitchType.ONOFF as any, status: DomoticzDeviceStatus.ON });
        const setter = jest.fn();

        onClickDeviceIcon(device, setter);
        await (mockCallDomoticz.mock.results[0]?.value as Promise<unknown>);
        await Promise.resolve();

        expect(mockCallDomoticz).toHaveBeenCalledTimes(2);
        expect(mockCallDomoticz).toHaveBeenNthCalledWith(2, expect.stringContaining('devices'));

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        expect(mockCallDomoticz).toHaveBeenCalledTimes(3);
        expect(mockCallDomoticz).toHaveBeenNthCalledWith(3, expect.stringContaining('devices'));
    });

    it('updateDeviceLevel (level > 0) appelle GET_DEVICES immédiatement puis après 1000ms', async () => {
        const device = makeDevice({ idx: 113 });
        const setter = jest.fn();

        updateDeviceLevel(113, device, 50, setter);
        await (mockCallDomoticz.mock.results[0]?.value as Promise<unknown>);
        await Promise.resolve();

        expect(mockCallDomoticz).toHaveBeenCalledTimes(2);
        expect(mockCallDomoticz).toHaveBeenNthCalledWith(2, expect.stringContaining('devices'));

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        expect(mockCallDomoticz).toHaveBeenCalledTimes(3);
        expect(mockCallDomoticz).toHaveBeenNthCalledWith(3, expect.stringContaining('devices'));
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

    it('n\'appelle pas callDomoticz une seconde fois après 1000ms par défaut', () => {
        const setter = jest.fn();

        refreshEquipementState(setter);
        jest.advanceTimersByTime(1000);

        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);
    });

    it('planifie un second refresh seulement si explicitement demandé', () => {
        const setter = jest.fn();

        refreshEquipementState(setter, { scheduleSecondRefresh: true });
        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(1000);
        expect(mockCallDomoticz).toHaveBeenCalledTimes(2);
    });

    it('utilise le délai custom pour le second refresh optionnel', () => {
        const setter = jest.fn();

        refreshEquipementState(setter, { scheduleSecondRefresh: true, secondRefreshDelayMs: 2000 });
        expect(mockCallDomoticz).toHaveBeenNthCalledWith(1, expect.any(String));

        jest.advanceTimersByTime(1999);
        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(1);
        expect(mockCallDomoticz).toHaveBeenNthCalledWith(2, expect.any(String));
    });

    it('déclenche un second refresh après 500ms quand secondRefreshDelayMs=500', () => {
        const setter = jest.fn();

        refreshEquipementState(setter, { scheduleSecondRefresh: true, secondRefreshDelayMs: 500 });
        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(499);
        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(1);
        expect(mockCallDomoticz).toHaveBeenCalledTimes(2);
    });

    it('sans options, conserve un seul appel même après 1000ms (non-régression)', () => {
        const setter = jest.fn();

        refreshEquipementState(setter);
        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(1000);
        expect(mockCallDomoticz).toHaveBeenCalledTimes(1);
    });
});

// ─── getBlindGroupLabel ────────────────────────────────────────────────────────

describe('getBlindGroupLabel — libellé groupe de volets', () => {
    it('retourne "Mixte" quand consistantLevel=false', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, consistantLevel: false, level: 50, status: '40 %' as DomoticzDeviceStatus });
        expect(getBlindGroupLabel(device)).toBe('Mixte');
    });

    it('retourne "Fermés" quand level=0', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, consistantLevel: true, level: 0 });
        expect(getBlindGroupLabel(device)).toBe('Fermés');
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
    it('retourne "Ouverts" pour un groupe de volets avec niveaux incohérents et status=On', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, consistantLevel: false, level: 50, isActive: true });
        expect(getStatusLabel(device, 50, false)).toBe('Ouverts');
    });

    it('retourne "Mixte" pour un groupe de volets avec niveaux incohérents et status non-On', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, consistantLevel: false, level: 50, isActive: true, status: '40 %' as DomoticzDeviceStatus });
        expect(getStatusLabel(device, 50, false)).toBe('Mixte');
    });

    it('retourne "Fermés" pour un groupe de volets fermés (level=0)', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: true, consistantLevel: true, level: 0, isActive: true });
        expect(getStatusLabel(device, 0, false)).toBe('Fermés');
    });

    it('retourne "Fermé" pour un volet individuel status=Off', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: false, status: DomoticzDeviceStatus.OFF, isActive: true });
        expect(getStatusLabel(device, 0, false)).toBe('Fermé');
    });
});

// ─── getBlindLabel ─────────────────────────────────────────────────────────────

describe('getBlindLabel — libellé volet individuel', () => {
    it('retourne "Fermé" quand status=Off', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: false, status: DomoticzDeviceStatus.OFF, level: 0 });
        expect(getBlindLabel(device)).toBe('Fermé');
    });

    it('retourne "Ouvert" quand status=On', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: false, status: DomoticzDeviceStatus.ON, level: 50 });
        expect(getBlindLabel(device)).toBe('Ouvert');
    });

    it('retourne "Ouvert" quand level=99 (seuil plein)', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: false, status: '99' as DomoticzDeviceStatus, level: 99 });
        expect(getBlindLabel(device)).toBe('Ouvert');
        expect(device.unit).toBe('');
    });

    it('retourne "Ouvert" quand level=100', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: false, status: DomoticzDeviceStatus.ON, level: 100 });
        expect(getBlindLabel(device)).toBe('Ouvert');
        expect(device.unit).toBe('');
    });

    it('ne retourne pas "Ouvert" pour un niveau intermédiaire non-Off', () => {
        const device = makeDevice({ type: DomoticzDeviceType.VOLET, isGroup: false, status: '50' as DomoticzDeviceStatus, level: 50 });
        expect(getBlindLabel(device)).toBe('50');
    });
});

// ─── getSingleLightLabel ───────────────────────────────────────────────────────

describe('getSingleLightLabel — libellé lumière individuelle', () => {
    it('retourne "Éteinte" pour un switch Off', () => {
        const device = makeDevice({ type: DomoticzDeviceType.LUMIERE, switchType: DomoticzSwitchType.ONOFF, status: DomoticzDeviceStatus.OFF, level: 0 });
        expect(getSingleLightLabel(device)).toBe('Éteinte');
    });

    it('retourne "Allumée" pour un switch On', () => {
        const device = makeDevice({ type: DomoticzDeviceType.LUMIERE, switchType: DomoticzSwitchType.ONOFF, status: DomoticzDeviceStatus.ON, level: 100 });
        expect(getSingleLightLabel(device)).toBe('Allumée');
    });

    it('retourne "Éteinte" pour un variateur Off', () => {
        const device = makeDevice({ type: DomoticzDeviceType.LUMIERE, switchType: DomoticzSwitchType.SLIDER as any, status: DomoticzDeviceStatus.OFF, level: 0 });
        expect(getSingleLightLabel(device)).toBe('Éteinte');
    });

    it('retourne le niveau en % pour un variateur intermédiaire', () => {
        const device = makeDevice({ type: DomoticzDeviceType.LUMIERE, switchType: DomoticzSwitchType.SLIDER as any, status: DomoticzDeviceStatus.ON, level: 50 });
        expect(getSingleLightLabel(device)).toBe('50');
        expect(device.unit).toBe('%');
    });

    it('retourne "Allumée" pour un variateur à level=99 (seuil plein)', () => {
        const device = makeDevice({ type: DomoticzDeviceType.LUMIERE, switchType: DomoticzSwitchType.SLIDER as any, status: DomoticzDeviceStatus.ON, level: 99 });
        expect(getSingleLightLabel(device)).toBe('Allumée');
        expect(device.unit).toBe('');
    });

    it('retourne "Allumée" pour un variateur à level=100', () => {
        const device = makeDevice({ type: DomoticzDeviceType.LUMIERE, switchType: DomoticzSwitchType.SLIDER as any, status: DomoticzDeviceStatus.ON, level: 100 });
        expect(getSingleLightLabel(device)).toBe('Allumée');
        expect(device.unit).toBe('');
    });

    it('retourne "Mixte" pour un variateur On avec niveau incohérent', () => {
        const device = makeDevice({ type: DomoticzDeviceType.LUMIERE, switchType: DomoticzSwitchType.SLIDER as any, status: DomoticzDeviceStatus.ON, level: 50, consistantLevel: false });
        expect(getSingleLightLabel(device)).toBe('Mixte');
    });
});

// ─── isDeviceOn ────────────────────────────────────────────────────────────────

describe('isDeviceOn — détection état actif', () => {
    it('retourne true pour un switch ONOFF avec status=On (level=0)', () => {
        const device = makeDevice({ switchType: DomoticzSwitchType.ONOFF, status: DomoticzDeviceStatus.ON, level: 0 });
        expect(isDeviceOn(device)).toBe(true);
    });

    it('retourne false pour un switch ONOFF avec status=Off (level=0)', () => {
        const device = makeDevice({ switchType: DomoticzSwitchType.ONOFF, status: DomoticzDeviceStatus.OFF, level: 0 });
        expect(isDeviceOn(device)).toBe(false);
    });

    it('retourne true pour un variateur avec status=On et level=50', () => {
        const device = makeDevice({ switchType: DomoticzSwitchType.SLIDER as any, status: DomoticzDeviceStatus.ON, level: 50 });
        expect(isDeviceOn(device)).toBe(true);
    });

    it('retourne false pour un variateur avec status=Off et level=0', () => {
        const device = makeDevice({ switchType: DomoticzSwitchType.SLIDER as any, status: DomoticzDeviceStatus.OFF, level: 0 });
        expect(isDeviceOn(device)).toBe(false);
    });

    it('retourne false pour un variateur avec status=On mais level=0 (éteint via slider)', () => {
        const device = makeDevice({ switchType: DomoticzSwitchType.SLIDER as any, status: DomoticzDeviceStatus.ON, level: 0 });
        expect(isDeviceOn(device)).toBe(false);
    });
});
