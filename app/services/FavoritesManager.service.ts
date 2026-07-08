/**
 * Service de Gestion des Favoris Domoticz
 * 
 * Centralise toute la logique de stockage et gestion des favoris dans AsyncStorage.
 * Responsabilités :
 * - Récupération des favoris depuis le storage persistant
 * - Sauvegarde des favoris
 * - Basculement du statut favori d'un équipement
 * - Nettoyage des favoris
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import DomoticzFavorites from '../models/domoticzFavorites.model';
import { DomoticzDeviceType } from '../enums/DomoticzEnum';
import { Logger } from './Logger.service';

/**
 * Clés de stockage AsyncStorage
 */
export enum KEY_STORAGE {
  FAVORITES = "domoticzBoard"
}

/**
 * Récupère la liste des favoris depuis le storage persistant
 * 
 * @returns Promise<DomoticzFavorites[]> Liste des favoris (tableau vide si aucun)
 * @throws Si AsyncStorage échoue
 */
export const getFavoritesFromStorage = (): Promise<DomoticzFavorites[]> => {
  return AsyncStorage.getItem(KEY_STORAGE.FAVORITES).then((value) => {
    try {
      return value ? JSON.parse(value) : [];
    } catch (error) {
      Logger.error('[FavoritesManager] Erreur parsing favoris depuis storage', error);
      return [];
    }
  });
};

/**
 * Sauvegarde la liste des favoris dans le storage persistant
 * 
 * @param favorites Tableau des favoris à sauvegarder
 * @returns Promise<void>
 * @throws Si AsyncStorage échoue
 */
export const saveFavoritesToStorage = (favorites: DomoticzFavorites[]): Promise<void> => {
  return AsyncStorage.setItem(KEY_STORAGE.FAVORITES, JSON.stringify(favorites));
};

/**
 * Bascule le statut "favori" d'un équipement
 * - Si l'équipement est dans les favoris, le supprime
 * - Si l'équipement n'est pas dans les favoris, l'ajoute
 * 
 * @param favoriteId Identifiant unique du favori (ex: "device_42" ou "temp_50")
 * @param isFavorite État courant (true = est favori, false = n'est pas favori)
 * @returns Promise<DomoticzFavorites[]> Nouvelle liste des favoris
 * @throws Si AsyncStorage échoue
 */
export const toggleFavorite = async (favoriteId: string, isFavorite: boolean): Promise<DomoticzFavorites[]> => {
  const favorites = await getFavoritesFromStorage();
  
  const normalizedIdx = Number(favoriteId);
  let newFavorites: DomoticzFavorites[];
  if (isFavorite) {
    newFavorites = favorites.filter((fav) => String(fav.idx) !== favoriteId);
  } else if (Number.isNaN(normalizedIdx)) {
    newFavorites = favorites;
  } else {
    newFavorites = [
      ...favorites,
      new DomoticzFavorites({
        idx: normalizedIdx,
        nbOfUse: 1,
        name: favoriteId,
        type: favorites[0]?.type ?? DomoticzDeviceType.UNKNOWN,
        subType: '',
      }),
    ];
  }

  await saveFavoritesToStorage(newFavorites);
  return newFavorites;
};

/**
 * Remise à zéro complète de la liste des favoris
 * Supprime tous les favoris du storage
 * 
 * @returns Promise<void>
 * @throws Si AsyncStorage échoue
 */
export const clearFavoritesFromStorage = (): Promise<void> => {
  return AsyncStorage.removeItem(KEY_STORAGE.FAVORITES);
};

/**
 * Supprime une valeur du storage par clé
 * Fonction générique pour support futur
 * 
 * @param key Clé de stockage à supprimer
 * @returns Promise<void>
 * @throws Si AsyncStorage échoue
 */
export const removeValueFromStorage = (key: KEY_STORAGE): Promise<void> => {
  return AsyncStorage.removeItem(key);
};
