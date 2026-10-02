import React, { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { getHeaderIcon } from '@/components/navigation/TabHeaderIcon';
import { Tabs } from '../enums/TabsEnums';

// Écartement entre les 2 colonnes, cohérent avec ParallaxScrollView `styles.content` (gap: 10)
export const MERGED_COLUMNS_GAP = 10;

export type MergedTabColumn = {
  tab: Tabs;
  content: JSX.Element;
};

export type MergedTabsProps = {
  columns: readonly [MergedTabColumn, MergedTabColumn];
};

/**
 * Écran fusionné (tablette paysage) : 2 onglets affichés côte à côte sur 2 colonnes.
 * Aucune hauteur fixe : le défilement vertical est porté par la page (ParallaxScrollView).
 */
export const MergedTabs: React.FC<MergedTabsProps> = ({ columns }): JSX.Element => {
  return (
    <View style={styles.container}>
      {columns.map(column => (
        <View key={column.tab} style={styles.column} testID={`merged-column-${column.tab}`}>
          <View style={styles.columnTitle}>
            {getHeaderIcon(column.tab)}
            <ThemedText type="subtitle">{column.tab.toString()}</ThemedText>
          </View>
          {column.content}
        </View>
      ))}
    </View>
  );
};

/**
 * Largeur disponible pour le contenu d'une colonne
 * @param windowWidth largeur de la fenêtre
 * @param contentPadding padding horizontal du conteneur de page (de chaque côté)
 */
export function getMergedColumnWidth(windowWidth: number, contentPadding: number): number {
  return (windowWidth - 2 * contentPadding - MERGED_COLUMNS_GAP) / 2;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    gap: MERGED_COLUMNS_GAP,
  },
  column: {
    flex: 1,
    minWidth: 0,
    gap: 10,
  },
  columnTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
