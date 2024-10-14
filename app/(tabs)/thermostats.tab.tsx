/**
 * 
 * Ce fichier contient le code de l'écran des mesures de températures.
 */
import { useContext } from 'react';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { ViewDomoticzThermostat } from '../components/thermostat.component';


/**
 * Composant de l'écran des mesures de thermostats.
 * 
 * Ce composant affiche une liste de mesures de thermosats récupérées depuis Domoticz.
 * @param temperaturesData Les données des mesures de températures
 */
export default function TabDomoticzThermostats(): JSX.Element[] {

  const { domoticzThermostatData } = useContext(DomoticzContext)!;

  let items: JSX.Element[] = [];

  domoticzThermostatData.forEach((item, idx) => {
    items.push(<ViewDomoticzThermostat key={item.idx} device={item} />);
  });

  return items;
}