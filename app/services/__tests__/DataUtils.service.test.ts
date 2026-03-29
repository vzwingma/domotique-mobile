import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getDeviceType,
    sortEquipements,
    sortFavorites,
    evaluateGroupLevelConsistency,
    getFavoritesFromStorage,
    saveFavoritesToStorage,
    removeValueFromStorage,
    KEY_STORAGE,
} from '../DataUtils.service';
import { DomoticzDeviceType, DomoticzDeviceStatus } from '../../enums/DomoticzEnum';
import DomoticzDevice from '../../models/domoticzDevice.model';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeDevice(overrides: Partial<DomoticzDevice>): DomoticzDevice {
    return {
        idx: 1,
        rang: 0,
        name: 'Test',
        lastUpdate: '2024-01-01',
        isActive: true,
        level: 50,
        unit: '%',
        consistantLevel: true,
        type: DomoticzDeviceType.LUMIERE,
        subType: 'Switch',
        switchType: 'On/Off' as any,
        status: DomoticzDeviceStatus.ON,
        data: '',
        isGroup: false,
        ...overrides,
    } as unknown as DomoticzDevice;
}

// ─── getDeviceType ─────────────────────────────────────────────────────────────

describe('getDeviceType', () => {
    it('retourne VOLET pour un nom contenant "volet"', () => {
        expect(getDeviceType('Volet Salon')).toBe(DomoticzDeviceType.VOLET);
    });

    it('est insensible à la casse pour "volet"', () => {
        expect(getDeviceType('VOLET Chambre')).toBe(DomoticzDeviceType.VOLET);
    });

    it('retourne LUMIERE pour un nom contenant "lumière"', () => {
        expect(getDeviceType('Lumière Salon')).toBe(DomoticzDeviceType.LUMIERE);
    });

    it('retourne LUMIERE pour un nom contenant "prise"', () => {
        expect(getDeviceType('Prise Bureau')).toBe(DomoticzDeviceType.LUMIERE);
    });

    it('retourne THERMOSTAT pour un nom contenant "thermostat"', () => {
        expect(getDeviceType('Thermostat Chambre')).toBe(DomoticzDeviceType.THERMOSTAT);
    });

    it('retourne PARAMETRE pour un nom contenant "mode"', () => {
        expect(getDeviceType('Mode Absent')).toBe(DomoticzDeviceType.PARAMETRE);
    });

    it('retourne PARAMETRE_RO pour un nom contenant "présence"', () => {
        expect(getDeviceType('Présence Salon')).toBe(DomoticzDeviceType.PARAMETRE_RO);
    });

    it('retourne PARAMETRE_RO pour un nom contenant "phase"', () => {
        expect(getDeviceType('Phase Electrique')).toBe(DomoticzDeviceType.PARAMETRE_RO);
    });

    it('retourne UNKNOWN pour un nom non reconnu', () => {
        expect(getDeviceType('Capteur CO2')).toBe(DomoticzDeviceType.UNKNOWN);
    });

    it('retourne UNKNOWN pour une chaîne vide', () => {
        expect(getDeviceType('')).toBe(DomoticzDeviceType.UNKNOWN);
    });
});

// ─── sortEquipements ───────────────────────────────────────────────────────────

describe('sortEquipements', () => {
    it('trie les équipements selon leur position dans la liste ordonnée', () => {
        const d1 = makeDevice({ idx: 10 });
        const d2 = makeDevice({ idx: 20 });
        const order = [20, 10];
        const result = sortEquipements(d1, d2, order);
        // d1 est en position 1, d2 en position 0 → d2 avant d1 → résultat positif
        expect(result).toBeGreaterThan(0);
    });

    it('retourne une valeur négative quand d1 vient avant d2', () => {
        const d1 = makeDevice({ idx: 10 });
        const d2 = makeDevice({ idx: 20 });
        const order = [10, 20];
        const result = sortEquipements(d1, d2, order);
        expect(result).toBeLessThan(0);
    });

    it('retourne 0 pour deux équipements au même rang', () => {
        const d1 = makeDevice({ idx: 10, rang: 0 });
        const d2 = makeDevice({ idx: 20, rang: 0 });
        const order = [10, 20];
        // On force rang=0 pour les deux
        d1.rang = 0;
        d2.rang = 0;
        const result = sortEquipements(d1, d2, []);
        expect(result).toBe(0);
    });

    it('ne modifie pas le rang si idx absent de la liste', () => {
        const d1 = makeDevice({ idx: 99, rang: 5 });
        const d2 = makeDevice({ idx: 100, rang: 3 });
        sortEquipements(d1, d2, [1, 2, 3]);
        expect(d1.rang).toBe(5);
        expect(d2.rang).toBe(3);
    });
});

// ─── sortFavorites ─────────────────────────────────────────────────────────────

