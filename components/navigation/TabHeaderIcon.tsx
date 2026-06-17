import { PROFILE, PROFILES_ENV } from "@/app/enums/Colors";
import { Tabs } from "@/app/enums/TabsEnums";
import AppIcon from "@/components/AppIcon";
import { Image, StyleSheet } from "react-native";




/**
 * Affiche l'image du logo de l'application suivant l'onglet sélectionné
 */
export function getHeaderIcon(tab: Tabs) {
    const iconSize = 30;
    switch (tab) {
      case Tabs.INDEX:
        return <Image source={PROFILE === PROFILES_ENV.C ? require('@/assets/images/c/partial-dlogo.png') : require('@/assets/images/v/partial-dlogo.png')} style={tabStyles.domoticzLogo} />
      case Tabs.LUMIERES:
        return <AppIcon size={iconSize} name="bulb" style={tabStyles.headerImage} />
      case Tabs.VOLETS:
        return <AppIcon size={iconSize} name="reorder-four" style={tabStyles.headerImage} />
      case Tabs.TEMPERATURES:
        return <AppIcon size={iconSize} name="thermometer-sharp" style={tabStyles.headerImage} />
        case Tabs.MAISON:
          return <AppIcon size={iconSize} name="home-sharp" style={tabStyles.headerImage} />
      default:
        return <></>;
    }
  }


  

export const tabStyles = StyleSheet.create({
    headerImage: {
      color: '#808080',
    },
    domoticzLogo: {
      width: 50,
      height: 50,
      resizeMode: 'contain',
    },
  });
