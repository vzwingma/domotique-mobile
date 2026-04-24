import { DomoticzDeviceType, DomoticzThermostatLevelValue } from "../enums/DomoticzEnum";


/**
 * Thermostat Domoticz
 * 
 * Modèle immuable pour représenter un thermostat avec validation
 * et getters pour propriétés calculées (besoin d'ajustement, formatage).
 * 
 * Note : 
 * - `temp`: Consigne (Set Point)
 * - `data`: Mesure réelle (Current Temperature)
 */
class DomoticzThermostat {
    // Index de l'équipement (validé > 0)
    readonly idx: number;
    // Rang de l'équipement (affichage) - mutable pour tri
    private _rang: number = 0;
    // Nom de l'équipement
    readonly name: string;
    // Date de la dernière mise à jour
    readonly lastUpdate: string;
    // Equipement actif ?
    readonly isActive: boolean = false;
    // Consigne de l'équipement (Set Point) - mutable pour changements d'état
    private _temp: number;
    // Type de l'équipement
    readonly type: DomoticzDeviceType;
    // Status de l'équipement - mutable pour changements d'état
    private _status: string;
    // Données de l'équipement (mesure réelle)
    readonly data: string;
    // Unité de l'équipement (°C, °F, etc.)
    readonly unit: string;

    constructor(idx: number, name: string, lastUpdate: string, isActive: boolean, temp: number, type: DomoticzDeviceType, status: string, data: string, unit: string) {
        if (idx <= 0) {
            throw new Error(`idx doit être > 0, reçu: ${idx}`);
        }
        this.idx = idx;
        this.name = name;
        this.lastUpdate = lastUpdate;
        this.isActive = isActive;
        this._temp = temp;
        this.type = type;
        this._status = status;
        this.data = data;
        this.unit = unit;
    }

    /**
     * Getter pour le rang de l'équipement (affichage)
     */
    get rang(): number {
        return this._rang;
    }

    /**
     * Setter pour le rang de l'équipement
     */
    set rang(value: number) {
        this._rang = value;
    }

    /**
     * Getter pour la consigne (Set Point)
     */
    get temp(): number {
        return this._temp;
    }

    /**
     * Setter pour la consigne
     */
    set temp(value: number) {
        this._temp = value;
    }

    /**
     * Getter pour le statut de l'équipement
     */
    get status(): string {
        return this._status;
    }

    /**
     * Setter pour le statut de l'équipement
     */
    set status(value: string) {
        this._status = value;
    }

    /**
     * Getter: La consigne nécessite-t-elle un ajustement ?
     * Heuristique: La différence entre consigne et mesure est > 2°C
     * 
     * @returns true si |consigne - mesure| > 2°C
     */
    get needsAdjustment(): boolean {
        const measuredTemp = this.getMeasuredTemperature();
        if (measuredTemp === null) return false;
        return Math.abs(this._temp - measuredTemp) > 2;
    }

    /**
     * Getter: Formatage de la consigne pour affichage
     * @returns "22°C" ou "22°F" selon l'unité
     */
    get displaySetpoint(): string {
        return `${this._temp}${this.unit || '°C'}`;
    }

    /**
     * Getter: Formatage de la mesure pour affichage
     * @returns "21.5°C" ou "21.5°F" selon l'unité (null si pas de données)
     */
    get displayMeasure(): string {
        const measured = this.getMeasuredTemperature();
        if (measured === null) return 'N/A';
        return `${measured}${this.unit || '°C'}`;
    }

    /**
     * Getter: Récupère la température mesurée depuis data
     * Format attendu: "20.5 °C" ou juste "20.5"
     * 
     * @returns La température numérique ou null si non trouvée
     */
    private getMeasuredTemperature(): number | null {
        if (!this.data) return null;
        try {
            const match = this.data.match(/[\d.]+/);
            if (match) {
                return parseFloat(match[0]);
            }
        } catch {
            // Retourne null si parsing échoue
        }
        return null;
    }
}
export default DomoticzThermostat;
