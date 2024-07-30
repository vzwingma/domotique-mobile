


/**
 * Tri des lumières pour l'affichage
 * @param light1 equipement 1
 * @param light2 equipement 2
 * @returns tri des équipements
 */
export function sortLumieres( light1: DomoticzEquipement, light2: DomoticzEquipement ) {
    return sortEquipements( light1, light2, [122, 117, 113, 114, 118, 128, 72] );
}

/**
 * Tri des volets pour l'affichage
 * @param volet1 volet 1
 * @param volet2 volet 2
 * @returns tri des équipements
 */
export function sortVolets( volet1: DomoticzEquipement, volet2: DomoticzEquipement ) {
    return sortEquipements( volet1, volet2, [85, 84, 55, 66, 86, 67, 68] );
}
/**
 * 
 * @param equipement1 equipement 1
 * @param equipement2 equipement 2
 * @param equipementsOrder ordre des équipements
 * @returns tri des équipements
 */
function sortEquipements( equipement1: DomoticzEquipement, equipement2: DomoticzEquipement, equipementsOrder: number[] ) {
    equipementsOrder.forEach((idx, index) => {
        if ( equipement1.idx == idx ){
            equipement1.rang = index;
        }
        if ( equipement2.idx == idx ){
            equipement2.rang = index;
        }
    });
    return equipement1.rang - equipement2.rang;
  }
  