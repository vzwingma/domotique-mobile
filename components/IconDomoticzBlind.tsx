import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { MaterialCommunityIcons } from "@expo/vector-icons";


/**
 * Icone d'un équipement Domoticz, suivant le type et le statut de l'équipement.
 *  >Icone du volet : https://oblador.github.io/react-native-vector-icons/ 
 */
class IconDomoticzBlind extends MaterialCommunityIcons {

    constructor(props: { name: any, size: number, color: string, onPress: () => void }) {
        super(props);
    }
}



export default IconDomoticzBlind;