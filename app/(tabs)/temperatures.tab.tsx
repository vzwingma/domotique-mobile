/**
 * 
 * Ce fichier contient le code de l'écran des mesures de températures.
 */
import { ViewDomoticzTemperature } from '../components/temperature.component';
import { JSX, useContext } from 'react';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { ViewDomoticzThermostat } from '../components/thermostat.component';
import { View } from 'react-native';


/**
 * Composant de l'écran des mesures de températures.
 * 
 * Ce composant affiche une liste de mesures de températeures récupérées depuis Domoticz.
 * @param temperaturesData Les données des mesures de températures
 */
export default function TabDomoticzTemperatures(): JSX.Element[] {

  const { domoticzTemperaturesData, domoticzThermostatData } = useContext(DomoticzContext)!;

  let items: JSX.Element[] = [];
  domoticzThermostatData.forEach((item) => {
      items.push(<ViewDomoticzThermostat key={item.idx} thermostat={item} />);
    });
    
  items.push(<View key="separator" style={{ height: 1, backgroundColor: 'red', marginVertical: 10 }} />);

  domoticzTemperaturesData.forEach(item => {
    items.push(<ViewDomoticzTemperature key={item.idx} temperature={item} />);
  });
    

  
  return items;
}
