import AppIcon from "@/components/AppIcon";

/**
 * Composant qui affiche une icône en fonction du type de mesure température Domoticz.
 * @param thermostat - Les informations de la mesure de température.
 * Icone d'une mesure de température Domoticz, suivant le type et le statut de l'équipement.
 *  >Icone du volet : https://oblador.github.io/react-native-vector-icons/ 
 */
export const IconDomoticzThermostat : React.FC = () => {
    return <AppIcon name="flame" size={60} color={"white"}/>
}
export default IconDomoticzThermostat;