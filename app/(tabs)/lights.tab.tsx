import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, StyleSheet } from 'react-native';
import { useState , useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { loadDomoticzLights } from '../controllers/lights.controller';
import DomoticzEquipement from '../models/domoticzEquipement.model';
import { DomoticzLight } from '@/app/components/light.component';

/**
 * Ecran des lumières
 */
export default function TabDomoticzLumieres() {

  const [isLoaded, setIsLoaded] = useState(false);
  const [lightsData, setLightsData] = useState<DomoticzEquipement[]>([]); // State to store the response data



  // Lance la connexion à Domoticz pour récupérer les lumières
  useEffect(() => {
    loadDomoticzLights(setIsLoaded, setLightsData);  
  }, [])


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="bulb" style={styles.headerImage} />}>

      {!isLoaded ? (
        <ThemedText>Chargement...</ThemedText>
      ) : (
          <FlatList data={lightsData} 
                    renderItem={({item}) => (<DomoticzLight lumiere={item}/>)} 
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
