import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, StyleSheet } from 'react-native';
import { useState , useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { loadDomoticzDevices } from '../controllers/devices.controller';
import DomoticzEquipement from '../models/domoticzDevice.model';
import { DomoticzType } from '../constants/DomoticzEnum';
import { DomoticzDevice } from '@/app/components/device.component'; 
/**
 * Ecran des lumières
 */
export default function TabDomoticzLumieres() {

  const [isLoaded, setIsLoaded] = useState(false);
  const [lightsData, storeLumieretsData] = useState<DomoticzEquipement[]>([]); // State to store the response data



  // Lance la connexion à Domoticz pour récupérer les lumières
  useEffect(() => {
    loadDomoticzDevices(setIsLoaded, storeLumieretsData, DomoticzType.LIGHT);  
  }, [])


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="bulb" style={styles.headerImage} />}>

      {!isLoaded ? (
        <ThemedText>Chargement...</ThemedText>
      ) : (
          <FlatList data={lightsData} 
                    renderItem={({item}) => (<DomoticzDevice device={item} storeDeviceData={storeLumieretsData}/>)}
                    keyExtractor={(item, index) => index.toString()} />
      )}
    </ParallaxScrollView>
  );
}




const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
