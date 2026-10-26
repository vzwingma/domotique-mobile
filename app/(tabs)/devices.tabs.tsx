import { ViewDomoticzDevice } from '@/app/components/device.component';
import { DomoticzDeviceType } from '../enums/DomoticzEnum';
import { JSX, useContext } from 'react';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { StyleSheet, View } from 'react-native';
import { useResponsiveColumns, getGridCellStyle } from '@/hooks/useResponsiveColumns';

/**
 *
 * Ce fichier contient le code de l'écran des équipements (Volets ou Lumières).
 */

// Écartement (horizontal + vertical) entre cellules de la grille, cohérent avec le reste de l'app (cf. `ParallaxScrollView` `styles.content`).
const GRID_GAP = 10;

// Propriétés de l'écran des équipements
type TabDomoticzDevicessProps = {
  dataType: DomoticzDeviceType,
  // Largeur disponible (dp) si l'écran n'occupe pas toute la fenêtre (colonne du layout fusionné tablette)
  availableWidth?: number,
}

/**
 * Composant de l'écran des volets.
 *
 * Ce composant affiche une grille de volets récupérés depuis Domoticz, avec un nombre
 * de colonnes adapté à la largeur d'écran (`useResponsiveColumns` — 1/2/3 colonnes).
 * @param availableWidth Largeur disponible (colonne du layout fusionné tablette), défaut : largeur fenêtre
 * @param devicesData Les données des équipements
 * @param storeDevicesData La fonction pour mettre à jour les données des volets
 */
export default function TabDomoticzDevices({ dataType, availableWidth }: Readonly<TabDomoticzDevicessProps>): JSX.Element {

  const { domoticzDevicesData } = useContext(DomoticzContext)!;
  const { columns } = useResponsiveColumns(availableWidth);

  if (dataType === undefined) {
    return <View style={styles.grid} />;
  }

  // Compensation du gap (padding cellule + marge négative du conteneur, cf. `getGridCellStyle`)
  // évite tout dépassement de largeur du conteneur parent.
  const cellStyle = getGridCellStyle(GRID_GAP, columns);

  let items: JSX.Element[] = [];

  domoticzDevicesData
      .filter(data => data.type === dataType)
      .forEach((item, idx) => {
        item.rang = idx;
        items.push(
          <View key={item.idx} style={cellStyle}>
            <ViewDomoticzDevice device={item} />
          </View>
        );
      });

  return <View style={styles.grid}>{items}</View>;

}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -(GRID_GAP / 2),
  },
});
