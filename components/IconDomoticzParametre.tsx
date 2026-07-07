import DomoticzParameter from "@/app/models/domoticzParameter.model";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { DomoticzPhasePrefix } from "@/app/enums/DomoticzEnum";
import { normalizeDomoticzText } from "@/app/services/DataUtils.service";

type ParametreIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Composant qui affiche une icône en fonction du type de paramètre Domoticz.
 *  >Icone : https://oblador.github.io/react-native-vector-icons/ 
 */

const IconDomoticzParametre = MaterialCommunityIcons;

export function getIconDomoticzParametre(parametre: DomoticzParameter): ParametreIconName {

    switch (parametre.name.toLowerCase()) {
        case "mode":
            return getIconMode(parametre.level);
        case "présence":
            return getIconPresence(parametre.level);
        case "phase":
            return getIconPhase(parametre.status);
        default:
            return "lightbulb-outline";
    }
}

// Fonction qui retourne une icône en fonction du mode
function getIconMode(level:number): ParametreIconName {
        if(level === 0){
        return "airplane"; // Vacances
    } else if(level === 10){
        return "home-outline"; // Normal
    } else {
        return "glass-wine"; // Ete
  
    }
}

// Fonction qui retourne une icône en fonction du mode
function getIconPresence(level:number): ParametreIconName {
        if(level === 0){ // ABSENT
        return "account-search-outline";
    } else if(level === 10){ // PRESENT
        return "account-group-outline";
    } 
    return "account-search-outline";
}
// Fonction qui retourne une icône en fonction du mode
function getIconPhase(status:string): ParametreIconName {
    const normalized = normalizeDomoticzText(status);
    if (normalized.startsWith(DomoticzPhasePrefix.PREPARATION_CHAUFFAGE)) return "calendar-today";
    if (normalized.startsWith(DomoticzPhasePrefix.REVEIL)) return "alarm";
    if (normalized.startsWith(DomoticzPhasePrefix.JOURNEE)) return "weather-sunny";
    if (normalized.startsWith(DomoticzPhasePrefix.SOIREE)) return "weather-partly-cloudy";
    if (normalized.startsWith(DomoticzPhasePrefix.NUIT)) return "moon-waning-crescent";
    return "alert-circle-outline";
}
export default IconDomoticzParametre;
