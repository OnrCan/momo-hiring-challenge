import { database } from "../database";
import { TimestampRepository } from "./_repository";

export type SensorValue = {
  timestamp: number;
  sensor_id: number;
  values: number[];
};

export const SensorValuesRepository: TimestampRepository<SensorValue> = {
  async list(filter) {
    if (filter) {
      return database.sensorValues.filter(filter);
    }
    return database.sensorValues;
  },

  async create(data) {
    const timestamp = Date.now();
    const value: SensorValue = {
      timestamp,
      ...data,
    };
    database.sensorValues.push(value);
    return value;
  },

  async read(timestamp) {
    const value = database.sensorValues.find((value) => value.timestamp === timestamp);
    if (!value) {
      throw new Error(`Failed to find SensorValue with timestamp '${timestamp}'`);
    }
    return value;
  },

  async update(timestamp, data) {
    const index = database.sensorValues.findIndex((value) => value.timestamp === timestamp);
    if (index === -1) {
      throw new Error(`Failed to find SensorValue with timestamp '${timestamp}'`);
    }
    const value = { timestamp, ...data };
    database.sensorValues[index] = value;
    return value;
  },

  async delete(timestamp) {
    const index = database.sensorValues.findIndex((value) => value.timestamp === timestamp);
    if (index === -1) {
      throw new Error(`Failed to find SensorValue with timestamp '${timestamp}'`);
    }
    database.sensorValues.splice(index, 1);
  },
};
