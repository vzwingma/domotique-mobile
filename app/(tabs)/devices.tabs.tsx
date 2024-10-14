import { ViewDomoticzDevice } from '@/app/components/device.component';
import DomoticzDevice from '@/app/models/domoticzDevice.model'; // Importe le type domoticzDevice
import { DomoticzType } from '../enums/DomoticzEnum';
import { useContext } from 'react';
import { DomoticzContext } from '../services/DomoticzContextProvider';

/**
 * 
 * Ce fichier contient le code de l'écran des équipements (Volets ou Lumières).
 */

// Propriétés de l'écran des équipements
type TabDomoticzDevicessProps = {
  dataType: DomoticzType,
}

/**
 * Composant de l'écran des volets.
 * 
 * Ce composant affiche une liste de volets récupérés depuis Domoticz.
 * @param devicesData Les données des équipements
 * @param storeDevicesData La fonction pour mettre à jour les données des volets
 */
export default function TabDomoticzDevices({ dataType }: TabDomoticzDevicessProps): JSX.Element[] {

  const { domoticzDevicesData } = useContext(DomoticzContext)!;

  if (dataType === undefined) {
    return [];
  }

  let items: JSX.Element[] = [];

  domoticzDevicesData
      .filter(data => data.type === dataType)
      .forEach((item, idx) => {
        item.rang = idx;
        items.push(<ViewDomoticzDevice key={item.idx} device={item} />);
      });
      
  return items;

}