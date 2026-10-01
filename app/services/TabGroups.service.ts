/**
 * Service des groupes d'onglets (layout fusionné tablette paysage)
 *
 * En layout fusionné, les onglets sont regroupés deux à deux et affichés sur un seul écran :
 * - Lumières + Volets
 * - Températures + Maison
 * Favoris reste un onglet autonome.
 *
 * Hors layout fusionné (téléphone, tablette portrait), chaque onglet reste autonome.
 */

import { Tabs } from '../enums/TabsEnums';

export type MergedTabGroup = readonly [Tabs, Tabs];

/** Groupes d'onglets fusionnés, dans l'ordre d'affichage des colonnes (gauche, droite) */
export const MERGED_TAB_GROUPS: readonly MergedTabGroup[] = [
  [Tabs.LUMIERES, Tabs.VOLETS],
  [Tabs.TEMPERATURES, Tabs.MAISON],
];

/**
 * Retourne le groupe fusionné contenant l'onglet
 * @param tab onglet
 * @returns le groupe [gauche, droite], ou null si l'onglet n'appartient à aucun groupe
 */
export function getMergedTabGroup(tab: Tabs): MergedTabGroup | null {
  return MERGED_TAB_GROUPS.find(group => group.includes(tab)) ?? null;
}

/**
 * Indique si un bouton d'onglet doit être affiché actif.
 * En layout fusionné, les onglets d'un même groupe sont actifs ensemble.
 * @param activeTab onglet sélectionné
 * @param thisTab onglet du bouton
 * @param isMergedLayout layout fusionné (tablette paysage)
 */
export function isTabActive(activeTab: Tabs, thisTab: Tabs, isMergedLayout: boolean): boolean {
  if (activeTab === thisTab) {
    return true;
  }
  if (!isMergedLayout) {
    return false;
  }
  return getMergedTabGroup(activeTab)?.includes(thisTab) ?? false;
}

/**
 * Titre du header pour l'onglet sélectionné
 * @param tab onglet sélectionné
 * @param isMergedLayout layout fusionné (tablette paysage)
 * @returns ex. "Lumières & Volets" en layout fusionné, sinon le libellé de l'onglet
 */
export function getTabTitle(tab: Tabs, isMergedLayout: boolean): string {
  const group = isMergedLayout ? getMergedTabGroup(tab) : null;
  return group ? `${group[0]} & ${group[1]}` : tab.toString();
}
