/**
 * 
 * Ce fichier contient le code de l'écran des mesures de températures.
 */
import { ViewDomoticzTemperature } from '../components/temperature.component';
import { useContext } from 'react';
import { DomoticzContext } from '../services/DomoticzContextProvider';


/**
 * Composant de l'écran des mesures de températures.
 * 
 * Ce composant affiche une liste de mesures de températeures récupérées depuis Domoticz.
 * @param temperaturesData Les données des mesures de températures
 */
export default function TabDomoticzTemperatures(): JSX.Element[] {

  const { domoticzTemperaturesData } = useContext(DomoticzContext)!;

  let items: JSX.Element[] = [];
  domoticzTemperaturesData.forEach(item => {
    items.push(<ViewDomoticzTemperature key={item.idx} temperature={item} />);
  });
  return items;
}
