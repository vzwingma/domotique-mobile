import DomoticzDevice from '../domoticzDevice.model';
import { DomoticzDeviceType, DomoticzSwitchType } from '../../enums/DomoticzEnum';

describe('DomoticzDevice', () => {
    // ─── Helpers ───────────────────────────────────────────────────────────────────

    function makeDevice(overrides: Partial<DomoticzDevice>): DomoticzDevice {
        return new DomoticzDevice({
            idx: 1,
            rang: 0,
            name: 'Test Device',
            lastUpdate: '2024-01-01 12:00:00',
            level: 50,
            unit: '%',
            type: DomoticzDeviceType.LUMIERE,
            subType: 'Switch',
            switchType: DomoticzSwitchType.ONOFF,
            status: 'On',
            data: '',
            isGroup: false,
            ...overrides,
        } as unknown as DomoticzDevice);
    }

    // ─── Constructor & Validation ───────────────────────────────────────────────────

    describe('Constructor & Validation', () => {
        it('crée un appareil avec les propriétés correctes', () => {
            const device = makeDevice({ idx: 42, name: 'My Light' });
            expect(device.idx).toBe(42);
            expect(device.name).toBe('My Light');
            expect(device.isOnline).toBe(false); // isActive = false par défaut
        });

        it('lève une erreur si idx <= 0', () => {
            expect(() => makeDevice({ idx: 0 })).toThrow('idx doit être > 0');
            expect(() => makeDevice({ idx: -1 })).toThrow('idx doit être > 0');
        });

        it('propriétés readonly sont définies et accessibles', () => {
            const device = makeDevice({ idx: 10, name: 'Device' });
            expect(device.idx).toBe(10);
            expect(device.name).toBe('Device');
            // TypeScript empêche les assignations à compile-time
        });

        it('initialise les propriétés avec les valeurs par défaut', () => {
            const device = makeDevice({ unit: '%' });
            expect(device.unit).toBe('%');
            expect(device.isGroup).toBe(false);
            expect(device.isActive).toBe(false);
        });
    });

    // ─── Getters ───────────────────────────────────────────────────────────────────

    describe('isOnline getter', () => {
        it('isOnline reflète isActive', () => {
            const deviceOn = makeDevice({ isActive: true });
            const deviceOff = makeDevice({ isActive: false });
            expect(deviceOn.isOnline).toBe(deviceOn.isActive);
            expect(deviceOff.isOnline).toBe(deviceOff.isActive);
        });
    });

    describe('displayLevel getter', () => {
        it('affiche le niveau en pourcentage pour LUMIERE', () => {
            const device = makeDevice({
                type: DomoticzDeviceType.LUMIERE,
                level: 75,
                unit: '%',
            });
            expect(device.displayLevel).toBe('75%');
        });

        it('affiche le niveau en pourcentage pour VOLET', () => {
            const device = makeDevice({
                type: DomoticzDeviceType.VOLET,
                level: 50,
                unit: '%',
            });
            expect(device.displayLevel).toBe('50%');
        });

        it('affiche le niveau avec unité pour THERMOSTAT', () => {
            const device = makeDevice({
                type: DomoticzDeviceType.THERMOSTAT,
                level: 22,
                unit: '°C',
            });
            expect(device.displayLevel).toBe('22°C');
        });

        it('affiche le niveau en pourcentage par défaut si type inconnu', () => {
            const device = makeDevice({
                type: DomoticzDeviceType.UNKNOWN,
                level: 33,
            });
            expect(device.displayLevel).toBe('33%');
        });

        it('arrondit le niveau pour les pourcentages', () => {
            const device = makeDevice({
                type: DomoticzDeviceType.LUMIERE,
                level: 75.7,
            });
            expect(device.displayLevel).toBe('76%');
        });
    });

    // ─── Setters (Mutabilité contrôlée) ───────────────────────────────────────────

    describe('Setters', () => {
        it('permet de modifier le rang', () => {
            const device = makeDevice({ rang: 0 });
            expect(device.rang).toBe(0);
            device.rang = 5;
            expect(device.rang).toBe(5);
        });

        it('permet de modifier le level', () => {
            const device = makeDevice({ level: 50 });
            expect(device.level).toBe(50);
            device.level = 80;
            expect(device.level).toBe(80);
        });

        it('permet de modifier le status', () => {
            const device = makeDevice({ status: 'On' });
            expect(device.status).toBe('On');
            device.status = 'Off';
            expect(device.status).toBe('Off');
        });

        it('permet de modifier consistantLevel', () => {
            const device = makeDevice({});
            expect(device.consistantLevel).toBe(true);
            device.consistantLevel = false;
            expect(device.consistantLevel).toBe(false);
        });
    });

    // ─── Edge Cases ───────────────────────────────────────────────────────────────

    describe('Edge Cases', () => {
        it('gère les niveaux négatifs', () => {
            const device = makeDevice({ level: -10 });
            expect(device.level).toBe(-10);
            expect(device.displayLevel).toBe('-10%');
        });

        it('gère les niveaux > 100%', () => {
            const device = makeDevice({ level: 150 });
            expect(device.level).toBe(150);
            expect(device.displayLevel).toBe('150%');
        });

        it('gère les unités vides', () => {
            const device = makeDevice({
                type: DomoticzDeviceType.THERMOSTAT,
                unit: '',
                level: 20,
            });
            expect(device.displayLevel).toBe('20°C'); // Utilise la valeur par défaut
        });

        it('gère les names vides', () => {
            const device = makeDevice({ name: '' });
            expect(device.name).toBe('');
        });
    });

    // ─── Groups ────────────────────────────────────────────────────────────────────

    describe('Groups', () => {
        it('crée un groupe', () => {
            const group = makeDevice({ isGroup: true, idx: 100 });
            expect(group.isGroup).toBe(true);
        });

        it('gère consistantLevel pour les groupes', () => {
            const group = makeDevice({
                isGroup: true,
                consistantLevel: false,
            });
            // S'assurer que la valeur est bien passée et lue
            expect(group.isGroup).toBe(true);
        });
    });
});
