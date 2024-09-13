import { ViewDomoticzDevice } from '@/app/components/device.component';
import DomoticzDevice from '@/app/models/domoticzDevice.model'; // Importe le type domoticzDevice
import { useEffect } from 'react';
import { loadDomoticzDevices } from '../controllers/devices.controller';

/**
 * 
 * Ce fichier contient le code de l'écran des équipements (Volets ou Lumières).
 */

// Propriétés de l'écran des équipements
type TabDomoticzDevicessProps = {
  devicesData: DomoticzDevice[],
  storeDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>
}

/**
 * Composant de l'écran des volets.
 * 
 * Ce composant affiche une liste de volets récupérés depuis Domoticz.
 */
export default function TabDomoticzDevices({ devicesData, storeDevicesData }: TabDomoticzDevicessProps): JSX.Element[] {

  if (devicesData === undefined || storeDevicesData === undefined) {
    return [];
  }
  return buildDeviceList(devicesData, storeDevicesData);
}


/**
 * Construit la liste des équipements
 * 
 * @param devicesData Les données des équipements
 * @param storeDevicesData La fonction pour mettre à jour les données des volets
 */
function buildDeviceList(devicesData: DomoticzDevice[], storeDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
  let items: JSX.Element[] = [];
  devicesData.forEach((item, idx) => {
    item.rang = idx;
    items.push(<ViewDomoticzDevice key={item.idx} device={item} storeDeviceData={storeDevicesData} />);
  });
  return items;
}