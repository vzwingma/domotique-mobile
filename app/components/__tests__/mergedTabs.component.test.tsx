/**
 * Tests du composant MergedTabs (Plan d'Action 004, T3.4)
 *
 * Couvre :
 *  - rendu des 2 colonnes dans l'ordre (gauche, droite) avec leur contenu
 *  - sous-titre de colonne (libellé de l'onglet)
 *  - getMergedColumnWidth : (largeur − 2×padding − gap) / 2
 */
import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { MergedTabs, MERGED_COLUMNS_GAP, getMergedColumnWidth } from '../mergedTabs.component';
import { Tabs } from '../../enums/TabsEnums';

jest.mock('@/components/navigation/TabHeaderIcon', () => ({
  getHeaderIcon: () => null,
}));

describe('MergedTabs', () => {
  it('affiche 2 colonnes ordonnées avec titre et contenu', () => {
    const { getByTestId, getByText, toJSON } = render(
      <MergedTabs columns={[
        { tab: Tabs.LUMIERES, content: <Text>contenu-lumieres</Text> },
        { tab: Tabs.VOLETS, content: <Text>contenu-volets</Text> },
      ]} />
    );

    const left = getByTestId(`merged-column-${Tabs.LUMIERES}`);
    const right = getByTestId(`merged-column-${Tabs.VOLETS}`);
    expect(left).toBeTruthy();
    expect(right).toBeTruthy();

    expect(getByText('Lumières')).toBeTruthy();
    expect(getByText('Volets')).toBeTruthy();
    expect(getByText('contenu-lumieres')).toBeTruthy();
    expect(getByText('contenu-volets')).toBeTruthy();

    // Ordre : la colonne Lumières précède la colonne Volets
    const container = toJSON() as any;
    expect(container.children.map((c: any) => c.props.testID)).toEqual([
      `merged-column-${Tabs.LUMIERES}`,
      `merged-column-${Tabs.VOLETS}`,
    ]);
  });

  it('conteneur en ligne, colonnes flex:1 sans hauteur fixe (ascenseur porté par la page)', () => {
    const { toJSON, getByTestId } = render(
      <MergedTabs columns={[
        { tab: Tabs.TEMPERATURES, content: <Text>t</Text> },
        { tab: Tabs.MAISON, content: <Text>m</Text> },
      ]} />
    );
    const container = toJSON() as any;
    expect(container.props.style).toEqual(expect.objectContaining({ flexDirection: 'row', gap: MERGED_COLUMNS_GAP }));

    const columnStyle = getByTestId(`merged-column-${Tabs.TEMPERATURES}`).props.style;
    expect(columnStyle).toEqual(expect.objectContaining({ flex: 1 }));
    expect(columnStyle.height).toBeUndefined();
  });
});

describe('getMergedColumnWidth', () => {
  it('Tab S6 paysage (1280dp, padding 10) → 625dp', () => {
    expect(getMergedColumnWidth(1280, 10)).toBe(625);
  });

  it('sans padding → (largeur − gap) / 2', () => {
    expect(getMergedColumnWidth(1000, 0)).toBe((1000 - MERGED_COLUMNS_GAP) / 2);
  });
});
