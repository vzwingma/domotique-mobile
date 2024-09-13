import { useState , useEffect } from 'react';
import { loadDomoticzDevices } from '../controllers/devices.controller';
import { DomoticzType } from '../constants/DomoticzEnum';
import { ViewDomoticzDevice } from '@/app/components/device.component'; 
import DomoticzDevice from '../models/domoticzDevice.model';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Ionicons } from '@expo/vector-icons';
import { tabStyles } from '.';
import { Colors } from '../constants/Colors';
import { ActivityIndicator } from 'react-native';
/**
 * Ecran des lumières
 */
export default function TabDomoticzLumieres() {

  const [isLoading, setIsLoading] = useState(false);
  const [lightsData, storeLumieresData] = useState<DomoticzDevice[]>([]); // State to store the response data
  const [refreshing, setRefreshing] = useState(false);

  // Lance la connexion à Domoticz pour récupérer les lumières
  useEffect(() => {
    loadDomoticzDevices(setIsLoading, storeLumieresData, DomoticzType.LIGHT);  
  }, [refreshing])

  return (buildDeviceList(lightsData, storeLumieresData));
}

/**
 * Construit la liste des lumières.
 * 
 * @param voletsData Les données des lumières
 * @param storeVoletsData La fonction pour mettre à jour les données des lumières
 */
function buildDeviceList(voletsData: DomoticzDevice[], storeLumieresData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
  let items: JSX.Element[] = [];
  voletsData.forEach((item, idx) => {
    item.rang = idx;
    items.push(<ViewDomoticzDevice key={item.idx} device={item} storeDeviceData={storeLumieresData}/>);          
  });
  return items;
}