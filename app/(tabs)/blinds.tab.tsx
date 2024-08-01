import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, StyleSheet } from 'react-native';
import { useState , useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { loadDomoticzEquipement as loadDomoticzDevices } from '../controllers/devices.controller';
import { DomoticzBlind } from '@/app/components/blind.component'; // Import the DomoticzEquipement type
import DomoticzEquipement from '@/app/models/domoticzEquipement.model'; // Import the DomoticzEquipement type
import { DomoticzType } from '../constants/DomoticzEnum';

/**
 * Ecran des volets
 */
export default function TabDomoticzVolets() {

  const [isLoaded, setIsLoaded] = useState(false);
  const [voletsData, storeVoletsData] = useState<DomoticzEquipement[]>([]); // State to store the response data

  // Lance la connexion à Domoticz pour récupérer les volets
  useEffect(() => {
    loadDomoticzDevices(setIsLoaded, storeVoletsData, DomoticzType.BLIND);  
  }, [])


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="storefront" style={styles.headerImage} />}>

      {!isLoaded ? (
        <ThemedText>Chargement...</ThemedText>
      ) : (
          <FlatList data={voletsData} 
                    renderItem={({item}) => (<DomoticzBlind volet={item} setVoletsData={storeVoletsData}/>)} 
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
