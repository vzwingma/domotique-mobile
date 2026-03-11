import React from 'react';
import DomoticzDevice from '@/app/models/domoticzDevice.model';
import { DomoticzDeviceType } from '../enums/DomoticzEnum';
import { ViewLightDevice } from './lightDevice.component';
import { ViewBlindDevice } from './blindDevice.component';

// Re-export des styles partagés pour la rétro-compatibilité (utilisé par paramList, thermostat…)
export { stylesListsDevices } from './deviceRow.styles';

// Définition des propriétés d'un équipement Domoticz
export type DomoticzDeviceProps = {
  device: DomoticzDevice;
  enhancedUi?: boolean;
};

/**
 * Composant dispatcher : délègue à ViewLightDevice ou ViewBlindDevice selon le type.
 */
export const ViewDomoticzDevice: React.FC<DomoticzDeviceProps> = ({ device, enhancedUi = false }) => {
  if (device.type === DomoticzDeviceType.LUMIERE) {
    return <ViewLightDevice device={device} enhancedUi={enhancedUi} />;
  }
  if (device.type === DomoticzDeviceType.VOLET) {
    return <ViewBlindDevice device={device} enhancedUi={enhancedUi} />;
  }
  return null;
};

