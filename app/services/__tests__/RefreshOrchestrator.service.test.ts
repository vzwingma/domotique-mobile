import { refreshDomoticzData } from '../RefreshOrchestrator.service';
import callDomoticz from '../ClientHTTP.service';
import { SERVICES_URL } from '@/app/enums/APIconstants';

jest.mock('../ClientHTTP.service');

const mockCallDomoticz = callDomoticz as jest.Mock;

function makeRawDevices(): any[] {
    return [
        {
            idx: '1',
            Name: 'Lumière Salon',
            Status: 'On',
            Level: 100,
            Type: 'Light/Switch',
            SwitchType: 'On/Off',
            LastUpdate: '2025-01-01 00:00:00',
            HaveTimeout: false,
            Data: 'On',
        },
        {
            idx: '2',
            Name: 'Thermostat Chambre',
            SetPoint: 21,
            Data: '21.0',
            vunit: '°C',
            LastUpdate: '2025-01-01 00:00:00',
            HaveTimeout: false,
        },
        {
            idx: '3',
            Name: '[Param] Présence',
            Data: 'Occupé',
            Level: 1,
            SwitchType: 'Selector',
            LevelNames: Buffer.from('Absent|Occupé').toString('base64'),
            LastUpdate: '2025-01-01 00:00:00',
            HaveTimeout: false,
        },
    ];
}

describe('refreshDomoticzData', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('lance GET_CONFIG, GET_DEVICES et GET_TEMPS en parallèle', async () => {
        mockCallDomoticz.mockImplementation((url: SERVICES_URL) => {
            if (url === SERVICES_URL.GET_CONFIG) {
                return Promise.resolve({ status: 'OK', version: '2024.1', Revision: '12345' });
            }
            if (url === SERVICES_URL.GET_DEVICES) {
                return Promise.resolve({ result: makeRawDevices() });
            }
            if (url === SERVICES_URL.GET_TEMPS) {
                return Promise.resolve({
                    result: [{
                        idx: '4',
                        Name: 'TempératureHumidité - Cuisine',
                        Type: 'Temp + Humidity',
                        SubType: 'THB',
                        Temp: 20.5,
                        Humidity: 45,
                        HumidityStatus: 'Comfortable',
                        LastUpdate: '2025-01-01 00:00:00',
                        HaveTimeout: false,
                        Data: '20.5 C, 45 %',
                    }],
                });
            }
            return Promise.resolve({ result: [] });
        });

        const setDomoticzConnexionData = jest.fn();
        const setDomoticzDevicesData = jest.fn();
        const setDomoticzThermostatData = jest.fn();
        const setDomoticzParametersData = jest.fn();
        const setDomoticzTemperaturesData = jest.fn();

        await refreshDomoticzData({
            setDomoticzConnexionData,
            setDomoticzDevicesData,
            setDomoticzThermostatData,
            setDomoticzParametersData,
            setDomoticzTemperaturesData,
        });

        expect(mockCallDomoticz).toHaveBeenCalledTimes(3);
        expect(mockCallDomoticz).toHaveBeenCalledWith(SERVICES_URL.GET_CONFIG);
        expect(mockCallDomoticz).toHaveBeenCalledWith(SERVICES_URL.GET_DEVICES);
        expect(mockCallDomoticz).toHaveBeenCalledWith(SERVICES_URL.GET_TEMPS);
        expect(setDomoticzConnexionData).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'OK', version: '2024.1', revision: '12345' })
        );
        expect(setDomoticzDevicesData).toHaveBeenCalledWith(expect.any(Array));
        expect(setDomoticzThermostatData).toHaveBeenCalledWith(expect.any(Array));
        expect(setDomoticzParametersData).toHaveBeenCalledWith(expect.any(Array));
        expect(setDomoticzTemperaturesData).toHaveBeenCalledWith(expect.any(Array));
    });

    it('propage les erreurs de récupération', async () => {
        mockCallDomoticz.mockRejectedValue(new Error('Network error'));

        await expect(refreshDomoticzData({
            setDomoticzConnexionData: jest.fn(),
            setDomoticzDevicesData: jest.fn(),
            setDomoticzThermostatData: jest.fn(),
            setDomoticzParametersData: jest.fn(),
            setDomoticzTemperaturesData: jest.fn(),
        })).rejects.toThrow('Network error');
    });
});

