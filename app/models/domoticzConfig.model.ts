/**
 * Configuration de Domoticz
 */
class DomoticzConfig {
    status: string;
    version: string;
    revision: string;

    constructor(status: string, version: string, revision: string) {
        this.status = status;
        this.version = version;
        this.revision = revision;
    }
}
export default DomoticzConfig;