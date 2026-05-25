import { SERVICES_URL } from '@/app/enums/APIconstants';
import DomoticzDevice from '@/app/models/domoticzDevice.model';
import DomoticzParameter from '@/app/models/domoticzParameter.model';
import DomoticzTemperature from '@/app/models/domoticzTemperature.model';
import DomoticzThermostat from '@/app/models/domoticzThermostat.model';
import { mapRawDevicesToDomoticzDevices } from '@/app/controllers/devices.controller';
import { mapRawDevicesToDomoticzThermostats } from '@/app/controllers/thermostats.controller';
import { mapRawDevicesToDomoticzParameters } from '@/app/controllers/parameters.controller';
import { mapRawTemperaturesToDomoticzTemperatures } from '@/app/controllers/temperatures.controller';
import callDomoticz from '@/app/services/ClientHTTP.service';

type RefreshOrchestratorCallbacks = {
    setDomoticzDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>;
    setDomoticzThermostatData: React.Dispatch<React.SetStateAction<DomoticzThermostat[]>>;
    setDomoticzParametersData: React.Dispatch<React.SetStateAction<DomoticzParameter[]>>;
    setDomoticzTemperaturesData: React.Dispatch<React.SetStateAction<DomoticzTemperature[]>>;
}

/**
 * Orchestration de refresh unifiée :
 * - 1 seul GET_DEVICES
 * - dérivation devices/thermostats/parameters depuis le payload partagé
 * - GET_TEMPS en parallèle
 */
export async function refreshDomoticzData({
    setDomoticzDevicesData,
    setDomoticzThermostatData,
    setDomoticzParametersData,
    setDomoticzTemperaturesData,
}: RefreshOrchestratorCallbacks): Promise<void> {
    const [devicesResponse, temperaturesResponse] = await Promise.all([
        callDomoticz(SERVICES_URL.GET_DEVICES),
        callDomoticz(SERVICES_URL.GET_TEMPS),
    ]);

    const rawDevices = devicesResponse?.result ?? [];
    const rawTemperatures = temperaturesResponse?.result ?? [];

    setDomoticzDevicesData(mapRawDevicesToDomoticzDevices(rawDevices));
    setDomoticzThermostatData(mapRawDevicesToDomoticzThermostats(rawDevices));
    setDomoticzParametersData(mapRawDevicesToDomoticzParameters(rawDevices));
    setDomoticzTemperaturesData(mapRawTemperaturesToDomoticzTemperatures(rawTemperatures));
}

