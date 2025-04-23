import { ThemedText } from "../ThemedText";
import { TabBarIcon } from "./TabBarIcon";
import { Colors } from "@/app/enums/Colors";
import { StyleSheet, View } from "react-native";
import { Tabs } from "@/app/enums/TabsEnums";

// Propriétés des onglets
interface TabBarItemsProps {
    activeTab: Tabs; // active tab
    thisTab: Tabs; // this tab name
    selectNewTab: (tab: Tabs) => void; // set active tab
}

/**
 * Tab bar items
 * 
 * @param activeTab le nom de l'onglet actif
 * @param thisTab this tab name
 * @param setTab fonction pour définir l'onglet actif
 */
export function TabBarItems({ activeTab, thisTab, selectNewTab}: Readonly<TabBarItemsProps>) : JSX.Element {
    return <View style={tabStyles.tabsItem} onPointerDown={() => selectNewTab(thisTab)} onTouchEnd={() => selectNewTab(thisTab)}>
                <TabBarIcon name={getTabIconName(thisTab) + (activeTab === thisTab ? "" : "-outline")} 
                            color={activeTab === thisTab ? Colors.domoticz.color : '#ffffff'} />
                <ThemedText type='tab'>{thisTab.toString()}</ThemedText>
            </View>;
  }

  /**
   * Retourne l'icône de l'onglet sélectionné
   * @param tab nom de l'onglet
   * @returns l'icône de l'onglet sélectionné
   */
  function getTabIconName(tab: Tabs): string {
    switch (tab) {
      case Tabs.INDEX:
        return 'star';
      case Tabs.LUMIERES:
        return 'bulb';
      case Tabs.VOLETS:
        return 'reorder-four';
      case Tabs.TEMPERATURES:
        return 'thermometer';
        case Tabs.THERMOSTATS:
          return 'flame';        
      default:
        return '';
    }
  }

const tabStyles = StyleSheet.create({
 
    tabsItem: {
      width: '20%',
      backgroundColor: Colors.dark.titlebackground,
      alignItems: 'center',
      cursor: 'pointer',
    }
    });

