
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DomoticzDevice from '../models/domoticzDevice.model';
import { ViewDomoticzDevice } from '../components/device.component';
import { getFavoritesFromStorage, sortFavorites } from '../services/DataUtils.service';
import { useEffect, useState } from 'react';
import DomoticzFavorites from '../models/domoticzFavorites';


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
export default function HomeScreen({ devicesData, storeDevicesData }: Readonly<TabDomoticzDevicessProps>) {


  const [favorites, setFavorites] = useState([] as DomoticzDevice[]);

  // Au chargement de l'écran, on charge les favoris
  useEffect(() => {
    getFavoritesDevicesFromCache(devicesData, setFavorites);
  }, [devicesData]);



  return (
    <>
      <ThemedView style={tabStyles.titleContainer}>
        <ThemedText type="subtitle" style={{ color: 'white', marginTop: 10 }}>
          Favoris
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

    getFavoritesFromStorage().then((favorites) => {
      console.log("Favoris récupérés : ", favorites);
      // Tri par nombre d'utilisation, et on garde les 5 premiers
      let sortedFavorites = favorites
        .filter((fav: DomoticzFavorites) => fav.nbOfUse !== undefined && fav.nbOfUse > 0)
        .sort((fava: DomoticzFavorites, favb: DomoticzFavorites) => favb.nbOfUse - fava.nbOfUse)
        .slice(0, 5)
        .sort((fava: DomoticzFavorites, favb: DomoticzFavorites) => sortFavorites(fava, favb))
;

      sortedFavorites.forEach((fav: DomoticzFavorites) => {
        const favoriteIndex = devicesData.findIndex((device) => device.idx === fav.idx);
        devicesData[favoriteIndex].rang = fav.nbOfUse;
        favoriteDevices.push(devicesData[favoriteIndex]);
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
