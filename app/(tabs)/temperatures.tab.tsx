/**
 *
 * Ce fichier contient le code de l'écran des mesures de températures.
 */
import { ViewDomoticzTemperature } from '../components/temperature.component';
import { JSX, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { ViewDomoticzThermostat } from '../components/thermostat.component';
import { useResponsiveColumns, getGridCellStyle } from '@/hooks/useResponsiveColumns';

const GRID_GAP = 10;

/** Taille du cadran Thermostat : 180 en compact (défaut du composant), 240 en medium/expanded */
const DIAL_SIZE_COMPACT = 180;
const DIAL_SIZE_LARGE = 240;

/**
 * Composant de l'écran des mesures de températures.
 *
 * Ce composant affiche la zone Thermostat(s) (pleine largeur, hors grille) puis
 * une grille responsive des mesures de températures récupérées depuis Domoticz.
 * Nombre de colonnes de la grille piloté par `useResponsiveColumns()` (1 en compact,
 * 2 en medium, 3 en expanded). Le cadran Thermostat s'agrandit également aux
 * breakpoints medium/expanded (dialSize 240 contre 180 en compact).
 */
export default function TabDomoticzTemperatures(): JSX.Element {

  const { domoticzTemperaturesData, domoticzThermostatData } = useContext(DomoticzContext)!;
  const { columns, breakpoint } = useResponsiveColumns();
  const dialSize = breakpoint === 'compact' ? DIAL_SIZE_COMPACT : DIAL_SIZE_LARGE;

  const thermostatItems: JSX.Element[] = domoticzThermostatData.map(item => (
    <ViewDomoticzThermostat key={item.idx} thermostat={item} dialSize={dialSize} />
  ));

  const cellStyle = getGridCellStyle(GRID_GAP, columns);

  const temperatureItems: JSX.Element[] = domoticzTemperaturesData.map(item => (
    <View key={item.idx} style={cellStyle}>
      <ViewDomoticzTemperature temperature={item} />
    </View>
  ));

  return (
    <View style={temperaturesStyles.container}>
      {thermostatItems.length > 0 && (
        <View style={temperaturesStyles.thermostatZone}>
          {thermostatItems}
        </View>
      )}
      <View style={temperaturesStyles.temperaturesGrid}>
        {temperatureItems}
      </View>
    </View>
  );
}

const temperaturesStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  thermostatZone: {
    width: '100%',
  },
  temperaturesGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -(GRID_GAP / 2),
  },
});
