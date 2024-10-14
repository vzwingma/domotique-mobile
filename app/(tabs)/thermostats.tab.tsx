/**
 * 
 * Ce fichier contient le code de l'écran des mesures de températures.
 */
import { useContext } from 'react';
import { DomoticzContext } from '../services/DomoticzContextProvider';


/**
 * Composant de l'écran des mesures de thermostats.
 * 
 * Ce composant affiche une liste de mesures de thermosats récupérées depuis Domoticz.
 * @param temperaturesData Les données des mesures de températures
 */
export default function TabDomoticzThermostats(): JSX.Element[] {

  const { domoticzTemperaturesData } = useContext(DomoticzContext)!;
  
  let items: JSX.Element[] = [];

  return items;
}
