import DomoticzThermostat from '../domoticzThermostat.model';
import { DomoticzDeviceType } from '../../enums/DomoticzEnum';

describe('DomoticzThermostat', () => {
    // ─── Helpers ───────────────────────────────────────────────────────────────────

    function makeThermostat(overrides: Partial<DomoticzThermostat> = {}): DomoticzThermostat {
        const {
            idx = 1,
            name = 'Chambre',
            lastUpdate = '2024-01-01 12:00:00',
            isActive = true,
            temp = 22,
            type = DomoticzDeviceType.THERMOSTAT,
            status = 'OK',
            data = '21.5',
            unit = '°C',
            rang = 0,
        } = overrides;

        return new DomoticzThermostat(
            idx as number,
            name as string,
            lastUpdate as string,
            isActive as boolean,
            temp as number,
            type as DomoticzDeviceType,
            status as string,
            data as string,
            unit as string
        );
    }

    // ─── Constructor & Validation ───────────────────────────────────────────────────

    describe('Constructor & Validation', () => {
        it('crée un thermostat avec les propriétés correctes', () => {
            const tstat = makeThermostat({ idx: 42, name: 'Salon' });
            expect(tstat.idx).toBe(42);
            expect(tstat.name).toBe('Salon');
            expect(tstat.temp).toBe(22);
            expect(tstat.type).toBe(DomoticzDeviceType.THERMOSTAT);
        });

        it('lève une erreur si idx <= 0', () => {
            expect(() => makeThermostat({ idx: 0 })).toThrow('idx doit être > 0');
            expect(() => makeThermostat({ idx: -1 })).toThrow('idx doit être > 0');
        });

        it('propriétés readonly sont définies et accessibles', () => {
            const tstat = makeThermostat({ idx: 42, name: 'Salon' });
            expect(tstat.idx).toBe(42);
            expect(tstat.name).toBe('Salon');
            // TypeScript empêche les assignations à compile-time
        });

        it('initialise les propriétés par défaut', () => {
            const tstat = makeThermostat({});
            expect(tstat.unit).toBe('°C');
            expect(tstat.isActive).toBe(true);
        });
    });

    // ─── needsAdjustment Getter ────────────────────────────────────────────────────

    describe('needsAdjustment getter', () => {
        it('retourne true si différence > 2°C (consigne > mesure)', () => {
            const tstat = makeThermostat({
                temp: 25, // consigne
                data: '22', // mesure
            });
            // |25 - 22| = 3°C > 2°C
            expect(tstat.needsAdjustment).toBe(true);
        });

        it('retourne true si différence > 2°C (consigne < mesure)', () => {
            const tstat = makeThermostat({
                temp: 20, // consigne
                data: '23.5', // mesure
            });
            // |20 - 23.5| = 3.5°C > 2°C
            expect(tstat.needsAdjustment).toBe(true);
        });

        it('retourne false si différence <= 2°C', () => {
            const tstat = makeThermostat({
                temp: 22, // consigne
                data: '21', // mesure
            });
            // |22 - 21| = 1°C <= 2°C
            expect(tstat.needsAdjustment).toBe(false);
        });

        it('retourne false si consigne = mesure', () => {
            const tstat = makeThermostat({
                temp: 22,
                data: '22',
            });
            // |22 - 22| = 0°C
            expect(tstat.needsAdjustment).toBe(false);
        });

        it('retourne false si mesure non trouvée dans data', () => {
            const tstat = makeThermostat({
                temp: 25,
                data: 'NO_DATA',
            });
            expect(tstat.needsAdjustment).toBe(false);
        });

        it('gère les données vides', () => {
            const tstat = makeThermostat({
                temp: 25,
                data: '',
            });
            expect(tstat.needsAdjustment).toBe(false);
        });

        it('gère les données avec format "20.5 °C"', () => {
            const tstat = makeThermostat({
                temp: 22,
                data: '20.5 °C',
            });
            // |22 - 20.5| = 1.5°C <= 2°C
            expect(tstat.needsAdjustment).toBe(false);
        });
    });

    // ─── displaySetpoint Getter ────────────────────────────────────────────────────

    describe('displaySetpoint getter', () => {
        it('affiche la consigne avec unité °C', () => {
            const tstat = makeThermostat({ temp: 22, unit: '°C' });
            expect(tstat.displaySetpoint).toBe('22°C');
        });

        it('affiche la consigne avec unité °F', () => {
            const tstat = makeThermostat({ temp: 72, unit: '°F' });
            expect(tstat.displaySetpoint).toBe('72°F');
        });

        it('affiche la consigne avec unité personnalisée', () => {
            const tstat = makeThermostat({ temp: 20, unit: 'K' });
            expect(tstat.displaySetpoint).toBe('20K');
        });

        it('utilise °C par défaut si unité vide', () => {
            const tstat = makeThermostat({ temp: 20, unit: '' });
            expect(tstat.displaySetpoint).toBe('20°C');
        });

        it('affiche les décimales', () => {
            const tstat = makeThermostat({ temp: 22.5, unit: '°C' });
            expect(tstat.displaySetpoint).toBe('22.5°C');
        });
    });

    // ─── displayMeasure Getter ────────────────────────────────────────────────────

    describe('displayMeasure getter', () => {
        it('affiche la mesure extraite de data', () => {
            const tstat = makeThermostat({ data: '21.5', unit: '°C' });
            expect(tstat.displayMeasure).toBe('21.5°C');
        });

        it('affiche la mesure au format "X.X °C"', () => {
            const tstat = makeThermostat({ data: '20.3 °C', unit: '°C' });
            expect(tstat.displayMeasure).toBe('20.3°C');
        });

        it('retourne "N/A" si data vide', () => {
            const tstat = makeThermostat({ data: '', unit: '°C' });
            expect(tstat.displayMeasure).toBe('N/A');
        });

        it('retourne "N/A" si mesure non trouvée', () => {
            const tstat = makeThermostat({ data: 'NO_DATA', unit: '°C' });
            expect(tstat.displayMeasure).toBe('N/A');
        });

        it('utilise °C par défaut si unité vide', () => {
            const tstat = makeThermostat({ data: '21', unit: '' });
            expect(tstat.displayMeasure).toBe('21°C');
        });

        it('extrait le premier nombre de data', () => {
            const tstat = makeThermostat({ data: '19.8 current, 22 target', unit: '°C' });
            expect(tstat.displayMeasure).toBe('19.8°C');
        });
    });

    // ─── Setters (Mutabilité contrôlée) ───────────────────────────────────────────

    describe('Setters', () => {
        it('permet de modifier la consigne (temp)', () => {
            const tstat = makeThermostat({ temp: 20 });
            expect(tstat.temp).toBe(20);
            tstat.temp = 23;
            expect(tstat.temp).toBe(23);
            expect(tstat.displaySetpoint).toBe('23°C');
        });

        it('permet de modifier le rang', () => {
            const tstat = makeThermostat({ rang: 0 });
            expect(tstat.rang).toBe(0);
            tstat.rang = 5;
            expect(tstat.rang).toBe(5);
        });

        it('permet de modifier le statut', () => {
            const tstat = makeThermostat({ status: 'OK' });
            expect(tstat.status).toBe('OK');
            tstat.status = 'ERROR';
            expect(tstat.status).toBe('ERROR');
        });
    });

    // ─── Edge Cases ─────────────────────────────────────────────────────────────────

    describe('Edge Cases', () => {
        it('gère les consignes très basses', () => {
            const tstat = makeThermostat({ temp: 5 });
            expect(tstat.displaySetpoint).toBe('5°C');
        });

        it('gère les consignes très hautes', () => {
            const tstat = makeThermostat({ temp: 30 });
            expect(tstat.displaySetpoint).toBe('30°C');
        });

        it('gère les mesures décimales complexes', () => {
            const tstat = makeThermostat({ data: '19.876543' });
            expect(tstat.displayMeasure).toBe('19.876543°C');
        });

        it('gère les données avec unité intégrée', () => {
            const tstat = makeThermostat({
                data: '21.5°C',
                unit: '°C',
            });
            expect(tstat.displayMeasure).toBe('21.5°C');
        });

        it('gère les données null', () => {
            const tstat = makeThermostat({ data: '' });
            expect(tstat.displayMeasure).toBe('N/A');
        });

        it('gère les données avec espaces', () => {
            const tstat = makeThermostat({ data: '   21.5   ' });
            expect(tstat.displayMeasure).toBe('21.5°C');
        });
    });

    // ─── Data Consistency ──────────────────────────────────────────────────────────

    describe('Data Consistency', () => {
        it('propriétés readonly sont définies et inaccessibles en écriture au compile-time', () => {
            const tstat = makeThermostat();
            expect(tstat.data).toBe('21.5');
            expect(tstat.lastUpdate).toBe('2024-01-01 12:00:00');
            expect(tstat.unit).toBe('°C');
            // TypeScript empêche les assignations à compile-time
        });
    });
});
