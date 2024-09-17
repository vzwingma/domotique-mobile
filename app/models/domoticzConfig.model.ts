/**
 * Modèle représentant la configuration de Domoticz.
 */
class DomoticzConfig {
    readonly status: string;
    readonly version: string;
    readonly revision: string;

    /**
     * Constructeur
     */
    constructor({ status, version, revision }: DomoticzConfig) {
        this.status = status;
        this.version = version;
        this.revision = revision;
    }
}
export default DomoticzConfig;