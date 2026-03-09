/**
 * Tests pour le composant TabBarItems (navigation/TabBarItem.tsx)
 *
 * Couvre :
 *  - Rendu de l'onglet actif (couleur domoticz)
 *  - Rendu de l'onglet inactif (couleur blanche)
 *  - Déclenchement du callback selectNewTab via onTouchEnd
 *  - Rendu sans crash pour chaque valeur de l'enum Tabs
 */
import * as React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TabBarItems } from '../navigation/TabBarItem';
import { Tabs } from '@/app/enums/TabsEnums';
import { Colors } from '@/app/enums/Colors';

// Ionicons est importé directement via '@expo/vector-icons/Ionicons' dans TabBarIcon
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Cherche récursivement le premier nœud correspondant au type dans le JSON du rendu */
function findNodeByType(node: any, type: string): any | null {
  if (!node || typeof node !== 'object') return null;
  if (node.type === type) return node;
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findNodeByType(child, type);
      if (found) return found;
    }
  }
  return null;
}

// ─── Couleurs ─────────────────────────────────────────────────────────────────

describe('TabBarItems – couleur selon l'état actif', () => {
  const selectNewTab = jest.fn();

  beforeEach(() => selectNewTab.mockClear());

  it('onglet actif → couleur domoticz transmise à l'icône', () => {
    const tree = renderer
      .create(
        <TabBarItems
          activeTab={Tabs.INDEX}
          thisTab={Tabs.INDEX}
          selectNewTab={selectNewTab}
        />
      )
      .toJSON();

    const iconNode = findNodeByType(tree, 'Ionicons');
    expect(iconNode).not.toBeNull();
    expect(iconNode.props.color).toBe(Colors.domoticz.color);
  });

  it('onglet inactif → couleur blanche (#ffffff) transmise à l'icône', () => {
    const tree = renderer
      .create(
        <TabBarItems
          activeTab={Tabs.INDEX}
          thisTab={Tabs.LUMIERES}
          selectNewTab={selectNewTab}
        />
      )
      .toJSON();

    const iconNode = findNodeByType(tree, 'Ionicons');
    expect(iconNode).not.toBeNull();
    expect(iconNode.props.color).toBe('#ffffff');
  });

  it('onglet actif → l'icône n'a pas le suffixe -outline', () => {
    const tree = renderer
      .create(
        <TabBarItems
          activeTab={Tabs.LUMIERES}
          thisTab={Tabs.LUMIERES}
          selectNewTab={selectNewTab}
        />
      )
      .toJSON();

    const iconNode = findNodeByType(tree, 'Ionicons');
    expect(iconNode?.props?.name).not.toMatch(/-outline$/);
  });

  it('onglet inactif → l'icône a le suffixe -outline', () => {
    const tree = renderer
      .create(
        <TabBarItems
          activeTab={Tabs.INDEX}
          thisTab={Tabs.LUMIERES}
          selectNewTab={selectNewTab}
        />
      )
      .toJSON();

    const iconNode = findNodeByType(tree, 'Ionicons');
    expect(iconNode?.props?.name).toMatch(/-outline$/);
  });
});

// ─── Callback selectNewTab ─────────────────────────────────────────────────────

describe('TabBarItems – callback selectNewTab', () => {
  const selectNewTab = jest.fn();

  beforeEach(() => selectNewTab.mockClear());

  it('onTouchEnd appelle selectNewTab avec le bon onglet', () => {
    const tree = renderer.create(
      <TabBarItems
        activeTab={Tabs.INDEX}
        thisTab={Tabs.VOLETS}
        selectNewTab={selectNewTab}
      />
    );
    const rootNode = tree.toJSON() as any;

    act(() => {
      rootNode.props.onTouchEnd();
    });

    expect(selectNewTab).toHaveBeenCalledTimes(1);
    expect(selectNewTab).toHaveBeenCalledWith(Tabs.VOLETS);
  });

  it('onPointerDown appelle selectNewTab avec le bon onglet', () => {
    const tree = renderer.create(
      <TabBarItems
        activeTab={Tabs.INDEX}
        thisTab={Tabs.TEMPERATURES}
        selectNewTab={selectNewTab}
      />
    );
    const rootNode = tree.toJSON() as any;

    act(() => {
      rootNode.props.onPointerDown();
    });

    expect(selectNewTab).toHaveBeenCalledTimes(1);
    expect(selectNewTab).toHaveBeenCalledWith(Tabs.TEMPERATURES);
  });

  it('selectNewTab n'est pas appelé sans interaction', () => {
    renderer.create(
      <TabBarItems
        activeTab={Tabs.INDEX}
        thisTab={Tabs.PARAMETRES}
        selectNewTab={selectNewTab}
      />
    );
    expect(selectNewTab).not.toHaveBeenCalled();
  });
});

// ─── Rendu sans crash pour chaque onglet ──────────────────────────────────────

describe('TabBarItems – rendu sans crash pour chaque valeur de Tabs', () => {
  const selectNewTab = jest.fn();

  (Object.values(Tabs) as Tabs[]).forEach((tab) => {
    it(`ne crash pas pour thisTab=${tab}`, () => {
      expect(() =>
        renderer.create(
          <TabBarItems
            activeTab={Tabs.INDEX}
            thisTab={tab}
            selectNewTab={selectNewTab}
          />
        )
      ).not.toThrow();
    });

    it(`ne crash pas quand thisTab=${tab} est l'onglet actif`, () => {
      expect(() =>
        renderer.create(
          <TabBarItems
            activeTab={tab}
            thisTab={tab}
            selectNewTab={selectNewTab}
          />
        )
      ).not.toThrow();
    });
  });
});
