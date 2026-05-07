/**
 * Service de Validation pour les Structures Domoticz
 * 
 * Centralise la validation des données reçues de l'API Domoticz.
 * Valide :
 * - Structures de réponse API (présence de champs requis)
 * - Types de données (idx doit être number, etc.)
 * - Plages de valeurs (level 0-100, temperature min/max, etc.)
 * 
 * Lève des exceptions explicites si validation échoue.
 */

import DomoticzDevice from '../models/domoticzDevice.model';
import DomoticzTemperature from '../models/domoticzTemperature.model';
import DomoticzThermostat from '../models/domoticzThermostat.model';
import { DomoticzDeviceType } from '../enums/DomoticzEnum';

/**
 * Erreur de validation structurée
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public fieldName?: string,
    public fieldValue?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Valide une réponse générique de l'API Domoticz
 * Vérifie que la réponse contient les champs requis : status et result
 * 
 * @param data Réponse brute de l'API
 * @throws {ValidationError} Si structure invalide
 */
export function validateDomoticzResponse(data: unknown): asserts data is { status: string; result: unknown[] } {
  if (!data || typeof data !== 'object') {
    throw new ValidationError(
      'La réponse API doit être un objet valide',
      'response',
      data
    );
  }

  const responseData = data as Record<string, unknown>;

  if (typeof responseData.status !== 'string') {
    throw new ValidationError(
      'Le champ "status" manque ou n\'est pas une chaîne',
      'status',
      responseData.status
    );
  }

  if (!Array.isArray(responseData.result)) {
    throw new ValidationError(
      'Le champ "result" doit être un tableau',
      'result',
      responseData.result
    );
  }
}

/**
 * Valide un objet device brut avant transformation en DomoticzDevice
 * Vérifie les champs requis et types
 * 
 * @param rawDevice Appareil brut de l'API
 * @throws {ValidationError} Si validation échoue
 */
export function validateRawDevice(rawDevice: unknown): asserts rawDevice is Record<string, unknown> {
  if (!rawDevice || typeof rawDevice !== 'object') {
    throw new ValidationError(
      'Un appareil doit être un objet valide',
      'device',
      rawDevice
    );
  }

  const device = rawDevice as Record<string, unknown>;

  // Champs requis
  const requiredFields = ['idx', 'Name', 'Status', 'Type', 'LastUpdate'];
  for (const field of requiredFields) {
    if (!(field in device)) {
      throw new ValidationError(
        `Champ requis manquant: "${field}"`,
        field,
        undefined
      );
    }
  }

  // Validation des types
  if (typeof device.idx !== 'string' && typeof device.idx !== 'number') {
    throw new ValidationError(
      'Le champ "idx" doit être un nombre ou chaîne',
      'idx',
      device.idx
    );
  }

  if (typeof device.Name !== 'string') {
    throw new ValidationError(
      'Le champ "Name" doit être une chaîne',
      'Name',
      device.Name
    );
  }

  if (typeof device.LastUpdate !== 'string') {
    throw new ValidationError(
      'Le champ "LastUpdate" doit être une chaîne',
      'LastUpdate',
      device.LastUpdate
    );
  }

  // Champ optionnel mais validé s'il existe
  if ('Level' in device && typeof device.Level !== 'number') {
    throw new ValidationError(
      'Le champ "Level" doit être un nombre',
      'Level',
      device.Level
    );
  }

  if ('HaveTimeout' in device && typeof device.HaveTimeout !== 'boolean') {
    throw new ValidationError(
      'Le champ "HaveTimeout" doit être un booléen',
      'HaveTimeout',
      device.HaveTimeout
    );
  }
}

/**
 * Valide un objet température brut avant transformation en DomoticzTemperature
 * 
 * @param rawTemp Température brute de l'API
 * @throws {ValidationError} Si validation échoue
 */
export function validateRawTemperature(rawTemp: unknown): asserts rawTemp is Record<string, unknown> {
  if (!rawTemp || typeof rawTemp !== 'object') {
    throw new ValidationError(
      'Une température doit être un objet valide',
      'temperature',
      rawTemp
    );
  }

  const temp = rawTemp as Record<string, unknown>;

  // Champs requis pour une sonde température
  const requiredFields = ['idx', 'Name', 'Type', 'Temp', 'Humidity', 'LastUpdate'];
  for (const field of requiredFields) {
    if (!(field in temp)) {
      throw new ValidationError(
        `Champ requis manquant pour température: "${field}"`,
        field,
        undefined
      );
    }
  }

  // Validation des types critiques
  if (typeof temp.Temp !== 'number') {
    throw new ValidationError(
      'Le champ "Temp" doit être un nombre',
      'Temp',
      temp.Temp
    );
  }

  if (typeof temp.Humidity !== 'number') {
    throw new ValidationError(
      'Le champ "Humidity" doit être un nombre',
      'Humidity',
      temp.Humidity
    );
  }

  // Validations plausibles
  if (temp.Temp < -50 || temp.Temp > 60) {
    throw new ValidationError(
      `Température invalide (${temp.Temp}°C) - doit être entre -50 et 60°C`,
      'Temp',
      temp.Temp
    );
  }

  if (temp.Humidity < 0 || temp.Humidity > 100) {
    throw new ValidationError(
      `Humidité invalide (${temp.Humidity}%) - doit être entre 0 et 100%`,
      'Humidity',
      temp.Humidity
    );
  }
}

