import DomoticzParameter from '../domoticzParameter.model';
import { DomoticzDeviceType, DomoticzSwitchType } from '../../enums/DomoticzEnum';

describe('DomoticzParameter', () => {
    // ─── Helpers ───────────────────────────────────────────────────────────────────

    function makeParameter(overrides: Partial<DomoticzParameter> = {}): DomoticzParameter {
        const {
            idx = 1,
            name = 'Mode',
            lastUpdate = '2024-01-01 12:00:00',
            level = 0,
            type = DomoticzDeviceType.PARAMETRE,
            switchType = DomoticzSwitchType.ONOFF,
            status = 'OK',
            data = '',
        } = overrides;

        return new DomoticzParameter({
            idx: idx as number,
            name: name as string,
            lastUpdate: lastUpdate as string,
            level: level as number,
            type: type as DomoticzDeviceType,
            switchType: switchType as DomoticzSwitchType,
            status: status as string,
            data: data as string,
        } as unknown as DomoticzParameter);
    }

    // ─── Constructor & Validation ───────────────────────────────────────────────────

    describe('Constructor & Validation', () => {
        it('crée un paramètre avec les propriétés correctes', () => {
            const param = makeParameter({ idx: 42, name: 'Mode Absent' });
            expect(param.idx).toBe(42);
            expect(param.name).toBe('Mode Absent');
            expect(param.level).toBe(0);
        });

        it('lève une erreur si idx <= 0', () => {
            expect(() => makeParameter({ idx: 0 })).toThrow('idx doit être > 0');
            expect(() => makeParameter({ idx: -1 })).toThrow('idx doit être > 0');
        });

        it('propriétés readonly sont définies et accessibles', () => {
            const param = makeParameter();
            expect(param.idx).toBe(1);
            expect(param.name).toBe('Mode');
            // TypeScript empêche les assignations à compile-time
        });

        it('initialise levelNames comme tableau vide par défaut', () => {
            const param = makeParameter({});
            expect(Array.isArray(param.levelNames)).toBe(true);
            expect(param.levelNames.length).toBe(0);
        });
    });

    // ─── currentLevelName Getter ────────────────────────────────────────────────────

    describe('currentLevelName getter', () => {
        it('retourne le label si disponible dans levelNames', () => {
            const param = makeParameter({ level: 1 });
            (param as any).levelNames = ['Absent', 'Présent', 'Absence'];
            expect(param.currentLevelName).toBe('Présent');
        });

        it('retourne le niveau en string si pas de levelNames', () => {
            const param = makeParameter({ level: 2 });
            expect(param.currentLevelName).toBe('2');
        });

        it('retourne le niveau en string si levelNames vide', () => {
            const param = makeParameter({ level: 3 });
            param.levelNames = [];
            expect(param.currentLevelName).toBe('3');
        });

        it('retourne le niveau en string si index > levelNames.length', () => {
            const param = makeParameter({ level: 5 });
            param.levelNames = ['A', 'B', 'C'];
            expect(param.currentLevelName).toBe('5');
        });

        it('gère le niveau 0', () => {
            const param = makeParameter({ level: 0 });
            param.levelNames = ['Arrêt', 'Marche'];
            expect(param.currentLevelName).toBe('Arrêt');
        });
    });

    // ─── Setters (Mutabilité contrôlée) ───────────────────────────────────────────

    describe('Setters', () => {
        it('permet de modifier le level', () => {
            const param = makeParameter({ level: 0 });
            expect(param.level).toBe(0);
            param.level = 1;
            expect(param.level).toBe(1);
        });

        it('permet de modifier le status', () => {
            const param = makeParameter({ status: 'OK' });
            expect(param.status).toBe('OK');
            param.status = 'ERROR';
            expect(param.status).toBe('ERROR');
        });

        it('modification du level affecte currentLevelName', () => {
            const param = makeParameter({ level: 0 });
            param.levelNames = ['Off', 'On'];
            expect(param.currentLevelName).toBe('Off');
            param.level = 1;
            expect(param.currentLevelName).toBe('On');
        });
    });

    // ─── Device Types ──────────────────────────────────────────────────────────────

    describe('Device Types', () => {
        it('accepte PARAMETRE', () => {
            const param = makeParameter({ type: DomoticzDeviceType.PARAMETRE });
            expect(param.type).toBe(DomoticzDeviceType.PARAMETRE);
        });

        it('accepte PARAMETRE_RO', () => {
            const param = makeParameter({ type: DomoticzDeviceType.PARAMETRE_RO });
            expect(param.type).toBe(DomoticzDeviceType.PARAMETRE_RO);
        });
    });

    // ─── Switch Types ──────────────────────────────────────────────────────────────

    describe('Switch Types', () => {
        it('accepte ONOFF', () => {
            const param = makeParameter({ switchType: DomoticzSwitchType.ONOFF });
            expect(param.switchType).toBe(DomoticzSwitchType.ONOFF);
        });

        it('accepte SLIDER', () => {
            const param = makeParameter({ switchType: DomoticzSwitchType.SLIDER });
            expect(param.switchType).toBe(DomoticzSwitchType.SLIDER);
        });
    });

    // ─── Edge Cases ────────────────────────────────────────────────────────────────

    describe('Edge Cases', () => {
        it('gère les niveaux négatifs', () => {
            const param = makeParameter({ level: -1 });
            expect(param.level).toBe(-1);
            expect(param.currentLevelName).toBe('-1');
        });

        it('gère les niveaux très grands', () => {
            const param = makeParameter({ level: 1000 });
            expect(param.level).toBe(1000);
            expect(param.currentLevelName).toBe('1000');
        });

        it('gère les levelNames null/undefined', () => {
            const param = makeParameter({ level: 0 });
            expect(param.currentLevelName).toBe('0');
        });

        it('gère les levelNames avec des espaces', () => {
            const param = makeParameter({ level: 0 });
            param.levelNames = ['  Off  ', '  On  '];
            expect(param.currentLevelName).toBe('  Off  ');
        });

        it('gère les noms vides', () => {
            const param = makeParameter({ name: '' });
            expect(param.name).toBe('');
        });

        it('gère les statuts vides', () => {
            const param = makeParameter({ status: '' });
            expect(param.status).toBe('');
        });
    });

    // ─── Data Consistency ──────────────────────────────────────────────────────────

    describe('Data Consistency', () => {
        it('propriétés readonly sont définies et inaccessibles en écriture au compile-time', () => {
            const param = makeParameter();
            expect(param.type).toBe(DomoticzDeviceType.PARAMETRE);
            expect(param.lastUpdate).toBe('2024-01-01 12:00:00');
            // TypeScript empêche les assignations à compile-time
        });

        it('levelNames est mutable mais reste une array', () => {
            const param = makeParameter({});
            param.levelNames.push('Test');
            expect(param.levelNames[0]).toBe('Test');
        });
    });
});
