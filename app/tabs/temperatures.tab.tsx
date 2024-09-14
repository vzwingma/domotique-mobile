/**
 * 
 * Ce fichier contient le code de l'écran des mesures de températures.
 */
import DomoticzTemperature from '@/app/models/domoticzTemperature.model'; // Importe le type domoticzDevice
import { ViewDomoticzTemperature } from '../components/temperature.component';


// Propriétés de l'écran des équipements
type TabDomoticzTemperaturesProps = {
  temperaturesData: DomoticzTemperature[],
  // storeTemperaturesData: React.Dispatch<React.SetStateAction<DomoticzTemperature[]>>
}
/**
 * Composant de l'écran des mesures de températures.
 * 
 * Ce composant affiche une liste de mesures de températeures récupérées depuis Domoticz.
 */
export default function TabDomoticzTemperatures({ temperaturesData }: TabDomoticzTemperaturesProps): JSX.Element[] {
  return buildDeviceList(temperaturesData);
}


/**
 * Construit la liste des mesures de températures.
 * 
 * @param voletsData Les données des mesures de températures
 */
function buildDeviceList(temperaturesData: DomoticzTemperature[]) {
  let items: JSX.Element[] = [];
  temperaturesData.forEach(item => {
    items.push(<ViewDomoticzTemperature key={item.idx} temperature={item}/>);          
  });
  return items;
}
