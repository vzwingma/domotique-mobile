/**
 * 
 * Ce fichier contient le code de l'écran des mesures de températures.
 */

import { useState , useEffect } from 'react';

import DomoticzTemperature from '@/app/models/domoticzTemperature.model'; // Importe le type domoticzDevice
import { loadDomoticzDevices as loadDomoticzTemperatures } from '../controllers/temperatures.controller';
import { ViewDomoticzTemperature } from '../components/temperature.component';

/**
 * Composant de l'écran des mesures de températures.
 * 
 * Ce composant affiche une liste de mesures de températeures récupérées depuis Domoticz.
 */
export default function TabDomoticzTemperatures() {

  const [isLoading, setIsLoading] = useState(false);
  const [temperaturesData, storeTemperaturesData] = useState<DomoticzTemperature[]>([]); // État pour stocker les données de réponse
  const [refreshing, setRefreshing] = useState(false);
  // Lance la connexion à Domoticz pour récupérer les volets
  useEffect(() => {
    loadDomoticzTemperatures(setIsLoading, storeTemperaturesData);
  }, [refreshing])


  return (buildDeviceList(temperaturesData));
}


/**
 * Construit la liste des mesures de températures.
 * 
 * @param voletsData Les données des mesures de températures
 */
function buildDeviceList(voletsData: DomoticzTemperature[]) {
  let items: JSX.Element[] = [];
  voletsData.forEach(item => {
    items.push(<ViewDomoticzTemperature key={item.idx} temperature={item}/>);          
  });
  return items;
}
