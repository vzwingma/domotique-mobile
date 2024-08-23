/**
 * 
 * Ce fichier contient le code de l'écran des volets.
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import { useState , useEffect, JSX } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { loadDomoticzDevices } from '@/app/controllers/devices.controller';
import { ViewDomoticzDevice } from '@/app/components/device.component'; 
import DomoticzDevice from '@/app/models/domoticzDevice.model'; // Importe le type domoticzDevice
import { DomoticzType } from '@/app/constants/DomoticzEnum';
import { tabStyles } from '.';

/**
 * Composant de l'écran des volets.
 * 
 * Ce composant affiche une liste de volets récupérés depuis Domoticz.
 */
export default function TabDomoticzVolets() {

  const [isLoaded, setIsLoaded] = useState(false);
  const [voletsData, storeVoletsData] = useState<DomoticzDevice[]>([]); // État pour stocker les données de réponse

  // Lance la connexion à Domoticz pour récupérer les volets
  useEffect(() => {
    loadDomoticzDevices(setIsLoaded, storeVoletsData, DomoticzType.BLIND);  
  }, [])


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="reorder-four" style={tabStyles.headerImage} />}>

      {!isLoaded ? (
        <ThemedText>Chargement...</ThemedText>
      ) : (
          (buildDeviceList(voletsData, storeVoletsData))
      )}
    </ParallaxScrollView>
  );
}

/**
 * Construit la liste des volets.
 * 
 * @param voletsData Les données des volets
 * @param storeVoletsData La fonction pour mettre à jour les données des volets
 */
function buildDeviceList(voletsData: DomoticzDevice[], storeVoletsData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
  let items: JSX.Element[] = [];
  voletsData.forEach((item, idx) => {
    item.rang = idx;
    items.push(<ViewDomoticzDevice key={item.idx} device={item} storeDeviceData={storeVoletsData}/>);          
  });
  return items;
}