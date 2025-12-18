import DomoticzParameter from "@/app/models/domoticzParameter.model";
import { Ionicons } from "@expo/vector-icons";

/**
 * Composant qui affiche une icône en fonction du type de paramètre Domoticz.
 *  >Icone : https://oblador.github.io/react-native-vector-icons/ 
 */

class IconDomoticzParametre extends Ionicons { }

export function getIconDomoticzParametre( parametre : DomoticzParameter) : any {

    switch (parametre.name.toLowerCase()) {
        case "mode":
            return getIconMode(parametre.level);
        case "présence":
            return getIconPresence(parametre.level);
        case "phase":
            return getIconPhase(parametre.status.toLowerCase());
        default:
            return "bulb-outline";
    }
}

// Fonction qui retourne une icône en fonction du mode
function getIconMode(level:number) {
        if(level === 0){
        return "airplane-outline"; // Vacances
    } else if(level === 10){
        return "home-outline"; // Normal
    } else {
        return "wine-sharp"; // Ete
  
    }
}

// Fonction qui retourne une icône en fonction du mode
function getIconPresence(level:number) {
        if(level === 0){ // ABSENT
        return "scan-circle-outline";
    } else if(level === 10){ // PRESENT
        return "people-circle-outline";
    } 
}
// Fonction qui retourne une icône en fonction du mode
function getIconPhase(status:string) {
    
    switch (status) {
        case "preparation chauffage":
            return "today-outline";;
        case "réveil":
        case "reveil":
            return "alarm-outline";;
        case "journee":
            return "sunny-outline";;
        case "soiree":
            return "partly-sunny-outline";;
        case "nuit":
            return "moon-outline";;
        default:
            return "alert-circle-outline";;
    }    
}
export default IconDomoticzParametre;