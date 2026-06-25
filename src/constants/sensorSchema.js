
/**
 * Academic Context: Defines the exact 10 factory equipment sensors.
 * This immutable baseline configuration guarantees that both Zustand and Redux
 * operate on identical data shapes for objective performance comparison.
 */

export const SENSOR_IDS = {
  TEMPERATURE_01: 'TEMP_01',
  TEMPERATURE_02: 'TEMP_02',
  PRESSURE_01:    'PRES_01',
  PRESSURE_02:    'PRES_02',
  VIBRATION_01:   'VIB_01',
  VIBRATION_02:   'VIB_02',
  HUMIDITY_01:    'HUM_01',
  FLOW_RATE_01:   'FLOW_01',
  VOLTAGE_01:     'VOLT_01',
  CURRENT_01:     'CURR_01',
};

export const INITIAL_SENSORS_STATE = {
  [SENSOR_IDS.TEMPERATURE_01]: { id: SENSOR_IDS.TEMPERATURE_01, name: 'Main Boiler Temperature', value: 0, unit: '°C', status: 'offline', lastUpdated: null },
  [SENSOR_IDS.TEMPERATURE_02]: { id: SENSOR_IDS.TEMPERATURE_02, name: 'Cooling Loop Temperature', value: 0, unit: '°C', status: 'offline', lastUpdated: null },
  [SENSOR_IDS.PRESSURE_01]:    { id: SENSOR_IDS.PRESSURE_01, name: 'Hydraulic Press Pressure', value: 0, unit: 'PSI', status: 'offline', lastUpdated: null },
  [SENSOR_IDS.PRESSURE_02]:    { id: SENSOR_IDS.PRESSURE_02, name: 'Pneumatic Feed Pressure', value: 0, unit: 'PSI', status: 'offline', lastUpdated: null },
  [SENSOR_IDS.VIBRATION_01]:   { id: SENSOR_IDS.VIBRATION_01, name: 'Turbine Shaft Vibration', value: 0, unit: 'mm/s', status: 'offline', lastUpdated: null },
  [SENSOR_IDS.VIBRATION_02]:   { id: SENSOR_IDS.VIBRATION_02, name: 'Conveyor Motor Vibration', value: 0, unit: 'mm/s', status: 'offline', lastUpdated: null },
  [SENSOR_IDS.HUMIDITY_01]:    { id: SENSOR_IDS.HUMIDITY_01, name: 'Cleanroom Humidity', value: 0, unit: '%', status: 'offline', lastUpdated: null },
  [SENSOR_IDS.FLOW_RATE_01]:   { id: SENSOR_IDS.FLOW_RATE_01, name: 'Coolant Flow Rate', value: 0, unit: 'L/min', status: 'offline', lastUpdated: null },
  [SENSOR_IDS.VOLTAGE_01]:     { id: SENSOR_IDS.VOLTAGE_01, name: 'Main Transformer Voltage', value: 0, unit: 'V', status: 'offline', lastUpdated: null },
  [SENSOR_IDS.CURRENT_01]:     { id: SENSOR_IDS.CURRENT_01, name: 'CNC Machine Current', value: 0, unit: 'A', status: 'offline', lastUpdated: null },
};
