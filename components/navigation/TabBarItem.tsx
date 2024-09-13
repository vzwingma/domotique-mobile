import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { TabBarIcon } from "./TabBarIcon";
import { Colors } from "@/app/enums/Colors";
import { StyleSheet } from "react-native";
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
export function TabBarItems({ activeTab, thisTab, selectNewTab}: TabBarItemsProps) {
    return <ThemedView style={tabStyles.tabsItem} onPointerDown={() => selectNewTab(thisTab)} onTouchEnd={() => selectNewTab(thisTab)}>
                <TabBarIcon name={activeTab === thisTab ? getTabIcon(thisTab) : getTabIconOutline(thisTab)} 
                            color={activeTab === thisTab ? Colors.domoticz.color : '#ffffff'} />
                <ThemedText type='tab'>{getTabLabel(thisTab)}</ThemedText>
            </ThemedView>;
  }

  /**
   * Get tab label
   * @param tab tab name
   * @returns tab label
   */
  function getTabLabel(tab: Tabs): string {
    switch (tab) {
      case Tabs.INDEX:
        return 'Accueil';
      case Tabs.LUMIERES:
        return 'Lumières';
      case Tabs.VOLETS:
        return 'Volets';
      case Tabs.TEMPERATURES:
        return 'Températures';
      default:
        return '';
    }
  }
  
  /**
   * Retourne l'icône de l'onglet sélectionné
   * @param tab nom de l'onglet
   * @returns l'icône de l'onglet sélectionné
   */
  function getTabIcon(tab: Tabs): string {
    switch (tab) {
      case Tabs.INDEX:
        return 'home';
      case Tabs.LUMIERES:
        return 'bulb';
      case Tabs.VOLETS:
        return 'reorder-four';
      case Tabs.TEMPERATURES:
        return 'thermometer';
      default:
        return '';
    }
  }

  /**
   * Retourne l'icône de l'onglet non sélectionné
   * @param tab nom de l'onglet
   * @returns l'icône de l'onglet non sélectionné
   *    */
  function getTabIconOutline(tab: Tabs): string {
    switch (tab) {
      case Tabs.INDEX:
        return 'home-outline';
      case Tabs.LUMIERES:
        return 'bulb-outline';
      case Tabs.VOLETS:
        return 'reorder-four-outline';
      case Tabs.TEMPERATURES:
        return 'thermometer-outline';
      default:
        return '';
    }
  }

const tabStyles = StyleSheet.create({
 
    tabsItem: {
      width: '25%',
      backgroundColor: Colors.dark.titlebackground,
      alignItems: 'center',
      cursor: 'pointer',
    }
    });

