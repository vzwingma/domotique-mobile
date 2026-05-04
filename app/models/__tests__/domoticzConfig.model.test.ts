import DomoticzConfig from '../domoticzConfig.model';

describe('DomoticzConfig', () => {
    // ─── Helpers ───────────────────────────────────────────────────────────────────

    function makeConfig(overrides: Partial<DomoticzConfig> = {}): DomoticzConfig {
        return new DomoticzConfig({
            status: 'OK',
            version: '3.7.0',
            revision: '123',
            ...overrides,
        } as unknown as DomoticzConfig);
    }

    // ─── Constructor ────────────────────────────────────────────────────────────────

    describe('Constructor', () => {
        it('crée une configuration avec les propriétés correctes', () => {
            const config = makeConfig();
            expect(config.status).toBe('OK');
            expect(config.version).toBe('3.7.0');
            expect(config.revision).toBe('123');
        });

        it('propriétés readonly sont définies et accessibles', () => {
            const config = makeConfig();
            expect(config.status).toBe('OK');
            expect(config.version).toBe('3.7.0');
            expect(config.revision).toBe('123');
            // TypeScript empêche les assignations à compile-time
        });
    });

    // ─── isOnline Getter ────────────────────────────────────────────────────────────

    describe('isOnline getter', () => {
        it('retourne true si status contient "OK"', () => {
            const config = makeConfig({ status: 'OK' });
            expect(config.isOnline).toBe(true);
        });

        it('retourne true si status = "ok" (minuscule)', () => {
            const config = makeConfig({ status: 'ok' });
            expect(config.isOnline).toBe(true);
        });

        it('retourne true si status = "OK" (majuscule)', () => {
            const config = makeConfig({ status: 'OK' });
            expect(config.isOnline).toBe(true);
        });

        it('retourne true si status contient "Ok"', () => {
            const config = makeConfig({ status: 'Status: Ok' });
            expect(config.isOnline).toBe(true);
        });

        it('retourne false si status ne contient pas "OK"', () => {
            const config = makeConfig({ status: 'OFFLINE' });
            expect(config.isOnline).toBe(false);
        });

        it('retourne false si status = "ERROR"', () => {
            const config = makeConfig({ status: 'ERROR' });
            expect(config.isOnline).toBe(false);
        });

        it('retourne false si status est vide', () => {
            const config = makeConfig({ status: '' });
            expect(config.isOnline).toBe(false);
        });
    });

    // ─── displayVersion Getter ────────────────────────────────────────────────────

    describe('displayVersion getter', () => {
        it('formate la version correctement', () => {
            const config = makeConfig({ version: '3.7.0', revision: '123' });
            expect(config.displayVersion).toBe('v3.7.0 (revision 123)');
        });

        it('gère les versions sans patch', () => {
            const config = makeConfig({ version: '3.7', revision: '456' });
            expect(config.displayVersion).toBe('v3.7 (revision 456)');
        });

        it('gère les révisions numériques grandes', () => {
            const config = makeConfig({ version: '4.0.0', revision: '9999' });
            expect(config.displayVersion).toBe('v4.0.0 (revision 9999)');
        });

        it('gère les versions beta', () => {
            const config = makeConfig({ version: '3.9.0-beta', revision: '789' });
            expect(config.displayVersion).toBe('v3.9.0-beta (revision 789)');
        });

        it('gère les révisions alphanumériques', () => {
            const config = makeConfig({ version: '3.7.0', revision: 'abc123' });
            expect(config.displayVersion).toBe('v3.7.0 (revision abc123)');
        });
    });

    // ─── Multiple Configurations ───────────────────────────────────────────────────

    describe('Multiple Configurations', () => {
        it('gère plusieurs instances indépendantes', () => {
            const config1 = makeConfig({ status: 'OK', version: '3.7.0' });
            const config2 = makeConfig({ status: 'ERROR', version: '3.8.0' });

            expect(config1.isOnline).toBe(true);
            expect(config2.isOnline).toBe(false);
            expect(config1.displayVersion).not.toEqual(config2.displayVersion);
        });
    });

    // ─── Edge Cases ────────────────────────────────────────────────────────────────

    describe('Edge Cases', () => {
        it('gère les chaînes vides', () => {
            const config = makeConfig({
                status: '',
                version: '',
                revision: '',
            });
            expect(config.isOnline).toBe(false);
            expect(config.displayVersion).toBe('v (revision )');
        });

        it('gère les chaînes très longues', () => {
            const longVersion = 'a'.repeat(50);
            const longRevision = 'b'.repeat(50);
            const config = makeConfig({
                version: longVersion,
                revision: longRevision,
            });
            expect(config.displayVersion).toContain(longVersion);
            expect(config.displayVersion).toContain(longRevision);
        });

        it('gère les statuts avec espaces', () => {
            const config = makeConfig({ status: '  OK  ' });
            expect(config.isOnline).toBe(true);
        });
    });
});
