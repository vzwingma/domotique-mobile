/**
 * Tests pour le composant TabBarItems (navigation/TabBarItem.tsx)
 *
 * Utilise @testing-library/react-native pour éviter les problèmes avec
 * react-test-renderer.toJSON() qui peut retourner null avec React 19.
 *
 * Couvre :
 *  - Rendu de l'onglet actif (couleur domoticz)
 *  - Rendu de l'onglet inactif (couleur blanche)
 *  - Absence du suffixe -outline pour l'onglet actif
 *  - Présence du suffixe -outline pour l'onglet inactif
 *  - Déclenchement du callback selectNewTab via onTouchEnd / onPointerDown
 *  - Rendu sans crash pour chaque valeur de l'enum Tabs
 */
import * as React from 'react';
import { render, act } from '@testing-library/react-native';
import { TabBarItems } from '../navigation/TabBarItem';
import { Tabs } from '@/app/enums/TabsEnums';
import { Colors } from '@/app/enums/Colors';

// Ionicons est importé directement via '@expo/vector-icons/Ionicons' dans TabBarIcon
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// ─── Helper : trouve tous les noeuds Ionicons dans le rendu ────────────────────

function getIoniconsProps(tab: Tabs, activeTab: Tabs, selectNewTab: jest.Mock) {
  const rendered = render(
    <TabBarItems activeTab={activeTab} thisTab={tab} selectNewTab={selectNewTab} />
  );
  // RTL v13 expose root pour accéder au premier element
  const root = rendered.root;
  // Cherche récursivement un enfant de type 'Ionicons' (la string mockée)
  function findIonicons(instance: any): any | null {
    if (!instance) return null;
    if (instance.type === 'Ionicons') return instance;
    for (const child of (instance.children ?? [])) {
      const found = findIonicons(child);
      if (found) return found;
    }
    return null;
  }
  return findIonicons(root)?.props ?? null;
}

// ─── Couleurs selon l'etat actif ──────────────────────────────────────────────

describe("TabBarItems - couleur selon l'etat actif", () => {
  const selectNewTab = jest.fn();
  beforeEach(() => selectNewTab.mockClear());

  it("onglet actif : couleur domoticz transmise a l'icone", () => {
    const props = getIoniconsProps(Tabs.INDEX, Tabs.INDEX, selectNewTab);
    expect(props).not.toBeNull();
    expect(props.color).toBe(Colors.domoticz.color);
  });

  it("onglet inactif : couleur blanche (#ffffff) transmise a l'icone", () => {
    const props = getIoniconsProps(Tabs.LUMIERES, Tabs.INDEX, selectNewTab);
    expect(props).not.toBeNull();
    expect(props.color).toBe('#ffffff');
  });

  it("onglet actif : l'icone n'a pas le suffixe -outline", () => {
    const props = getIoniconsProps(Tabs.LUMIERES, Tabs.LUMIERES, selectNewTab);
    expect(props?.name).toBeDefined();
    expect(props?.name).not.toMatch(/-outline$/);
  });

  it("onglet inactif : l'icone a le suffixe -outline", () => {
    const props = getIoniconsProps(Tabs.LUMIERES, Tabs.INDEX, selectNewTab);
    expect(props?.name).toBeDefined();
    expect(props?.name).toMatch(/-outline$/);
  });
});

// ─── Callback selectNewTab ─────────────────────────────────────────────────────

describe('TabBarItems - callback selectNewTab', () => {
  const selectNewTab = jest.fn();
  beforeEach(() => selectNewTab.mockClear());

  it('onTouchEnd appelle selectNewTab avec le bon onglet', () => {
    const { root } = render(
      <TabBarItems activeTab={Tabs.INDEX} thisTab={Tabs.VOLETS} selectNewTab={selectNewTab} />
    );
    act(() => {
      root.props.onTouchEnd();
    });
    expect(selectNewTab).toHaveBeenCalledTimes(1);
    expect(selectNewTab).toHaveBeenCalledWith(Tabs.VOLETS);
  });

  it('onPointerDown appelle selectNewTab avec le bon onglet', () => {
    const { root } = render(
      <TabBarItems activeTab={Tabs.INDEX} thisTab={Tabs.TEMPERATURES} selectNewTab={selectNewTab} />
    );
    act(() => {
      root.props.onPointerDown();
    });
    expect(selectNewTab).toHaveBeenCalledTimes(1);
    expect(selectNewTab).toHaveBeenCalledWith(Tabs.TEMPERATURES);
  });

  it('selectNewTab non appele sans interaction', () => {
    render(
      <TabBarItems activeTab={Tabs.INDEX} thisTab={Tabs.PARAMETRES} selectNewTab={selectNewTab} />
    );
    expect(selectNewTab).not.toHaveBeenCalled();
  });
});

// ─── Rendu sans crash pour chaque onglet ──────────────────────────────────────

describe('TabBarItems - rendu sans crash pour chaque valeur de Tabs', () => {
  const selectNewTab = jest.fn();

  (Object.values(Tabs) as Tabs[]).forEach((tab) => {
    it(`ne crash pas pour thisTab=${tab}`, () => {
      expect(() =>
        render(
          <TabBarItems activeTab={Tabs.INDEX} thisTab={tab} selectNewTab={selectNewTab} />
        )
      ).not.toThrow();
    });

    it(`ne crash pas quand thisTab=${tab} est l'onglet actif`, () => {
      expect(() =>
        render(
          <TabBarItems activeTab={tab} thisTab={tab} selectNewTab={selectNewTab} />
        )
      ).not.toThrow();
    });
  });
});
