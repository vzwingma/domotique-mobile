import { SERVICES_URL } from '@/app/enums/APIconstants';
import DomoticzConfig from '@/app/models/domoticzConfig.model';
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
    setDomoticzConnexionData: React.Dispatch<React.SetStateAction<DomoticzConfig | undefined>>;
    setDomoticzDevicesData: React.Dispatch<React.SetStateAction<DomoticzDevice[]>>;
    setDomoticzThermostatData: React.Dispatch<React.SetStateAction<DomoticzThermostat[]>>;
    setDomoticzParametersData: React.Dispatch<React.SetStateAction<DomoticzParameter[]>>;
    setDomoticzTemperaturesData: React.Dispatch<React.SetStateAction<DomoticzTemperature[]>>;
}

/**
 * Orchestration de refresh unifiée — toutes les requêtes en parallèle :
 * - GET_CONFIG + GET_DEVICES + GET_TEMPS lancés simultanément (Promise.all)
 * - dérivation devices/thermostats/parameters depuis le payload GET_DEVICES partagé
 *
 * Avant cette version, GET_CONFIG était séquentiel (via connectToDomoticz) puis
 * GET_DEVICES+GET_TEMPS, doublant la latence sur les liens lents (5G ~30-40s par requête).
 */
export async function refreshDomoticzData({
    setDomoticzConnexionData,
    setDomoticzDevicesData,
    setDomoticzThermostatData,
    setDomoticzParametersData,
    setDomoticzTemperaturesData,
}: RefreshOrchestratorCallbacks): Promise<void> {
    const [configResponse, devicesResponse, temperaturesResponse] = await Promise.all([
        callDomoticz(SERVICES_URL.GET_CONFIG),
        callDomoticz(SERVICES_URL.GET_DEVICES),
        callDomoticz(SERVICES_URL.GET_TEMPS),
    ]);

    setDomoticzConnexionData(new DomoticzConfig({
        status: configResponse?.status ?? '',
        version: configResponse?.version ?? '',
        revision: configResponse?.Revision ?? '',
    }));

    const rawDevices = devicesResponse?.result ?? [];
    const rawTemperatures = temperaturesResponse?.result ?? [];

    setDomoticzDevicesData(mapRawDevicesToDomoticzDevices(rawDevices));
    setDomoticzThermostatData(mapRawDevicesToDomoticzThermostats(rawDevices));
    setDomoticzParametersData(mapRawDevicesToDomoticzParameters(rawDevices));
    setDomoticzTemperaturesData(mapRawTemperaturesToDomoticzTemperatures(rawTemperatures));
}

