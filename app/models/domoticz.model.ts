

/**
 * Configuration de Domoticz
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


/**
 * Equipement Domoticz
 */
class DomoticzEquipement {
    Name: string;
    Type: string;
    SubType: string;
    Status: string;

    constructor(Name: string, Type: string, SubType: string, Status: string) {
        this.Name = Name;
        this.Type = Type;
        this.SubType = SubType;
        this.Status = Status;
    }
}