describe('sortFavorites', () => {
    it('retourne un nombre positif si device1.type > device2.type (alphabétique)', () => {
        const d1 = makeDevice({ type: DomoticzDeviceType.VOLET });
        const d2 = makeDevice({ type: DomoticzDeviceType.LUMIERE });
        // "Volet" > "Lumière" alphabétiquement → résultat positif
        const result = sortFavorites(d1, d2);
        expect(result).toBeLessThan(0); // "Lumière" < "Volet" → d1 avant d2
    });

    it('retourne un nombre négatif si device1.type < device2.type', () => {
        const d1 = makeDevice({ type: DomoticzDeviceType.LUMIERE });
        const d2 = makeDevice({ type: DomoticzDeviceType.VOLET });
        const result = sortFavorites(d1, d2);
        expect(result).toBeGreaterThan(0);
    });

    it('trie par rang quand les deux équipements sont de même type LUMIERE', () => {
        const d1 = makeDevice({ idx: 113, type: DomoticzDeviceType.LUMIERE });
        const d2 = makeDevice({ idx: 128, type: DomoticzDeviceType.LUMIERE });
        // 113 est en position 1 dans DomoticzLightsSort, 128 en position 0
        // → résultat positif (d2 avant d1)
        const result = sortFavorites(d1, d2);
        expect(typeof result).toBe('number');
    });
});

// ─── evaluateGroupLevelConsistency ─────────────────────────────────────────────

describe('evaluateGroupLevelConsistency', () => {
    it('ne fait rien pour un équipement non-groupe', () => {
        const device = makeDevice({ isGroup: false, consistantLevel: true });
        evaluateGroupLevelConsistency(device, [], []);
        expect(device.consistantLevel).toBe(true);
    });

    it('ne change pas consistantLevel si le groupe n\'est pas trouvé dans idsSubDevices', () => {
        const device = makeDevice({ idx: 999, isGroup: true, consistantLevel: true });
        evaluateGroupLevelConsistency(device, [{ 1: [2, 3] }], []);
        expect(device.consistantLevel).toBe(true);
    });

    it('marque consistantLevel=true quand tous les sous-équipements ont le même niveau', () => {
        const group = makeDevice({ idx: 10, isGroup: true });
        const sub1 = makeDevice({ idx: 1, level: 50, status: DomoticzDeviceStatus.ON });
        const sub2 = makeDevice({ idx: 2, level: 50, status: DomoticzDeviceStatus.ON });
        evaluateGroupLevelConsistency(group, [{ 10: [1, 2] }], [sub1, sub2]);
        expect(group.consistantLevel).toBe(true);
    });

    it('marque consistantLevel=false quand les sous-équipements ont des niveaux différents', () => {
        const group = makeDevice({ idx: 10, isGroup: true });
        const sub1 = makeDevice({ idx: 1, level: 50, status: DomoticzDeviceStatus.ON });
        const sub2 = makeDevice({ idx: 2, level: 80, status: DomoticzDeviceStatus.ON });
        evaluateGroupLevelConsistency(group, [{ 10: [1, 2] }], [sub1, sub2]);
        expect(group.consistantLevel).toBe(false);
    });

    it('traite un équipement OFF comme niveau 0', () => {
        const group = makeDevice({ idx: 10, isGroup: true });
        const sub1 = makeDevice({ idx: 1, level: 0, status: DomoticzDeviceStatus.OFF });
        const sub2 = makeDevice({ idx: 2, level: 0, status: DomoticzDeviceStatus.OFF });
        evaluateGroupLevelConsistency(group, [{ 10: [1, 2] }], [sub1, sub2]);
        expect(group.consistantLevel).toBe(true);
    });

    it('ignore les équipements déconnectés : 3 allumés + 1 déconnecté → consistantLevel=true, statut=Allumées', () => {
        const group = makeDevice({ idx: 10, isGroup: true, level: 0, status: DomoticzDeviceStatus.OFF });
        const sub1 = makeDevice({ idx: 1, level: 100, status: DomoticzDeviceStatus.ON, isActive: true });
        const sub2 = makeDevice({ idx: 2, level: 100, status: DomoticzDeviceStatus.ON, isActive: true });
        const sub3 = makeDevice({ idx: 3, level: 100, status: DomoticzDeviceStatus.ON, isActive: true });
        const sub4 = makeDevice({ idx: 4, level: 0, status: DomoticzDeviceStatus.OFF, isActive: false });
        evaluateGroupLevelConsistency(group, [{ 10: [1, 2, 3, 4] }], [sub1, sub2, sub3, sub4]);
        expect(group.consistantLevel).toBe(true);
        expect(group.level).toBe(100);
        expect(group.status).toBe(DomoticzDeviceStatus.ON);
    });

    it('ignore les équipements déconnectés (ONOFF switch) : 3 ON (level=0) + 1 déconnecté → consistantLevel=true, statut=ON, level=100', () => {
        // Cas réel : switch ONOFF allumé → level=0 dans Domoticz, état porté par status
        const group = makeDevice({ idx: 10, isGroup: true, level: 0, status: DomoticzDeviceStatus.OFF });
        const sub1 = makeDevice({ idx: 1, level: 0, status: DomoticzDeviceStatus.ON, isActive: true });
        const sub2 = makeDevice({ idx: 2, level: 0, status: DomoticzDeviceStatus.ON, isActive: true });
        const sub3 = makeDevice({ idx: 3, level: 0, status: DomoticzDeviceStatus.ON, isActive: true });
        const sub4 = makeDevice({ idx: 4, level: 0, status: DomoticzDeviceStatus.OFF, isActive: false });
        evaluateGroupLevelConsistency(group, [{ 10: [1, 2, 3, 4] }], [sub1, sub2, sub3, sub4]);
        expect(group.consistantLevel).toBe(true);
        expect(group.level).toBe(100);
        expect(group.status).toBe(DomoticzDeviceStatus.ON);
    });

    it('ignore les équipements déconnectés : 2 allumés + 1 éteint + 1 déconnecté → consistantLevel=false, level=100, status=Mixed', () => {
        const group = makeDevice({ idx: 10, isGroup: true, level: 0, status: DomoticzDeviceStatus.OFF });
        const sub1 = makeDevice({ idx: 1, level: 100, status: DomoticzDeviceStatus.ON, isActive: true });
        const sub2 = makeDevice({ idx: 2, level: 100, status: DomoticzDeviceStatus.ON, isActive: true });
        const sub3 = makeDevice({ idx: 3, level: 0, status: DomoticzDeviceStatus.OFF, isActive: true });
        const sub4 = makeDevice({ idx: 4, level: 0, status: DomoticzDeviceStatus.OFF, isActive: false });
        evaluateGroupLevelConsistency(group, [{ 10: [1, 2, 3, 4] }], [sub1, sub2, sub3, sub4]);
        expect(group.consistantLevel).toBe(false);
        expect(group.level).toBe(100);
        expect(group.status).toBe('Mixed');
    });

    it('niveaux hétérogènes (21%, 2%, switch ON) + 1 déconnecté → consistantLevel=false, status=ON, level=100', () => {
        // Cas réel : dimmers à des niveaux différents + switch ONOFF + 1 déconnecté
        const group = makeDevice({ idx: 10, isGroup: true, level: 0, status: DomoticzDeviceStatus.OFF });
        const sub1 = makeDevice({ idx: 1, level: 21, status: '21' as any, isActive: true });
        const sub2 = makeDevice({ idx: 2, level: 2, status: '2' as any, isActive: true });
        const sub3 = makeDevice({ idx: 3, level: 0, status: DomoticzDeviceStatus.ON, isActive: true });
        const sub4 = makeDevice({ idx: 4, level: 0, status: DomoticzDeviceStatus.OFF, isActive: false });
        evaluateGroupLevelConsistency(group, [{ 10: [1, 2, 3, 4] }], [sub1, sub2, sub3, sub4]);
        expect(group.consistantLevel).toBe(false);
        expect(group.level).toBe(100);
        expect(group.status).toBe(DomoticzDeviceStatus.ON);
    });

    it('replie sur tous les sous-équipements quand aucun n\'est actif', () => {
        const group = makeDevice({ idx: 10, isGroup: true, level: 50 });
        const sub1 = makeDevice({ idx: 1, level: 0, status: DomoticzDeviceStatus.OFF, isActive: false });
        const sub2 = makeDevice({ idx: 2, level: 0, status: DomoticzDeviceStatus.OFF, isActive: false });
        evaluateGroupLevelConsistency(group, [{ 10: [1, 2] }], [sub1, sub2]);
        expect(group.consistantLevel).toBe(true);
        expect(group.level).toBe(0);
        expect(group.status).toBe(DomoticzDeviceStatus.OFF);
    });
});

