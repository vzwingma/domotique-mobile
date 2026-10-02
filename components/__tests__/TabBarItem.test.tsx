/**
 * Tests pour le composant TabBarItems (navigation/TabBarItem.tsx)
 *
 * Utilise @testing-library/react-native pour éviter les problèmes avec
 * react-test-renderer.toJSON() qui peut retourner null avec React 19.
 *
 * Couvre :
 *  - Rendu de l'onglet actif (couleur domoticz)
 *  - Rendu de l'onglet inactif (couleur blanche)
 *  - Nom MaterialCommunityIcons direct selon l'etat actif/inactif
 *  - Déclenchement du callback selectNewTab via onTouchEnd / onPointerDown
 *  - Rendu sans crash pour chaque valeur de l'enum Tabs
 */
import * as React from 'react';
import { render, act } from '@testing-library/react-native';
import { TabBarItems } from '../navigation/TabBarItem';
import { Tabs } from '@/app/enums/TabsEnums';
import { Colors } from '@/app/enums/Colors';

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// ─── Helper : trouve le noeud MaterialCommunityIcons dans le rendu ─────────────

function getTabIconProps(tab: Tabs, activeTab: Tabs, selectNewTab: jest.Mock) {
  const rendered = render(
    <TabBarItems activeTab={activeTab} thisTab={tab} selectNewTab={selectNewTab} />
  );
  // RTL v13 expose root pour accéder au premier element
  const root = rendered.root;
  // Cherche récursivement un enfant de type 'MaterialCommunityIcons' (la string mockée)
  function findTabIcon(instance: any): any | null {
    if (!instance) return null;
    if (instance.type === 'MaterialCommunityIcons') return instance;
    for (const child of (instance.children ?? [])) {
      const found = findTabIcon(child);
      if (found) return found;
    }
    return null;
  }
  return findTabIcon(root)?.props ?? null;
}

// ─── Couleurs selon l'etat actif ──────────────────────────────────────────────

describe("TabBarItems - couleur selon l'etat actif", () => {
  const selectNewTab = jest.fn();
  beforeEach(() => selectNewTab.mockClear());

  it("onglet actif : couleur domoticz transmise a l'icone", () => {
    const props = getTabIconProps(Tabs.INDEX, Tabs.INDEX, selectNewTab);
    expect(props).not.toBeNull();
    expect(props.color).toBe(Colors.domoticz.color);
  });

  it("onglet inactif : couleur blanche (#ffffff) transmise a l'icone", () => {
    const props = getTabIconProps(Tabs.LUMIERES, Tabs.INDEX, selectNewTab);
    expect(props).not.toBeNull();
    expect(props.color).toBe('#ffffff');
  });

  it("onglet actif : l'icone n'a pas le suffixe -outline", () => {
    const props = getTabIconProps(Tabs.LUMIERES, Tabs.LUMIERES, selectNewTab);
    expect(props?.name).toBeDefined();
    expect(props?.name).toBe('lightbulb');
  });

  it("onglet inactif : l'icone utilise le nom MaterialCommunityIcons inactif", () => {
    const props = getTabIconProps(Tabs.LUMIERES, Tabs.INDEX, selectNewTab);
    expect(props?.name).toBeDefined();
    expect(props?.name).toBe('lightbulb-outline');
  });

  it("onglet volets : utilise le nom MaterialCommunityIcons direct", () => {
    const props = getTabIconProps(Tabs.VOLETS, Tabs.INDEX, selectNewTab);
    expect(props?.name).toBe('window-shutter');
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
      <TabBarItems activeTab={Tabs.INDEX} thisTab={Tabs.MAISON} selectNewTab={selectNewTab} />
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

// ─── Surcharge isActive (Plan 004 — onglets groupés en layout fusionné) ────────

describe('TabBarItems - surcharge isActive', () => {
  const selectNewTab = jest.fn();

  function getIconProps(element: React.ReactElement) {
    const { UNSAFE_getByType } = render(element);
    return UNSAFE_getByType('MaterialCommunityIcons' as any).props;
  }

  it('isActive=true sur un onglet non sélectionné → couleur domoticz + icône pleine', () => {
    const props = getIconProps(
      <TabBarItems activeTab={Tabs.VOLETS} thisTab={Tabs.LUMIERES} selectNewTab={selectNewTab} isActive />
    );
    expect(props.color).toBe(Colors.domoticz.color);
    expect(props.name).toBe('lightbulb');
  });

  it('isActive=false sur l\'onglet sélectionné → couleur blanche + icône outline', () => {
    const props = getIconProps(
      <TabBarItems activeTab={Tabs.MAISON} thisTab={Tabs.MAISON} selectNewTab={selectNewTab} isActive={false} />
    );
    expect(props.color).toBe('#ffffff');
    expect(props.name).toBe('home-outline');
  });

  it('isActive non fourni → défaut activeTab === thisTab', () => {
    const props = getIconProps(
      <TabBarItems activeTab={Tabs.MAISON} thisTab={Tabs.MAISON} selectNewTab={selectNewTab} />
    );
    expect(props.color).toBe(Colors.domoticz.color);
    expect(props.name).toBe('home');
  });
});
