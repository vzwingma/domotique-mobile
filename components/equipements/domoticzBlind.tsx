import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";

// Définition des propriétés d'un volet Domoticz
type DomoticzBlindProps = {
    volet: DomoticzEquipement;
  };

/**
 * Composant pour afficher un volet Domoticz.
 */
export const DomoticzBlind: React.FC<DomoticzBlindProps> = ({ volet }) => {
    return (
      <ThemedView>
        <ThemedText>{volet.Name}</ThemedText>
        {/* Ajoutez d'autres propriétés de volet ici */}
      </ThemedView>
    );
  };