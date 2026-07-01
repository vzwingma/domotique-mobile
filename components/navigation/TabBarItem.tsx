import { ThemedText } from "../ThemedText";
import { TabBarIcon } from "./TabBarIcon";
import { Colors } from "@/app/enums/Colors";
import { StyleSheet, View } from "react-native";
import { Tabs } from "@/app/enums/TabsEnums";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type TabIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

// Propriétés des onglets
interface TabBarItemsProps {
    activeTab: Tabs; // active tab
    thisTab: Tabs; // this tab name
    selectNewTab: (_tab: Tabs) => void; // set active tab
}

/**
 * Tab bar items
 * 
 * @param activeTab le nom de l'onglet actif
 * @param thisTab this tab name
 * @param setTab fonction pour définir l'onglet actif
 */
export function TabBarItems({ activeTab, thisTab, selectNewTab}: Readonly<TabBarItemsProps>) {
    const iconName = getTabIconName(thisTab, activeTab === thisTab);

    return <View style={tabStyles.tabsItem} onPointerDown={() => selectNewTab(thisTab)} onTouchEnd={() => selectNewTab(thisTab)}>
                <TabBarIcon name={iconName}
                             color={activeTab === thisTab ? Colors.domoticz.color : '#ffffff'} />
                <ThemedText type='tab'>{thisTab.toString()}</ThemedText>
            </View>;
  }

  /**
   * Retourne l'icône de l'onglet sélectionné
   * @param tab nom de l'onglet
   * @returns l'icône de l'onglet sélectionné
   */
   function getTabIconName(tab: Tabs, isActive: boolean): TabIconName {
     switch (tab) {
       case Tabs.INDEX:
         return isActive ? 'star' : 'star-outline';
       case Tabs.LUMIERES:
         return isActive ? 'lightbulb' : 'lightbulb-outline';
       case Tabs.VOLETS:
         return 'window-shutter';
       case Tabs.TEMPERATURES:
         return 'thermometer';
       case Tabs.MAISON:
          return isActive ? 'home' : 'home-outline';
       default:
         return 'help-circle-outline';
     }
   }

const tabStyles = StyleSheet.create({
 
    tabsItem: {
      width: '20%',
      backgroundColor: Colors.dark.titlebackground,
      alignItems: 'center',
      cursor: 'pointer',
      minHeight: 44,
    }
    });

