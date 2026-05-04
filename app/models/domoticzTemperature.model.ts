
/**
 * Température Domoticz (Thermostat, capteur de température & humidité)
 * 
 * Modèle immuable pour représenter une sonde de température avec getters
 * pour propriétés calculées (détection intérieur/extérieur, formatage).
 * 
 * **Immuabilité :** Toutes les propriétés sont readonly.
 * Modifications impossibles après construction. Pas de mutations.
 */
class DomoticzTemperature {
    // Index de l'équipement (identifiant unique)
    readonly idx: string;
    // Rang de l'équipement (affichage/tri)
    readonly rang: number;
    // Nom de l'équipement (ex: "Salon", "Extérieur")
    readonly name: string;
    // Date de la dernière mise à jour (ISO 8601)
    readonly lastUpdate: string;
    // Équipement actif ? (basé sur timeout)
    readonly isActive: boolean = false;
    // Température en °C (ou autre unité selon config Domoticz)
    readonly temp: number;
    // Humidité en %
    readonly humidity: number;
    // Statut humidité (ex: "Confortable", "Sec", "Humide")
    readonly humidityStatus: string;
    // Type de l'équipement (ex: "Temp+Humidity", "Baro")
    readonly type: string;
    // Sous-type de l'équipement
    readonly subType: string;
    // Statut de l'équipement (pour compatibilité)
    readonly status: string;
    // Données brutes de l'équipement
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

    /**
     * Getter: La sonde est-elle en extérieur ?
     * Heuristique: le nom contient "extérieur", "dehors", "ext", "outside", etc.
     */
    get isOutdoor(): boolean {
        const lowerName = this.name.toLowerCase();
        return /exté(rieur)?|dehors|ext|outside|outdoor|terrasse/.test(lowerName);
    }

    /**
     * Getter: Formatage de la température pour affichage
     * @returns "22.5°C" ou "72°F" selon le contexte
     */
    get displayTemp(): string {
        return `${this.temp}°C`;
    }

    /**
     * Getter: Formatage de l'humidité pour affichage
     * @returns "65%" ou "65% (Confortable)"
     */
    get displayHumidity(): string {
        if (this.humidityStatus) {
            return `${this.humidity}% (${this.humidityStatus})`;
        }
        return `${this.humidity}%`;
    }
}
export default DomoticzTemperature;
