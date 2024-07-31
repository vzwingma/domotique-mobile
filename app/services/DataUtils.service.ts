




/**
 * 
 * @param equipement1 equipement 1
 * @param equipement2 equipement 2
 * @param equipementsOrder ordre des équipements
 * @returns tri des équipements
 */
export function sortEquipements( equipement1: DomoticzEquipement, equipement2: DomoticzEquipement, equipementsOrder: number[] ) {
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
  