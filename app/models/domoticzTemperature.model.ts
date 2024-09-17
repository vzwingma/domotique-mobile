               
/**
 * Température Domoticz (Thermostat, capteur de température & humidité)
 */
class DomoticzTemperature {
    // Index de l'équipement
    readonly idx: string;
    // Rang de l'équipement (affichage)
    readonly rang: number;
    // Nom de l'équipement
    readonly name: string;
    // Date de la dernière mise à jour
    readonly lastUpdate: string;
    // Equipement actif ?
    readonly isActive: boolean = false;
    // température
    readonly temp: number;
    // humidité
    readonly humidity: number;
    // Statut humidité
    readonly humidityStatus: string;
    // Type de l'équipement
    readonly type: string;
    // Sous-type de l'équipement
    readonly subType: string;
    // Status de l'équipement
    readonly status: string;
    // Données de l'équipement
    readonly data: string;


    
    /**
     * Constructeur de la classe DomoticzTemperature.
     * @param idx - L'identifiant de l'objet DomoticzTemperature.
     * @param rang - Le rang de l'objet DomoticzTemperature.
     * @param name - Le nom de l'objet DomoticzTemperature.
     * @param lastUpdate - La dernière mise à jour de l'objet DomoticzTemperature.
     * @param temp - La température de l'objet DomoticzTemperature.
     * @param humidity - L'humidité de l'objet DomoticzTemperature.
     * @param humidityStatus - Le statut de l'humidité de l'objet DomoticzTemperature.
     * @param type - Le type de l'objet DomoticzTemperature.
     * @param subType - Le sous-type de l'objet DomoticzTemperature.
     * @param status - Le statut de l'objet DomoticzTemperature.
     * @param data - Les données de l'objet DomoticzTemperature.
     */
    constructor({ idx, rang, name, lastUpdate, temp, humidity, humidityStatus, type, subType, status, data }: DomoticzTemperature) {
        this.idx = idx;
        this.rang = rang;
        this.name = name;
        this.lastUpdate = lastUpdate;
        this.temp = temp;
        this.humidity = humidity;
        this.humidityStatus = humidityStatus;
        this.type = type;
        this.subType = subType;
        this.status = status;
        this.data = data;
    }
}
export default DomoticzTemperature;

