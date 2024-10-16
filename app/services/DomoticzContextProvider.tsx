import React, { useState } from "react";
import DomoticzConfig from "../models/domoticzConfig.model";
import DomoticzDevice from "../models/domoticzDevice.model";
import DomoticzTemperature from "../models/domoticzTemperature.model";
import DomoticzThermostat from "../models/domoticzThermostat.model";



/**
 * Contexte de la partie budget
 */
type DomoticzContextType = {
    domoticzConnexionData: DomoticzConfig | undefined;
    setDomoticzConnexionData: React.Dispatch<React.SetStateAction<DomoticzConfig | undefined>>;

    domoticzDevicesData: DomoticzDevice[] | [];
    setDomoticzDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>;

    domoticzTemperaturesData: DomoticzTemperature[];
    setDomoticzTemperaturesData: React.Dispatch<React.SetStateAction<DomoticzTemperature[]>>;

    domoticzThermostatData: DomoticzThermostat[];
    setDomoticzThermostatData: React.Dispatch<React.SetStateAction<DomoticzThermostat[]>>;
};


export const DomoticzContext = React.createContext<DomoticzContextType | null>(null);


/**
 * Domoticz context provider
 * @param param0 children
 * @returns  provider
 */
export function DomoticzContextProvider({ children }: Readonly<{ children: React.ReactNode }>) : JSX.Element {
    const [domoticzConnexionData, setDomoticzConnexionData]       = useState<DomoticzConfig>();  // State to store the response data
    const [domoticzDevicesData, setDomoticzDevicesData]           = useState<DomoticzDevice[]>([]);         // State to store the devices data
    const [domoticzTemperaturesData, setDomoticzTemperaturesData] = useState<DomoticzTemperature[]>([]);    // État pour stocker les données de réponse
    const [domoticzThermostatData, setDomoticzThermostatData]     = useState<DomoticzThermostat[]>([]);    // État pour stocker les données de réponse
    const contextValue = React.useMemo(() => ({
        domoticzConnexionData,
        setDomoticzConnexionData,
        domoticzDevicesData,
        setDomoticzDevicesData,
        domoticzTemperaturesData,
        setDomoticzTemperaturesData,
        domoticzThermostatData,
        setDomoticzThermostatData
    }), [
        domoticzConnexionData,
        domoticzDevicesData,
        domoticzTemperaturesData,
        domoticzThermostatData
    ]);

    return (
        <DomoticzContext.Provider value={contextValue}>
            {children}
        </DomoticzContext.Provider>
    )
}
