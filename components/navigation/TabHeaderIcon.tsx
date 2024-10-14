import { Colors, PROFILE, PROFILES_ENV } from "@/app/enums/Colors";
import { Tabs } from "@/app/enums/TabsEnums";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet } from "react-native";




/**
 * Affiche l'image du logo de l'application suivant l'onglet sélectionné
 */
export function getHeaderIcon(tab: Tabs) {
    const iconSize = 110;
    switch (tab) {
      case Tabs.INDEX:
        return <Image source={PROFILE === PROFILES_ENV.C ? require('@/assets/images/c/partial-dlogo.png') : require('@/assets/images/v/partial-dlogo.png')} style={tabStyles.domoticzLogo} />
      case Tabs.LUMIERES:
        return <Ionicons size={iconSize} name="bulb" style={tabStyles.headerImage} />
      case Tabs.VOLETS:
        return <Ionicons size={iconSize} name="reorder-four" style={tabStyles.headerImage} />
      case Tabs.TEMPERATURES:
        return <Ionicons size={iconSize} name="thermometer-sharp" style={tabStyles.headerImage} />
        case Tabs.THERMOSTATS:
          return <Ionicons size={iconSize} name="flame" style={tabStyles.headerImage} />        
      default:
        return <></>;
    }
  }


  

export const tabStyles = StyleSheet.create({
    headerImage: {
      color: '#808080',
      position: 'absolute',
      bottom: -20,
      backgroundColor: Colors.dark.titlebackground,
    },
    domoticzLogo: {
      width: 100,
      height: 100,
      position: 'absolute',
      backgroundColor: Colors.dark.titlebackground,
    },
  });