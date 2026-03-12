
import DomoticzDevice from '../models/domoticzDevice.model';
import { getFavoritesFromStorage, sortFavorites as sortFavoritesDevices } from '../services/DataUtils.service';
import React, { JSX, useContext, useEffect, useState } from 'react';
import DomoticzFavorites from '../models/domoticzFavorites.model';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { FavoriteQuickActionCard } from '../components/favoriteQuickActionCard.component';
import { ThemedText } from '@/components/ThemedText';
import { View } from 'react-native';

// Règle métier explicite Favoris (F01-01) : l'écran rapide n'affiche jamais plus de 7 éléments.
const FAVORITES_MAX_QUICK_ACTIONS = 7;

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
    <>{getListFavoritesComponents(favorites)}</>
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
    const activeFavorites = favoritesData.filter((favDevice: DomoticzDevice) => favDevice.isActive);
    const hasMoreFavoritesThanVisibleLimit = activeFavorites.length > FAVORITES_MAX_QUICK_ACTIONS;
    const visibleFavorites = activeFavorites
      .slice(0, FAVORITES_MAX_QUICK_ACTIONS)
      // Et on les retrie suivant la mise en page
      .sort((favDeviceA: DomoticzDevice, favDeviceB: DomoticzDevice) => sortFavoritesDevices(favDeviceA, favDeviceB));

    visibleFavorites.forEach((fav: DomoticzDevice) => {
      items.push(<FavoriteQuickActionCard key={fav.idx} device={fav} />);
    });

    if (hasMoreFavoritesThanVisibleLimit) {
      items.push(
        <View key="favorites-limit-info" style={{ width: '100%', paddingVertical: 4 }}>
          <ThemedText style={{ textAlign: 'center', fontSize: 12, color: '#9BA1A6' }}>
            Seuls les {FAVORITES_MAX_QUICK_ACTIONS} favoris les plus utilisés sont affichés.
          </ThemedText>
        </View>
      );
    }
  }
  return items;
}
