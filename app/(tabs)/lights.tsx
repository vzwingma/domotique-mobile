import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, StyleSheet } from 'react-native';
import { useState , useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import loadEquipements from '../controllers/lights.controller';
import DomoticzEquipement from '../models/domoticzEquipement.model';
import { DomoticzLight } from '@/components/equipements/domoticzLight';

/**
 * Ecran des lumières
 */
export default function TabDomoticzLumieres() {

  const [isLoaded, setIsLoaded] = useState(false);
  const [lightsData, setLightsData] = useState<DomoticzEquipement[]>([]); // State to store the response data



  // Lance la connexion à Domoticz pour récupérer les lumières
  useEffect(() => {
    loadEquipements(setIsLoaded, setLightsData);  
  }, [])


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="bulb" style={styles.headerImage} />}>

      {!isLoaded ? (
        <ThemedText>Chargement...</ThemedText>
      ) : (
        <>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">{ lightsData.length } lumières</ThemedText>
          </ThemedView>
          <FlatList data={lightsData} 
                    renderItem={({item}) => (<DomoticzLight lumiere={item}/>)} 
                    keyExtractor={(item, index) => index.toString()} />
        </>
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