/**
 * Valide un objet thermostat brut avant transformation en DomoticzThermostat
 * 
 * @param rawThermostat Thermostat brut de l'API
 * @throws {ValidationError} Si validation échoue
 */
export function validateRawThermostat(rawThermostat: unknown): asserts rawThermostat is Record<string, unknown> {
  // Réutilise la validation device (thermostat est un device spécifique)
  validateRawDevice(rawThermostat);

  const thermostat = rawThermostat as Record<string, unknown>;

  // Champs spécifiques au thermostat
  if (!('SetPoint' in thermostat)) {
    throw new ValidationError(
      'Champ requis pour thermostat manquant: "SetPoint"',
      'SetPoint',
      undefined
    );
  }

  if (typeof thermostat.SetPoint !== 'number' && typeof thermostat.SetPoint !== 'string') {
    throw new ValidationError(
      'Le champ "SetPoint" doit être un nombre ou chaîne',
      'SetPoint',
      thermostat.SetPoint
    );
  }

  // Validation de plausibilité pour SetPoint
  const setPointValue = typeof thermostat.SetPoint === 'string'
    ? parseFloat(thermostat.SetPoint)
    : thermostat.SetPoint;

  if (isNaN(setPointValue) || setPointValue < 5 || setPointValue > 35) {
    throw new ValidationError(
      `Consigne de thermostat invalide (${setPointValue}°C) - doit être entre 5 et 35°C`,
      'SetPoint',
      thermostat.SetPoint
    );
  }
}

/**
 * Valide qu'un device construit est valide
 * Vérifie les invariants de la classe DomoticzDevice
 * 
 * @param device Device construit
 * @throws {ValidationError} Si validation échoue
 */
export function validateConstructedDevice(device: DomoticzDevice): void {
  if (!device || typeof device !== 'object') {
    throw new ValidationError(
      'Device construit doit être un objet valide',
      'device',
      device
    );
  }

  if (device.idx <= 0) {
    throw new ValidationError(
      `Device idx invalide (${device.idx}) - doit être > 0`,
      'idx',
      device.idx
    );
  }

  if (device.level < 0 || device.level > 100) {
    throw new ValidationError(
      `Device level invalide (${device.level}) - doit être entre 0 et 100`,
      'level',
      device.level
    );
  }

  if (!device.type || typeof device.type !== 'string') {
    throw new ValidationError(
      'Device type invalide',
      'type',
      device.type
    );
  }

  if (typeof device.name !== 'string' || device.name.trim().length === 0) {
    throw new ValidationError(
      'Device name doit être une chaîne non-vide',
      'name',
      device.name
    );
  }
}

/**
 * Valide qu'un thermostat construit est valide
 * Vérifie les invariants de la classe DomoticzThermostat
 * 
 * @param thermostat Thermostat construit
 * @throws {ValidationError} Si validation échoue
 */
export function validateConstructedThermostat(thermostat: DomoticzThermostat): void {
  if (!thermostat || typeof thermostat !== 'object') {
    throw new ValidationError(
      'Thermostat construit doit être un objet valide',
      'thermostat',
      thermostat
    );
  }

  if (thermostat.idx <= 0) {
    throw new ValidationError(
      `Thermostat idx invalide (${thermostat.idx}) - doit être > 0`,
      'idx',
      thermostat.idx
    );
  }

  if (thermostat.temp < 5 || thermostat.temp > 35) {
    throw new ValidationError(
      `Thermostat temp invalide (${thermostat.temp}°C) - doit être entre 5 et 35°C`,
      'temp',
      thermostat.temp
    );
  }

  if (typeof thermostat.name !== 'string' || thermostat.name.trim().length === 0) {
    throw new ValidationError(
      'Thermostat name doit être une chaîne non-vide',
      'name',
      thermostat.name
    );
  }
}

/**
 * Valide qu'une température construite est valide
 * Vérifie les invariants de la classe DomoticzTemperature
 * 
 * @param temperature Température construite
 * @throws {ValidationError} Si validation échoue
 */
export function validateConstructedTemperature(temperature: DomoticzTemperature): void {
  if (!temperature || typeof temperature !== 'object') {
    throw new ValidationError(
      'Température construite doit être un objet valide',
      'temperature',
      temperature
    );
  }

  if (temperature.temp < -50 || temperature.temp > 60) {
    throw new ValidationError(
      `Température construite invalide (${temperature.temp}°C) - doit être entre -50 et 60°C`,
      'temp',
      temperature.temp
    );
  }

  if (temperature.humidity < 0 || temperature.humidity > 100) {
    throw new ValidationError(
      `Humidité construite invalide (${temperature.humidity}%) - doit être entre 0 et 100%`,
      'humidity',
      temperature.humidity
    );
  }

  if (typeof temperature.name !== 'string' || temperature.name.trim().length === 0) {
    throw new ValidationError(
      'Température name doit être une chaîne non-vide',
      'name',
      temperature.name
    );
  }
}
