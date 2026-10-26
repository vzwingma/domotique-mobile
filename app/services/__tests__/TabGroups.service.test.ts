/**
 * Tests unitaires du service TabGroups (Plan d'Action 004, T3.2)
 *
 * Couvre :
 *  - getMergedTabGroup : groupes Lumières+Volets / Températures+Maison, Favoris sans groupe
 *  - isTabActive : égalité stricte hors layout fusionné, activation groupée en layout fusionné
 *  - getTabTitle : libellé simple ou titre fusionné "A & B"
 */
import { Tabs } from '../../enums/TabsEnums';
import { MERGED_TAB_GROUPS, getMergedTabGroup, getTabTitle, isTabActive } from '../TabGroups.service';

const ALL_TABS = Object.values(Tabs) as Tabs[];

describe('TabGroups.service', () => {

  describe('MERGED_TAB_GROUPS', () => {
    it('définit 2 groupes ordonnés (colonne gauche, colonne droite)', () => {
      expect(MERGED_TAB_GROUPS).toEqual([
        [Tabs.LUMIERES, Tabs.VOLETS],
        [Tabs.TEMPERATURES, Tabs.MAISON],
      ]);
    });

    it("n'inclut jamais Favoris", () => {
      MERGED_TAB_GROUPS.forEach(group => expect(group).not.toContain(Tabs.INDEX));
    });
  });

  describe('getMergedTabGroup', () => {
    it.each([
      [Tabs.LUMIERES, [Tabs.LUMIERES, Tabs.VOLETS]],
      [Tabs.VOLETS, [Tabs.LUMIERES, Tabs.VOLETS]],
      [Tabs.TEMPERATURES, [Tabs.TEMPERATURES, Tabs.MAISON]],
      [Tabs.MAISON, [Tabs.TEMPERATURES, Tabs.MAISON]],
    ])('%s → groupe %j', (tab, expected) => {
      expect(getMergedTabGroup(tab)).toEqual(expected);
    });

    it('Favoris → null', () => {
      expect(getMergedTabGroup(Tabs.INDEX)).toBeNull();
    });

    it('onglet inconnu → null', () => {
      expect(getMergedTabGroup('Inconnu' as Tabs)).toBeNull();
    });
  });

  describe('isTabActive — hors layout fusionné (téléphone)', () => {
    it.each(ALL_TABS)('seul l\'onglet %s est actif quand il est sélectionné', (activeTab) => {
      ALL_TABS.forEach(thisTab => {
        expect(isTabActive(activeTab, thisTab, false)).toBe(activeTab === thisTab);
      });
    });
  });

  describe('isTabActive — layout fusionné (tablette paysage)', () => {
    it.each([
      [Tabs.LUMIERES, [Tabs.LUMIERES, Tabs.VOLETS]],
      [Tabs.VOLETS, [Tabs.LUMIERES, Tabs.VOLETS]],
      [Tabs.TEMPERATURES, [Tabs.TEMPERATURES, Tabs.MAISON]],
      [Tabs.MAISON, [Tabs.TEMPERATURES, Tabs.MAISON]],
      [Tabs.INDEX, [Tabs.INDEX]],
    ])('onglet sélectionné %s → boutons actifs %j', (activeTab, expectedActive) => {
      ALL_TABS.forEach(thisTab => {
        expect(isTabActive(activeTab, thisTab, true)).toBe(expectedActive.includes(thisTab));
      });
    });
  });

  describe('getTabTitle', () => {
    it.each(ALL_TABS)('hors layout fusionné : %s → libellé de l\'onglet', (tab) => {
      expect(getTabTitle(tab, false)).toBe(tab.toString());
    });

    it.each([
      [Tabs.LUMIERES, 'Lumières & Volets'],
      [Tabs.VOLETS, 'Lumières & Volets'],
      [Tabs.TEMPERATURES, 'Températures & Maison'],
      [Tabs.MAISON, 'Températures & Maison'],
      [Tabs.INDEX, 'Favoris'],
    ])('layout fusionné : %s → "%s"', (tab, expected) => {
      expect(getTabTitle(tab, true)).toBe(expected);
    });
  });
});
