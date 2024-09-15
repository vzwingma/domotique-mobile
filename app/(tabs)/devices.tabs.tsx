import { ViewDomoticzDevice } from '@/app/components/device.component';
import DomoticzDevice from '@/app/models/domoticzDevice.model'; // Importe le type domoticzDevice

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
 * @param devicesData Les données des équipements
 * @param storeDevicesData La fonction pour mettre à jour les données des volets
 */
export default function TabDomoticzDevices({ devicesData, storeDevicesData }: TabDomoticzDevicessProps): JSX.Element[] {

  if (devicesData === undefined || storeDevicesData === undefined) {
    return [];
  }

  let items: JSX.Element[] = [];
  devicesData.forEach((item, idx) => {
    item.rang = idx;
    items.push(<ViewDomoticzDevice key={item.idx} device={item} storeDeviceData={storeDevicesData} />);
  });
  return items;

}