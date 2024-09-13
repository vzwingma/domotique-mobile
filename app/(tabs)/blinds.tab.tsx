import { ViewDomoticzDevice } from '@/app/components/device.component'; 
import DomoticzDevice from '@/app/models/domoticzDevice.model'; // Importe le type domoticzDevice
import { DomoticzType } from '../constants/DomoticzEnum';

/**
 * 
 * Ce fichier contient le code de l'écran des Volets
 */

/**
 * Propriétés de l'écran des Volets
 */
type TabDomoticzVoletsProps = {
  voletsData : DomoticzDevice[],
  storeDevicesData : React.Dispatch<React.SetStateAction<DomoticzDevice[]>>
}

/**
 * Composant de l'écran des volets.
 * 
 * Ce composant affiche une liste de volets récupérés depuis Domoticz.
 */
export default function TabDomoticzVolets({voletsData, storeDevicesData} : TabDomoticzVoletsProps) : JSX.Element[] {
  if(voletsData === undefined || storeDevicesData === undefined){
    return [];
  }
  return buildDeviceList(voletsData.filter(data => data.type === DomoticzType.VOLET), storeDevicesData);
}


/**
 * Construit la liste des volets.
 * 
 * @param voletsData Les données des volets
 * @param storeDevicesData La fonction pour mettre à jour les données des volets
 */
function buildDeviceList(voletsData: DomoticzDevice[], storeDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
  let items: JSX.Element[] = [];
  voletsData.forEach((item, idx) => {
    item.rang = idx;
    items.push(<ViewDomoticzDevice key={item.idx} device={item} storeDeviceData={storeDevicesData}/>);          
  });
  return items;
}