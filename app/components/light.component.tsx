import DomoticzEquipement from "@/app/models/domoticzDevice.model";
import { DomoticzDevice } from "./_device.component";

// Définition des propriétés d'une lumière Domoticz
type DomoticzLightProps = {
    lumiere: DomoticzEquipement;
    storeLumieretsData: React.Dispatch<React.SetStateAction<DomoticzEquipement[]>>;
  };


/**
 * Composant pour afficher une lumière Domoticz.
 */
export const DomoticzLight: React.FC<DomoticzLightProps> = ({ lumiere, storeLumieretsData: storeLumieretsData }) => {
  return (
    <DomoticzDevice device={lumiere} storeDeviceData={storeLumieretsData}/>
  );
};