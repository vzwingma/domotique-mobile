               
/**
 * Température Domoticz (Thermostat, capteur de température & humidité)
 */
class DomoticzTemperature {
    // Index de l'équipement
    idx: number;
    // Rang de l'équipement (affichage)
    rang: number;
    // Nom de l'équipement
    name: string;
    // Date de la dernière mise à jour
    lastUpdate: string;
    // Equipement actif ?
    isActive: boolean = false;
    // température
    temp: number;
    // humidité
    humidity: number;
    // Statut humidité
    humidityStatus: string;
    // Type de l'équipement
    type: string;
    // Sous-type de l'équipement
    subType: string;
    // Status de l'équipement
    status: string;
    // Données de l'équipement
    data: string;

    /**
     * Constructeur
     */
    constructor(idx: number, rang: number, name: string, lastUpdate: string, temp: number, humidity: number, humidityStatus: string,
                type: string, subType: string, status: string, data: string, isGroup: boolean = false) {
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

