/**
 * 
 * Ce fichier contient le code de l'écran des mesures de températures.
 */
import { View } from 'react-native';


/**
 * Composant de l'écran des paramètres
 * 
 */
export default function TabDomoticzParametres(): JSX.Element[] {

  let items: JSX.Element[] = [];
  items.push(<View key="separator" style={{ height: 1, backgroundColor: 'red', marginVertical: 10 }} />);


  return items;
}