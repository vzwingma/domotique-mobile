import Device from "../models/domoticzDevice.model";





/**
 * 
 * @param device1 equipement 1
 * @param device2 equipement 2
 * @param devicesOrder ordre des équipements
 * @returns tri des équipements
 */
export function sortEquipements( device1: Device, device2: Device, devicesOrder: number[] ) {
    devicesOrder.forEach((idx, index) => {
        if ( device1.idx == idx ){
            device1.rang = index;
        }
        if ( device2.idx == idx ){
            device2.rang = index;
        }
    });
    return device1.rang - device2.rang;
  }
  