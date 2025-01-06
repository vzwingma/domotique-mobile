
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DomoticzDevice from '../models/domoticzDevice.model';
import { ViewDomoticzDevice } from '../components/device.component';
import { getFavoritesFromStorage, sortFavorites as sortFavoritesDevices } from '../services/DataUtils.service';
import { useContext, useEffect, useState } from 'react';
import DomoticzFavorites from '../models/domoticzFavorites.model';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import React from 'react';



/**
 * Ecran d'accueil avec les équipements favoris
 *
 * Ce composant affiche une liste de volets récupérés depuis Domoticz.
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

      // Tri par nombre d'utilisation
      let sortedFavorites = favorites
        .filter((fav: DomoticzFavorites) => fav.nbOfUse !== undefined && fav.nbOfUse > 0)
        .sort((fava: DomoticzFavorites, favb: DomoticzFavorites) => favb.nbOfUse - fava.nbOfUse)

      sortedFavorites.forEach((fav: DomoticzFavorites) => {
        const favoriteIndex = devicesData.findIndex((device) => device.idx === fav.idx);
        if(favoriteIndex !== -1 && devicesData[favoriteIndex] !== undefined) {
          devicesData[favoriteIndex].data = ""+fav.nbOfUse;
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
 * @returns les devices favoris en jsx
 */
function getListFavoritesComponents(favoritesData: DomoticzDevice[]): JSX.Element[] {
  let items: JSX.Element[] = [];
  if (favoritesData === undefined) {
    return items;
  }
  else {
    favoritesData
    // On ne garde que les 8 premiers favoris actifs
      .filter((favDevice: DomoticzDevice) => favDevice.isActive)
      .slice(0, 6)
      // Et on les retrie suivant la mise en page
      .sort((favDeviceA: DomoticzDevice, favDeviceB: DomoticzDevice) => sortFavoritesDevices(favDeviceA, favDeviceB))
      .forEach((fav: DomoticzDevice) => {
        items.push(<ViewDomoticzDevice key={fav.idx} device={fav}/>);
      });
  }
  return items;
}
