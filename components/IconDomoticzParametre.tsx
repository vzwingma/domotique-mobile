import { DomoticzParamListProps } from "@/app/components/paramList.component";
import { Ionicons } from "@expo/vector-icons";

/**
 * Composant qui affiche une icône en fonction du type de paramètre Domoticz.
 *  >Icone : https://oblador.github.io/react-native-vector-icons/ 
 */
export const IconDomoticzParametre : React.FC<DomoticzParamListProps> = ({ parametre }: DomoticzParamListProps) => {
    if(parametre.level === 0){
        return <Ionicons name="earth-outline" size={60} color={"white"}/>
    } else if(parametre.level === 10){
        return <Ionicons name="people-circle-outline" size={60} color={"white"}/>
    } else {
        return <Ionicons name="sunny-outline" size={60} color={"white"}/>
  
    }
}
export default IconDomoticzParametre;