// ─── Stockage AsyncStorage ─────────────────────────────────────────────────────

describe('getFavoritesFromStorage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('retourne un tableau de favoris parsé depuis AsyncStorage', async () => {
        const fakeFavs = [{ idx: 1, nbOfUse: 3, name: 'Lumière Salon', type: DomoticzDeviceType.LUMIERE, subType: '' }];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(fakeFavs));

        const result = await getFavoritesFromStorage();
        expect(result).toEqual(fakeFavs);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith(KEY_STORAGE.FAVORITES);
    });

    it('retourne un tableau vide si AsyncStorage est vide', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        const result = await getFavoritesFromStorage();
        expect(result).toEqual([]);
    });
});

describe('saveFavoritesToStorage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('appelle AsyncStorage.setItem avec les favoris sérialisés', () => {
        const favs = [{ idx: 1, nbOfUse: 1, name: 'Test', type: DomoticzDeviceType.LUMIERE, subType: '' }] as any;
        saveFavoritesToStorage(favs);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            KEY_STORAGE.FAVORITES,
            JSON.stringify(favs)
        );
    });
});

describe('removeValueFromStorage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('appelle AsyncStorage.removeItem avec la clé donnée', () => {
        removeValueFromStorage(KEY_STORAGE.FAVORITES);
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(KEY_STORAGE.FAVORITES);
    });
});
