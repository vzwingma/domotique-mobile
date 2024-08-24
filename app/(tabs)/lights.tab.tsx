import { useState , useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
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

  const [isLoaded, setIsLoaded] = useState(false);
  const [lightsData, storeLumieresData] = useState<DomoticzDevice[]>([]); // State to store the response data

  // Lance la connexion à Domoticz pour récupérer les lumières
  useEffect(() => {
    loadDomoticzDevices(setIsLoaded, storeLumieresData, DomoticzType.LIGHT);  
  }, [])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: Colors.dark.titlebackground, dark: Colors.dark.titlebackground }}
      headerImage={<Ionicons size={310} name="bulb" style={tabStyles.headerImage} />}>

      {!isLoaded ? (
        <ActivityIndicator size={'large'} color={Colors.domoticz.text}/>
      ) : (
        buildDeviceList(lightsData, storeLumieresData)
      )}
    </ParallaxScrollView>
  );
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