import DomoticzEquipement from "@/app/models/domoticzDevice.model";
import { DomoticzDevice } from "./_device.component";


// Définition des propriétés d'un volet Domoticz
type DomoticzBlindProps = {
    volet: DomoticzEquipement;
    storeVoletsData: React.Dispatch<React.SetStateAction<DomoticzEquipement[]>>;
  };


/**
 * Composant pour afficher un volet Domoticz.
 */
export const DomoticzBlind: React.FC<DomoticzBlindProps> = ({ volet, storeVoletsData: storeVoletsData }) => {
    return (
      <DomoticzDevice device={volet} storeDeviceData={storeVoletsData}/>
    );
  };