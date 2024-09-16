
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DomoticzDevice from '../models/domoticzDevice.model';
import { ViewDomoticzDevice } from '../components/device.component';
import { getFavouritesFromStorage } from '../services/DataUtils.service';
import { useEffect, useState } from 'react';
import DomoticzFavorites from '../models/domoticzFavourites';


// Propriétés de l'écran des équipements
type TabDomoticzDevicessProps = {
  devicesData: DomoticzDevice[],
  storeDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>
}


/**
 * Ecran d'accueil avec les équipements favoris
 * 
 * Ce composant affiche une liste de volets récupérés depuis Domoticz.
 * @param devicesData Les données des équipements
 * @param storeDevicesData La fonction pour mettre à jour les données des volets
 */
export default function HomeScreen({ devicesData, storeDevicesData }: TabDomoticzDevicessProps) {


  const [favorites, setFavorites] = useState([] as DomoticzDevice[]);

  // Au chargement de l'écran, on charge les favoris
  useEffect(() => {
    getFavoritesDevicesFromCache(devicesData, setFavorites);
  }, [devicesData]);



  return (
    <>
      <ThemedView style={tabStyles.titleContainer}>
        <ThemedText type="subtitle" style={{ color: 'green', marginTop: 10 }}>
          Connecté à Domoticz
        </ThemedText>
      </ThemedView>
      {getListFavoritesComponents(favorites, storeDevicesData)}
    </>
  );

}


/**
 * Chargement des favoris depuis le cache
 * @param devicesData liste des devices
 * @param setFavorites fonction de mise à jour des favoris dans les états
 * @returns 
 */
function getFavoritesDevicesFromCache(devicesData: DomoticzDevice[], setFavorites: Function) {
  if (devicesData !== undefined) {

    let favoriteDevices: DomoticzDevice[] = [];

    getFavouritesFromStorage().then((favorites) => {

      let sortedFavorites = favorites.sort((a, b) => b.favorites - a.favorites);

      sortedFavorites.forEach((fav: DomoticzFavorites) => {
        const favoriteIndex = devicesData.findIndex((device) => device.idx === fav.idx);
        if (favoriteIndex !== -1 && favoriteDevices.length < 5) {
          favoriteDevices.push(devicesData[favoriteIndex]);
        }
      })

      setFavorites(favoriteDevices);
    });
  }
}


/**
 * liste des composants graphiques des devices favoris
 * @param favoritesData devices favoris
 * @param storeDevicesData fonction de mise à jour des devices
 * @returns les devices favoris en jsx
 */
function getListFavoritesComponents(favoritesData: DomoticzDevice[], storeDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>) {
  let items: JSX.Element[] = [];
  if (favoritesData === undefined || storeDevicesData === undefined) {
    return items;
  }
  else {
    favoritesData.forEach((fav: DomoticzDevice) => {
      items.push(<ViewDomoticzDevice key={fav.idx} device={fav} storeDeviceData={storeDevicesData} />);
    });
  }
  return items;
}


// Styles de l'écran des équipements
export const tabStyles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
  },
});
