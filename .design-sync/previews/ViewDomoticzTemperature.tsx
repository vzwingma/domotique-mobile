import React from 'react';
import { View } from 'react-native';
import { ViewDomoticzTemperature } from '../../app/components/temperature.component';
import DomoticzTemperature from '../../app/models/domoticzTemperature.model';
import { Colors } from '../../app/enums/Colors';

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ backgroundColor: Colors.dark.background, padding: 8, width: 360 }}>{children}</View>
);

export const ChambreBebe = () => (
  <Row>
    <ViewDomoticzTemperature
      temperature={
        new DomoticzTemperature({
          idx: '10',
          rang: 1,
          name: 'Chambre Bébé',
          lastUpdate: new Date().toISOString(),
          isActive: true,
          temp: 27.58,
          humidity: 49,
          humidityStatus: 'Confortable',
          type: 'Temp+Hum',
          subType: '',
          status: '',
          data: '',
        } as DomoticzTemperature)
      }
    />
  </Row>
);

export const SalleDeBain = () => (
  <Row>
    <ViewDomoticzTemperature
      temperature={
        new DomoticzTemperature({
          idx: '13',
          rang: 4,
          name: 'Salle de bain',
          lastUpdate: new Date().toISOString(),
          isActive: true,
          temp: 27.06,
          humidity: 57,
          humidityStatus: 'Confortable',
          type: 'Temp+Hum',
          subType: '',
          status: '',
          data: '',
        } as DomoticzTemperature)
      }
    />
  </Row>
);

export const Deconnecte = () => (
  <Row>
    <ViewDomoticzTemperature
      temperature={
        new DomoticzTemperature({
          idx: '99',
          rang: 9,
          name: 'Extérieur',
          lastUpdate: new Date().toISOString(),
          isActive: false,
          temp: null as unknown as number,
          humidity: null as unknown as number,
          humidityStatus: '',
          type: 'Temp+Hum',
          subType: '',
          status: '',
          data: '',
        } as DomoticzTemperature)
      }
    />
  </Row>
);
