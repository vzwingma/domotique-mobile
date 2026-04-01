/**
 * Tests unitaires pour le hook useThemeColor
 * Vérifie que le hook retourne la bonne couleur depuis Colors.dark pour chaque clé
 */

import { useThemeColor } from '../useThemeColor';
import { Colors } from '@/app/enums/Colors';

describe('useThemeColor', () => {
  describe('retourne la couleur correcte depuis Colors.dark', () => {
    // Parcourt toutes les clés de Colors.dark et vérifie chaque valeur
    const darkColorKeys = Object.keys(Colors.dark) as Array<keyof typeof Colors.dark>;

    darkColorKeys.forEach((key) => {
      it(`retourne Colors.dark.${key} = "${Colors.dark[key]}"`, () => {
        const result = useThemeColor(key);
        expect(result).toBe(Colors.dark[key]);
      });
    });
  });

  describe('valeurs spécifiques de Colors.dark', () => {
    it('retourne la couleur de texte #ECEDEE', () => {
      expect(useThemeColor('text')).toBe('#ECEDEE');
    });

    it('retourne la couleur de fond courante', () => {
      expect(useThemeColor('background')).toBe(Colors.dark.background);
    });

    it('retourne la couleur de fond du titre courante', () => {
      expect(useThemeColor('titlebackground')).toBe(Colors.dark.titlebackground);
    });

    it('retourne la couleur tint #fff', () => {
      expect(useThemeColor('tint')).toBe('#fff');
    });

    it('retourne la couleur des icônes #9BA1A6', () => {
      expect(useThemeColor('icon')).toBe('#9BA1A6');
    });

    it('retourne la couleur par défaut des icônes de tabulation #9BA1A6', () => {
      expect(useThemeColor('tabIconDefault')).toBe('#9BA1A6');
    });

    it('retourne la couleur des icônes de tabulation sélectionnées #fff', () => {
      expect(useThemeColor('tabIconSelected')).toBe('#fff');
    });
  });
});
