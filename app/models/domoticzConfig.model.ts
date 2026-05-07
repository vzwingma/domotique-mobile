/**
 * Configuration Domoticz
 * 
 * Modèle immuable représentant les informations de configuration du serveur Domoticz.
 * Toutes les propriétés sont readonly pour garantir l'immuabilité.
 */
class DomoticzConfig {
    readonly status: string;
    readonly version: string;
    readonly revision: string;

    /**
     * Constructeur
     * @param status - Le statut du serveur Domoticz
     * @param version - La version du serveur Domoticz
     * @param revision - La révision du serveur Domoticz
     */
    constructor({ status, version, revision }: { status: string; version: string; revision: string; }) {
        this.status = status;
        this.version = version;
        this.revision = revision;
    }

    /**
     * Getter: Version formatée pour affichage
     * @returns "v3.7.0 (revision 123)"
     */
    get displayVersion(): string {
        return `v${this.version} (revision ${this.revision})`;
    }

    /**
     * Getter: Le serveur est-il en ligne ?
     * Heuristique: le statut contient "OK"
     */
    get isOnline(): boolean {
        return this.status.toUpperCase().includes('OK');
    }
}
export default DomoticzConfig;
