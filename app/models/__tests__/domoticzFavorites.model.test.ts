import DomoticzFavorites from '../domoticzFavorites.model';
import { DomoticzDeviceType } from '../../enums/DomoticzEnum';

describe('DomoticzFavorites', () => {
    // ─── Helpers ───────────────────────────────────────────────────────────────────

    function makeFavorite(overrides: Partial<DomoticzFavorites> = {}): DomoticzFavorites {
        return new DomoticzFavorites({
            idx: 1,
            nbOfUse: 2,
            name: 'My Light',
            type: DomoticzDeviceType.LUMIERE,
            subType: 'Switch',
            ...overrides,
        } as unknown as DomoticzFavorites);
    }

    // ─── Constructor & Validation ───────────────────────────────────────────────────

    describe('Constructor & Validation', () => {
        it('crée un favori avec les propriétés correctes', () => {
            const fav = makeFavorite({ idx: 42, name: 'Salon Light' });
            expect(fav.idx).toBe(42);
            expect(fav.name).toBe('Salon Light');
            expect(fav.nbOfUse).toBe(2);
        });

        it('lève une erreur si idx <= 0', () => {
            expect(() => makeFavorite({ idx: 0 })).toThrow('idx doit être > 0');
            expect(() => makeFavorite({ idx: -1 })).toThrow('idx doit être > 0');
        });

        it('propriétés readonly sont définies et accessibles', () => {
            const fav = makeFavorite();
            expect(fav.idx).toBe(1);
            expect(fav.name).toBe('My Light');
            // TypeScript empêche les assignations à compile-time
        });
    });

    // ─── isPopular Getter ───────────────────────────────────────────────────────────

    describe('isPopular getter', () => {
        it('retourne true si nbOfUse >= 5', () => {
            const fav = makeFavorite({ nbOfUse: 5 });
            expect(fav.isPopular).toBe(true);
        });

        it('retourne true si nbOfUse > 5', () => {
            const fav = makeFavorite({ nbOfUse: 10 });
            expect(fav.isPopular).toBe(true);
        });

        it('retourne false si nbOfUse < 5', () => {
            const fav = makeFavorite({ nbOfUse: 4 });
            expect(fav.isPopular).toBe(false);
        });

        it('retourne false si nbOfUse = 0', () => {
            const fav = makeFavorite({ nbOfUse: 0 });
            expect(fav.isPopular).toBe(false);
        });

        it('retourne false si nbOfUse = 1', () => {
            const fav = makeFavorite({ nbOfUse: 1 });
            expect(fav.isPopular).toBe(false);
        });
    });

    // ─── displayUsageCount Getter ───────────────────────────────────────────────────

    describe('displayUsageCount getter', () => {
        it('affiche "1 utilisation" pour nbOfUse = 1', () => {
            const fav = makeFavorite({ nbOfUse: 1 });
            expect(fav.displayUsageCount).toBe('1 utilisation');
        });

        it('affiche "N utilisations" pour nbOfUse > 1', () => {
            const fav = makeFavorite({ nbOfUse: 5 });
            expect(fav.displayUsageCount).toBe('5 utilisations');
        });

        it('affiche "0 utilisations" pour nbOfUse = 0', () => {
            const fav = makeFavorite({ nbOfUse: 0 });
            expect(fav.displayUsageCount).toBe('0 utilisations');
        });

        it('affiche "100 utilisations" pour un grand nombre', () => {
            const fav = makeFavorite({ nbOfUse: 100 });
            expect(fav.displayUsageCount).toBe('100 utilisations');
        });
    });

    // ─── Setters (Mutabilité contrôlée) ───────────────────────────────────────────

    describe('Setters', () => {
        it('permet de modifier nbOfUse', () => {
            const fav = makeFavorite({ nbOfUse: 2 });
            expect(fav.nbOfUse).toBe(2);
            fav.nbOfUse = 10;
            expect(fav.nbOfUse).toBe(10);
            expect(fav.isPopular).toBe(true);
        });

        it('passe de non-populaire à populaire', () => {
            const fav = makeFavorite({ nbOfUse: 3 });
            expect(fav.isPopular).toBe(false);
            fav.nbOfUse = 5;
            expect(fav.isPopular).toBe(true);
        });
    });

    // ─── Device Types ──────────────────────────────────────────────────────────────

    describe('Device Types', () => {
        it('accepte LUMIERE', () => {
            const fav = makeFavorite({ type: DomoticzDeviceType.LUMIERE });
            expect(fav.type).toBe(DomoticzDeviceType.LUMIERE);
        });

        it('accepte VOLET', () => {
            const fav = makeFavorite({ type: DomoticzDeviceType.VOLET });
            expect(fav.type).toBe(DomoticzDeviceType.VOLET);
        });

        it('accepte THERMOSTAT', () => {
            const fav = makeFavorite({ type: DomoticzDeviceType.THERMOSTAT });
            expect(fav.type).toBe(DomoticzDeviceType.THERMOSTAT);
        });

        it('accepte PARAMETRE', () => {
            const fav = makeFavorite({ type: DomoticzDeviceType.PARAMETRE });
            expect(fav.type).toBe(DomoticzDeviceType.PARAMETRE);
        });
    });
});
