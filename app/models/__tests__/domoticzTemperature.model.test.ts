import DomoticzTemperature from '../domoticzTemperature.model';

describe('DomoticzTemperature', () => {
    // ─── Helpers ───────────────────────────────────────────────────────────────────

    function makeTemperature(overrides: Partial<DomoticzTemperature>): DomoticzTemperature {
        return new DomoticzTemperature({
            idx: '1',
            rang: 0,
            name: 'Test Sensor',
            lastUpdate: '2024-01-01 12:00:00',
            temp: 22.5,
            humidity: 65,
            humidityStatus: 'Confortable',
            type: 'TempHum',
            subType: 'TH Sensor',
            status: 'OK',
            data: '',
            isActive: false,
            ...overrides,
        } as unknown as DomoticzTemperature);
    }

    // ─── Constructor ────────────────────────────────────────────────────────────────

    describe('Constructor', () => {
        it('crée une sonde de température avec les propriétés correctes', () => {
            const temp = makeTemperature({ idx: '42', name: 'Salon' });
            expect(temp.idx).toBe('42');
            expect(temp.name).toBe('Salon');
            expect(temp.temp).toBe(22.5);
            expect(temp.humidity).toBe(65);
        });

        it('accepte les propriétés readonly', () => {
            const temp = makeTemperature({ idx: '10' });
            expect(() => {
                (temp as any).idx = '20';
            }).toThrow();
            expect(() => {
                (temp as any).name = 'Other';
            }).toThrow();
        });

        it('initialise isActive à false par défaut', () => {
            const temp = makeTemperature({});
            expect(temp.isActive).toBe(false);
        });
    });

    // ─── isOutdoor Getter ───────────────────────────────────────────────────────────

    describe('isOutdoor getter', () => {
        it('détecte "Extérieur"', () => {
            const temp = makeTemperature({ name: 'Extérieur' });
            expect(temp.isOutdoor).toBe(true);
        });

        it('détecte "Exterieur" (sans accent)', () => {
            const temp = makeTemperature({ name: 'Exterieur' });
            expect(temp.isOutdoor).toBe(true);
        });

        it('détecte "Ext"', () => {
            const temp = makeTemperature({ name: 'Capteur Ext' });
            expect(temp.isOutdoor).toBe(true);
        });

        it('détecte "Outside"', () => {
            const temp = makeTemperature({ name: 'Outside Temperature' });
            expect(temp.isOutdoor).toBe(true);
        });

        it('détecte "Outdoor"', () => {
            const temp = makeTemperature({ name: 'Outdoor Sensor' });
            expect(temp.isOutdoor).toBe(true);
        });

        it('détecte "Dehors"', () => {
            const temp = makeTemperature({ name: 'Temps Dehors' });
            expect(temp.isOutdoor).toBe(true);
        });

        it('détecte "Terrasse"', () => {
            const temp = makeTemperature({ name: 'Capteur Terrasse' });
            expect(temp.isOutdoor).toBe(true);
        });

        it('est insensible à la casse', () => {
            const temp1 = makeTemperature({ name: 'EXTÉRIEUR' });
            const temp2 = makeTemperature({ name: 'OUTDOOR' });
            const temp3 = makeTemperature({ name: 'TeRrAsSeT' });
            expect(temp1.isOutdoor).toBe(true);
            expect(temp2.isOutdoor).toBe(true);
            expect(temp3.isOutdoor).toBe(true);
        });

        it('retourne false pour intérieur', () => {
            const temp = makeTemperature({ name: 'Salon' });
            expect(temp.isOutdoor).toBe(false);
        });

        it('retourne false pour chambre', () => {
            const temp = makeTemperature({ name: 'Chambre' });
            expect(temp.isOutdoor).toBe(false);
        });

        it('retourne false pour cuisine', () => {
            const temp = makeTemperature({ name: 'Cuisine' });
            expect(temp.isOutdoor).toBe(false);
        });
    });

    // ─── displayTemp Getter ─────────────────────────────────────────────────────────

    describe('displayTemp getter', () => {
        it('formate la température avec l\'unité °C', () => {
            const temp = makeTemperature({ temp: 22.5 });
            expect(temp.displayTemp).toBe('22.5°C');
        });

        it('formate les entiers sans décimales', () => {
            const temp = makeTemperature({ temp: 20 });
            expect(temp.displayTemp).toBe('20°C');
        });

        it('gère les températures négatives', () => {
            const temp = makeTemperature({ temp: -5.2 });
            expect(temp.displayTemp).toBe('-5.2°C');
        });

        it('gère les températures très hautes', () => {
            const temp = makeTemperature({ temp: 50.8 });
            expect(temp.displayTemp).toBe('50.8°C');
        });
    });

    // ─── displayHumidity Getter ────────────────────────────────────────────────────

    describe('displayHumidity getter', () => {
        it('affiche humidité avec statut', () => {
            const temp = makeTemperature({
                humidity: 65,
                humidityStatus: 'Confortable',
            });
            expect(temp.displayHumidity).toBe('65% (Confortable)');
        });

        it('affiche humidité sans statut', () => {
            const temp = makeTemperature({
                humidity: 45,
                humidityStatus: '',
            });
            expect(temp.displayHumidity).toBe('45%');
        });

        it('gère l\'humidité 0%', () => {
            const temp = makeTemperature({
                humidity: 0,
                humidityStatus: 'Sec',
            });
            expect(temp.displayHumidity).toBe('0% (Sec)');
        });

        it('gère l\'humidité 100%', () => {
            const temp = makeTemperature({
                humidity: 100,
                humidityStatus: 'Humide',
            });
            expect(temp.displayHumidity).toBe('100% (Humide)');
        });
    });

    // ─── Edge Cases ─────────────────────────────────────────────────────────────────

    describe('Edge Cases', () => {
        it('gère les noms vides', () => {
            const temp = makeTemperature({ name: '' });
            expect(temp.name).toBe('');
            expect(temp.isOutdoor).toBe(false);
        });

        it('gère les statuts humidité null/undefined', () => {
            const temp = makeTemperature({
                humidity: 50,
                humidityStatus: '',
            });
            expect(temp.displayHumidity).toBe('50%');
        });

        it('gère les idx strings avec diverses valeurs', () => {
            const temp1 = makeTemperature({ idx: '123' });
            const temp2 = makeTemperature({ idx: 'abc' });
            const temp3 = makeTemperature({ idx: '0' });
            expect(temp1.idx).toBe('123');
            expect(temp2.idx).toBe('abc');
            expect(temp3.idx).toBe('0');
        });

        it('gère isActive true et false', () => {
            const active = makeTemperature({ isActive: true });
            const inactive = makeTemperature({ isActive: false });
            expect(active.isActive).toBe(true);
            expect(inactive.isActive).toBe(false);
        });
    });

    // ─── Readonly Properties ────────────────────────────────────────────────────────

    describe('Readonly Properties', () => {
        it('toutes les propriétés sont readonly', () => {
            const temp = makeTemperature({});
            expect(() => {
                (temp as any).temp = 30;
            }).toThrow();
            expect(() => {
                (temp as any).humidity = 80;
            }).toThrow();
            expect(() => {
                (temp as any).status = 'FAILED';
            }).toThrow();
        });
    });

    // ─── Data Types ─────────────────────────────────────────────────────────────────

    describe('Data Types', () => {
        it('maintient les types corrects', () => {
            const temp = makeTemperature({
                idx: '42',
                rang: 1,
                temp: 21.5,
                humidity: 70,
            });
            expect(typeof temp.idx).toBe('string');
            expect(typeof temp.rang).toBe('number');
            expect(typeof temp.temp).toBe('number');
            expect(typeof temp.humidity).toBe('number');
        });
    });
});
