

/**
 * DomoticzConfig model
 */
class DomoticzConfig {
    status: string;
    version: string;
    Revision: string;

    constructor(status: string, version: string, Revision: string) {
        this.status = status;
        this.version = version;
        this.Revision = Revision;
    }
}