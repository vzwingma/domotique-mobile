import React from 'react';
import DomoticzDevice from '../models/domoticzDevice.model';
import { DomoticzDeviceType } from '../enums/DomoticzEnum';
import { FavoriteLightCard } from './favoriteLightCard.component';
import { FavoriteBlindCard } from './favoriteBlindCard.component';

type FavoriteQuickActionCardProps = {
  device: DomoticzDevice;
};

/**
 * Carte favori orientée "action rapide" (1 tap).
 * Dispatcher vers FavoriteLightCard ou FavoriteBlindCard selon le type d'équipement.
 */
export const FavoriteQuickActionCard: React.FC<FavoriteQuickActionCardProps> = ({ device }) => {
  if (device.type === DomoticzDeviceType.VOLET) {
    return <FavoriteBlindCard device={device} />;
  }
  return <FavoriteLightCard device={device} />;
};
