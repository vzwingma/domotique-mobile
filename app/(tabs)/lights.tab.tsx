import { ViewDomoticzDevice } from '@/app/components/device.component'; 
import DomoticzDevice from '../models/domoticzDevice.model';
import { DomoticzType } from '../constants/DomoticzEnum';

/**
 * 
 * Ce fichier contient le code de l'écran des lumières.
 */

/**
 * Propriétés de l'écran des lumières
 */
type TabDomoticzLumieresProps = {
  lightsData : DomoticzDevice[] | undefined,
  storeDevicesData : React.Dispatch<React.SetStateAction<DomoticzDevice[]>>
}

/**
 * Ecran des lumières
 * @param lightsData Les données des lumières
 * @param storeDevicesData La fonction pour mettre à jour les données des équipements
 */
export default function TabDomoticzLumieres({lightsData, storeDevicesData} : TabDomoticzLumieresProps) : JSX.Element[] {
  if(lightsData === undefined || storeDevicesData === undefined){
    return [];
  }
  return buildDeviceList(lightsData.filter(data => data.type === DomoticzType.LUMIERE), storeDevicesData);
}

/**
 * Construit la liste des lumières.
 * 
 * @param voletsData Les données des lumières
 * @param storeVoletsData La fonction pour mettre à jour les données des lumières
 */
function buildDeviceList(lightsData: DomoticzDevice[], storeDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
  let items: JSX.Element[] = [];
  lightsData.forEach((item, idx) => {
    item.rang = idx;
    items.push(<ViewDomoticzDevice key={item.idx} device={item} storeDeviceData={storeDevicesData}/>);          
  });
  return items;
}