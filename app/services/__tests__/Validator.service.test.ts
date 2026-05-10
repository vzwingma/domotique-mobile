import {
  validateDomoticzResponse,
  validateRawDevice,
  validateRawTemperature,
  validateRawThermostat,
  validateConstructedDevice,
  validateConstructedThermostat,
  validateConstructedTemperature,
  ValidationError,
} from '../Validator.service';
import DomoticzDevice from '../../models/domoticzDevice.model';
import DomoticzTemperature from '../../models/domoticzTemperature.model';
import DomoticzThermostat from '../../models/domoticzThermostat.model';
import { DomoticzDeviceType, DomoticzSwitchType } from '../../enums/DomoticzEnum';

describe('Validator.service', () => {
  // ===== validateDomoticzResponse =====
  describe('validateDomoticzResponse', () => {
    it('should accept valid response', () => {
      const validResponse = {
        status: 'OK',
        result: [],
      };
      expect(() => validateDomoticzResponse(validResponse)).not.toThrow();
    });

    it('should throw for null response', () => {
      expect(() => validateDomoticzResponse(null)).toThrow(ValidationError);
      expect(() => validateDomoticzResponse(null)).toThrow('réponse API doit être un objet');
    });

    it('should throw for missing status field', () => {
      expect(() => validateDomoticzResponse({ result: [] })).toThrow(ValidationError);
      expect(() => validateDomoticzResponse({ result: [] })).toThrow('status');
    });

    it('should throw for non-string status', () => {
      expect(() => validateDomoticzResponse({ status: 123, result: [] })).toThrow(ValidationError);
    });

    it('should throw for missing result field', () => {
      expect(() => validateDomoticzResponse({ status: 'OK' })).toThrow(ValidationError);
      expect(() => validateDomoticzResponse({ status: 'OK' })).toThrow('result');
    });

    it('should throw for non-array result', () => {
      expect(() => validateDomoticzResponse({ status: 'OK', result: {} })).toThrow(ValidationError);
    });
  });

  // ===== validateRawDevice =====
  describe('validateRawDevice', () => {
    const validRawDevice = {
      idx: '42',
      Name: 'Lumière Salon',
      Status: 'On',
      Type: 'Light',
      LastUpdate: '2025-01-01 12:00:00',
      Level: 100,
      HaveTimeout: false,
    };

    it('should accept valid raw device', () => {
      expect(() => validateRawDevice(validRawDevice)).not.toThrow();
    });

    it('should throw for null device', () => {
      expect(() => validateRawDevice(null)).toThrow(ValidationError);
      expect(() => validateRawDevice(null)).toThrow('objet valide');
    });

    it('should throw for missing idx', () => {
      const device = { ...validRawDevice };
      delete device.idx;
      expect(() => validateRawDevice(device)).toThrow(ValidationError);
      expect(() => validateRawDevice(device)).toThrow('idx');
    });

    it('should throw for missing Name', () => {
      const device = { ...validRawDevice };
      delete device.Name;
      expect(() => validateRawDevice(device)).toThrow(ValidationError);
      expect(() => validateRawDevice(device)).toThrow('Name');
    });

    it('should throw for non-string Name', () => {
      expect(() => validateRawDevice({ ...validRawDevice, Name: 123 })).toThrow(ValidationError);
    });

    it('should throw for missing LastUpdate', () => {
      const device = { ...validRawDevice };
      delete device.LastUpdate;
      expect(() => validateRawDevice(device)).toThrow(ValidationError);
      expect(() => validateRawDevice(device)).toThrow('LastUpdate');
    });

    it('should throw for invalid Level type', () => {
      expect(() => validateRawDevice({ ...validRawDevice, Level: 'high' })).toThrow(ValidationError);
      expect(() => validateRawDevice({ ...validRawDevice, Level: 'high' })).toThrow('Level');
    });

    it('should throw for invalid HaveTimeout type', () => {
      expect(() => validateRawDevice({ ...validRawDevice, HaveTimeout: 'yes' })).toThrow(ValidationError);
      expect(() => validateRawDevice({ ...validRawDevice, HaveTimeout: 'yes' })).toThrow('HaveTimeout');
    });

    it('should accept optional fields missing', () => {
      const minimalDevice = {
        idx: '1',
        Name: 'Device',
        Status: 'On',
        Type: 'Light',
        LastUpdate: '2025-01-01',
      };
      expect(() => validateRawDevice(minimalDevice)).not.toThrow();
    });
  });

  // ===== validateRawTemperature =====
  describe('validateRawTemperature', () => {
    const validRawTemp = {
      idx: '50',
      Name: 'Salon',
      Type: 'Temp+Humidity',
      Temp: 22.5,
      Humidity: 65,
      HumidityStatus: 'Confortable',
      LastUpdate: '2025-01-01 12:00:00',
    };

    it('should accept valid raw temperature', () => {
      expect(() => validateRawTemperature(validRawTemp)).not.toThrow();
    });

    it('should throw for null temperature', () => {
      expect(() => validateRawTemperature(null)).toThrow(ValidationError);
    });

    it('should throw for missing Temp', () => {
      const temp = { ...validRawTemp };
      delete temp.Temp;
      expect(() => validateRawTemperature(temp)).toThrow(ValidationError);
    });

    it('should throw for non-numeric Temp', () => {
      expect(() => validateRawTemperature({ ...validRawTemp, Temp: 'warm' })).toThrow(ValidationError);
    });

    it('should throw for out-of-range Temp (too low)', () => {
      expect(() => validateRawTemperature({ ...validRawTemp, Temp: -60 })).toThrow(ValidationError);
      expect(() => validateRawTemperature({ ...validRawTemp, Temp: -60 })).toThrow('entre -50 et 60');
    });

    it('should throw for out-of-range Temp (too high)', () => {
      expect(() => validateRawTemperature({ ...validRawTemp, Temp: 70 })).toThrow(ValidationError);
      expect(() => validateRawTemperature({ ...validRawTemp, Temp: 70 })).toThrow('entre -50 et 60');
    });

    it('should throw for missing Humidity', () => {
      const temp = { ...validRawTemp };
      delete temp.Humidity;
      expect(() => validateRawTemperature(temp)).toThrow(ValidationError);
    });

    it('should throw for invalid Humidity range (negative)', () => {
      expect(() => validateRawTemperature({ ...validRawTemp, Humidity: -10 })).toThrow(ValidationError);
    });

    it('should throw for invalid Humidity range (> 100)', () => {
      expect(() => validateRawTemperature({ ...validRawTemp, Humidity: 150 })).toThrow(ValidationError);
    });
  });

  // ===== validateRawThermostat =====
  describe('validateRawThermostat', () => {
    const validRawThermostat = {
      idx: '99',
      Name: 'Thermostat Salon',
      Status: 'Heating',
      Type: 'Thermostat',
      LastUpdate: '2025-01-01 12:00:00',
      SetPoint: 21.5,
      Data: '20.5 °C',
      vunit: '°C',
    };

    it('should accept valid raw thermostat', () => {
      expect(() => validateRawThermostat(validRawThermostat)).not.toThrow();
    });

    it('should throw for missing SetPoint', () => {
      const thermostat = { ...validRawThermostat };
      delete thermostat.SetPoint;
      expect(() => validateRawThermostat(thermostat)).toThrow(ValidationError);
      expect(() => validateRawThermostat(thermostat)).toThrow('SetPoint');
    });

    it('should throw for invalid SetPoint type', () => {
      expect(() => validateRawThermostat({ ...validRawThermostat, SetPoint: {} })).toThrow(ValidationError);
    });

    it('should throw for string SetPoint (valid)', () => {
      expect(() => validateRawThermostat({ ...validRawThermostat, SetPoint: '22.5' })).not.toThrow();
    });

    it('should throw for out-of-range SetPoint (too low)', () => {
      expect(() => validateRawThermostat({ ...validRawThermostat, SetPoint: 2 })).toThrow(ValidationError);
    });

    it('should throw for out-of-range SetPoint (too high)', () => {
      expect(() => validateRawThermostat({ ...validRawThermostat, SetPoint: 40 })).toThrow(ValidationError);
    });
  });

  // ===== validateConstructedDevice =====
  describe('validateConstructedDevice', () => {
    const validDevice = new DomoticzDevice({
      idx: 42,
      rang: 0,
      name: 'Lumière Salon',
      lastUpdate: '2025-01-01 12:00:00',
      level: 75,
      type: DomoticzDeviceType.LUMIERE,
      subType: 'Light',
      switchType: DomoticzSwitchType.OFF,
      status: 'On',
      data: 'some data',
    });

    /** Crée un DomoticzDevice en court-circuitant le constructeur pour tester des valeurs invalides */
    function makeInvalidDevice(overrides: Record<string, unknown>): DomoticzDevice {
      return Object.assign(Object.create(DomoticzDevice.prototype), {
        idx: 42,
        _rang: 0,
        name: 'Lumière Salon',
        lastUpdate: '2025-01-01 12:00:00',
        _level: 75,
        type: DomoticzDeviceType.LUMIERE,
        subType: 'Light',
        switchType: DomoticzSwitchType.OFF,
        _status: 'On',
        data: 'some data',
        isGroup: false,
        isActive: false,
        unit: '',
        _consistantLevel: true,
      }, overrides) as DomoticzDevice;
    }

    it('should accept valid constructed device', () => {
      expect(() => validateConstructedDevice(validDevice)).not.toThrow();
    });

    it('should throw for null device', () => {
      expect(() => validateConstructedDevice(null as any)).toThrow(ValidationError);
    });

    it('should throw for invalid idx (zero)', () => {
      const invalidDevice = makeInvalidDevice({ idx: 0 });
      expect(() => validateConstructedDevice(invalidDevice)).toThrow(ValidationError);
      expect(() => validateConstructedDevice(invalidDevice)).toThrow('idx invalide');
    });

    it('should throw for invalid idx (negative)', () => {
      const invalidDevice = makeInvalidDevice({ idx: -1 });
      expect(() => validateConstructedDevice(invalidDevice)).toThrow(ValidationError);
    });

    it('should throw for invalid level (negative)', () => {
      const invalidDevice = new DomoticzDevice({ ...validDevice, level: -10 });
      expect(() => validateConstructedDevice(invalidDevice)).toThrow(ValidationError);
      expect(() => validateConstructedDevice(invalidDevice)).toThrow('level invalide');
    });

    it('should throw for invalid level (> 100)', () => {
      const invalidDevice = new DomoticzDevice({ ...validDevice, level: 150 });
      expect(() => validateConstructedDevice(invalidDevice)).toThrow(ValidationError);
    });

    it('should throw for invalid name (empty)', () => {
      const invalidDevice = new DomoticzDevice({ ...validDevice, name: '' });
      expect(() => validateConstructedDevice(invalidDevice)).toThrow(ValidationError);
      expect(() => validateConstructedDevice(invalidDevice)).toThrow('name');
    });

    it('should throw for invalid name (whitespace only)', () => {
      const invalidDevice = new DomoticzDevice({ ...validDevice, name: '   ' });
      expect(() => validateConstructedDevice(invalidDevice)).toThrow(ValidationError);
    });
  });

  // ===== validateConstructedThermostat =====
  describe('validateConstructedThermostat', () => {
    const validThermostat = new DomoticzThermostat(
      99,
      'Thermostat Salon',
      '2025-01-01 12:00:00',
      true,
      21.5,
      DomoticzDeviceType.THERMOSTAT,
      'Heating',
      '20.5 °C',
      '°C'
    );

    /** Crée un DomoticzThermostat en court-circuitant le constructeur pour tester des valeurs invalides */
    function makeInvalidThermostat(overrides: Record<string, unknown>): DomoticzThermostat {
      return Object.assign(Object.create(DomoticzThermostat.prototype), {
        idx: 99,
        _rang: 0,
        name: 'Thermostat Salon',
        lastUpdate: '2025-01-01 12:00:00',
        isActive: true,
        _temp: 21.5,
        type: DomoticzDeviceType.THERMOSTAT,
        _status: 'Heating',
        data: '20.5 °C',
        unit: '°C',
      }, overrides) as DomoticzThermostat;
    }

    it('should accept valid constructed thermostat', () => {
      expect(() => validateConstructedThermostat(validThermostat)).not.toThrow();
    });

    it('should throw for invalid idx', () => {
      const invalidThermostat = makeInvalidThermostat({ idx: 0 });
      expect(() => validateConstructedThermostat(invalidThermostat)).toThrow(ValidationError);
    });

    it('should throw for invalid temp (too low)', () => {
      const invalidThermostat = new DomoticzThermostat(
        99,
        'Name',
        '2025-01-01',
        true,
        2,
        DomoticzDeviceType.THERMOSTAT,
        'Off',
        'data',
        '°C'
      );
      expect(() => validateConstructedThermostat(invalidThermostat)).toThrow(ValidationError);
      expect(() => validateConstructedThermostat(invalidThermostat)).toThrow('temp invalide');
    });

    it('should throw for invalid temp (too high)', () => {
      const invalidThermostat = new DomoticzThermostat(
        99,
        'Name',
        '2025-01-01',
        true,
        40,
        DomoticzDeviceType.THERMOSTAT,
        'Off',
        'data',
        '°C'
      );
      expect(() => validateConstructedThermostat(invalidThermostat)).toThrow(ValidationError);
    });

    it('should throw for invalid name', () => {
      const invalidThermostat = new DomoticzThermostat(
        99,
        '',
        '2025-01-01',
        true,
        21,
        DomoticzDeviceType.THERMOSTAT,
        'Off',
        'data',
        '°C'
      );
      expect(() => validateConstructedThermostat(invalidThermostat)).toThrow(ValidationError);
    });
  });

  // ===== validateConstructedTemperature =====
  describe('validateConstructedTemperature', () => {
    const validTemp = new DomoticzTemperature({
      idx: '50',
      rang: 0,
      name: 'Salon',
      lastUpdate: '2025-01-01 12:00:00',
      temp: 22.5,
      humidity: 65,
      humidityStatus: 'Confortable',
      type: 'Temp+Humidity',
      subType: 'TH',
      status: 'Ok',
      data: 'some data',
    });

    it('should accept valid constructed temperature', () => {
      expect(() => validateConstructedTemperature(validTemp)).not.toThrow();
    });

    it('should throw for null temperature', () => {
      expect(() => validateConstructedTemperature(null as any)).toThrow(ValidationError);
    });

    it('should throw for invalid temp (too low)', () => {
      const invalidTemp = new DomoticzTemperature({
        ...validTemp,
        temp: -60,
      });
      expect(() => validateConstructedTemperature(invalidTemp)).toThrow(ValidationError);
      expect(() => validateConstructedTemperature(invalidTemp)).toThrow('entre -50 et 60');
    });

    it('should throw for invalid temp (too high)', () => {
      const invalidTemp = new DomoticzTemperature({
        ...validTemp,
        temp: 70,
      });
      expect(() => validateConstructedTemperature(invalidTemp)).toThrow(ValidationError);
    });

    it('should throw for invalid humidity (negative)', () => {
      const invalidTemp = new DomoticzTemperature({
        ...validTemp,
        humidity: -5,
      });
      expect(() => validateConstructedTemperature(invalidTemp)).toThrow(ValidationError);
      expect(() => validateConstructedTemperature(invalidTemp)).toThrow('Humidité construite invalide');
    });

    it('should throw for invalid humidity (> 100)', () => {
      const invalidTemp = new DomoticzTemperature({
        ...validTemp,
        humidity: 150,
      });
      expect(() => validateConstructedTemperature(invalidTemp)).toThrow(ValidationError);
    });

    it('should throw for invalid name (empty)', () => {
      const invalidTemp = new DomoticzTemperature({
        ...validTemp,
        name: '',
      });
      expect(() => validateConstructedTemperature(invalidTemp)).toThrow(ValidationError);
    });

    it('should throw for invalid name (whitespace)', () => {
      const invalidTemp = new DomoticzTemperature({
        ...validTemp,
        name: '  ',
      });
      expect(() => validateConstructedTemperature(invalidTemp)).toThrow(ValidationError);
    });
  });

  // ===== ValidationError class =====
  describe('ValidationError', () => {
    it('should be instanceof Error', () => {
      const error = new ValidationError('Test error');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct properties', () => {
      const error = new ValidationError('Test error', 'fieldName', 'fieldValue');
      expect(error.message).toBe('Test error');
      expect(error.fieldName).toBe('fieldName');
      expect(error.fieldValue).toBe('fieldValue');
    });

    it('should have correct name', () => {
      const error = new ValidationError('Test error');
      expect(error.name).toBe('ValidationError');
    });
  });
});
