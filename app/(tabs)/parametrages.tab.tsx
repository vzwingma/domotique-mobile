/**
 * 
 * Ce fichier contient le code de l'écran des mesures de températures.
 */
import { JSX, useContext } from 'react';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { ViewDomoticzParamList } from '../components/paramList.component';


/**
 * Composant de l'écran des paramètres
 * 
 */
export default function TabDomoticzParametres(): JSX.Element[] {

  const { domoticzParametersData } = useContext(DomoticzContext)!;

  let items: JSX.Element[] = [];

  domoticzParametersData
      .forEach((item) => {
        items.push(<ViewDomoticzParamList key={item.idx} parametre={item} />);
      });

  return items;

}