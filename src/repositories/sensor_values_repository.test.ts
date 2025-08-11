import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { SensorValuesRepository } from "./sensor_values_repository";
import { database } from "../database";

describe("SensorValuesRepository", () => {
  beforeEach(() => {
    database.clear();
  });

  it("should create", async () => {
    const entry = {
      sensor_id: 1,
      values: [1, 2, 3],
    };

    const result = await SensorValuesRepository.create(entry);

    assert.equal(typeof result.timestamp, "number");
    assert.equal(result.sensor_id, entry.sensor_id);
    assert.deepEqual(result.values, entry.values);
    assert(result.timestamp > 0);
  });

  it("should be able to list with a filter", async () => {
    const entries = [
      {
        sensor_id: 1,
        values: [1, 2, 3],
      },
      {
        sensor_id: 2,
        values: [3, 2, 1],
      },
    ];
    
    await Promise.all(entries.map((entry) => SensorValuesRepository.create(entry)));

    const list = await SensorValuesRepository.list(
      (value) => value.sensor_id === 2
    );

    assert.equal(list.length, 1);
    assert.equal(list[0].sensor_id, 2);
    assert.deepEqual(list[0].values, [3, 2, 1]);
  });

  it("should read by timestamp", async () => {
    const entry = {
      sensor_id: 1,
      values: [1, 2, 3],
    };

    const created = await SensorValuesRepository.create(entry);
    const result = await SensorValuesRepository.read(created.timestamp);

    assert.deepEqual(result, created);
  });

  it("should update by timestamp", async () => {
    const entry = {
      sensor_id: 1,
      values: [1, 2, 3],
    };

    const created = await SensorValuesRepository.create(entry);
    const updated = await SensorValuesRepository.update(created.timestamp, {
      sensor_id: 1,
      values: [4, 5, 6],
    });

    assert.equal(updated.timestamp, created.timestamp);
    assert.deepEqual(updated.values, [4, 5, 6]);
  });

  it("should delete by timestamp", async () => {
    const entry = {
      sensor_id: 1,
      values: [1, 2, 3],
    };

    const created = await SensorValuesRepository.create(entry);
    await SensorValuesRepository.delete(created.timestamp);

    const list = await SensorValuesRepository.list();
    assert.equal(list.length, 0);
  });
});
