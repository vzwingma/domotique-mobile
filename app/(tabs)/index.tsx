
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DomoticzDevice from '../models/domoticzDevice.model';
import { ViewDomoticzDevice } from '../components/device.component';
import { getFavoritesFromStorage, sortFavorites } from '../services/DataUtils.service';
import { useContext, useEffect, useState } from 'react';
import DomoticzFavorites from '../models/domoticzFavorites.model';
import { DomoticzContext } from '../services/DomoticzContextProvider';



/**
 * Ecran d'accueil avec les équipements favoris
 * 
 * Ce composant affiche une liste de volets récupérés depuis Domoticz.
 * @param devicesData Les données des équipements
 * @param storeDevicesData La fonction pour mettre à jour les données des volets
 */
export default function HomeScreen() {


  const [favorites, setFavorites] = useState([] as DomoticzDevice[]);
  const { domoticzDevicesData } = useContext(DomoticzContext)!;

  
  // Au chargement de l'écran, on charge les favoris
  useEffect(() => {
    getFavoritesDevicesFromCache(domoticzDevicesData, setFavorites);
  }, [domoticzDevicesData]);



  return (
    <>
      <ThemedView style={tabStyles.titleContainer}>
        <ThemedText type="subtitle" style={{ color: 'white', marginTop: 5 }}>
          Favoris
        </ThemedText>
      </ThemedView>
      {getListFavoritesComponents(favorites)}
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

    getFavoritesFromStorage().then((favorites) => {
      // Tri par nombre d'utilisation, et on garde les 6 premiers
      let sortedFavorites = favorites
        .filter((fav: DomoticzFavorites) => fav.nbOfUse !== undefined && fav.nbOfUse > 0)
        .sort((fava: DomoticzFavorites, favb: DomoticzFavorites) => favb.nbOfUse - fava.nbOfUse)
        .sort((fava: DomoticzFavorites, favb: DomoticzFavorites) => sortFavorites(fava, favb));

      sortedFavorites.forEach((fav: DomoticzFavorites) => {
        const favoriteIndex = devicesData.findIndex((device) => device.idx === fav.idx);
        if(favoriteIndex !== -1 && devicesData[favoriteIndex] !== undefined) {
          devicesData[favoriteIndex].rang = fav.nbOfUse;
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
function getListFavoritesComponents(favoritesData: DomoticzDevice[]): JSX.Element[] {
  let items: JSX.Element[] = [];
  if (favoritesData === undefined) {
    return items;
  }
  else {
    favoritesData
      .filter((favDevice: DomoticzDevice) => favDevice.isActive)
      .slice(0, 6)
      .forEach((fav: DomoticzDevice) => {
        items.push(<ViewDomoticzDevice key={fav.idx} device={fav}/>);
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
