import Koa from "koa";
import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { database } from "../database";
import { SensorsController } from "./sensors_controller";
import { SensorsRepository } from "../repositories/sensors_repository";
import { SensorValuesRepository } from "../repositories/sensor_values_repository";

describe("SensorsController", () => {
  beforeEach(() => {
    database.clear();
  });

  it("should read sensors including sensor values", async () => {
    if (!SensorsController.read) {
      assert.fail("SensorsController.read not implemented");
    }
    SensorsRepository.create({ name: "Sensor Name" });
    SensorValuesRepository.create({
      timestamp: 123456789,
      sensor_id: 1,
      values: [1, 2, 3],
    });
    SensorValuesRepository.create({
      timestamp: 123456790,
      sensor_id: 1,
      values: [5, 4, 3],
    });

    const ctx = { params: { id: 1 }, body: {} } as unknown as Koa.Context;
    await SensorsController.read(ctx);

    assert.deepEqual(ctx.body, {
      id: 1,
      name: "Sensor Name",
      values: [
        [123456789, 2],
        [123456790, 4],
      ],
    });
  });

  it("should not read sensors with invalid ID", async () => {
    if (!SensorsController.read) {
      assert.fail("SensorsController.read not implemented");
    }
    const ctx = { params: { id: "invalid" }, body: {} } as unknown as Koa.Context;
    await SensorsController.read(ctx);

    assert.equal(ctx.status, 400);
    assert.equal((ctx.body as any).error, "Invalid sensor ID format. Please provide a valid non-negative number.");
  });

  it("should return 404 if sensor not found", async () => {
    if (!SensorsController.read) {
      assert.fail("SensorsController.read not implemented");
    }
    const ctx = { params: { id: 1 }, body: {} } as unknown as Koa.Context;
    await SensorsController.read(ctx);

    assert.equal(ctx.status, 404);
    assert.equal((ctx.body as any).error, "Sensor with ID 1 not found.");
  });

  it("should update sensors correctly", async () => {
    if (!SensorsController.update) {
      assert.fail("SensorsController.update not implemented");
    }
    SensorsRepository.create({ name: "Initial Name" });

    const ctx = {
      params: { id: 1 },
      request: { body: { name: "Updated Name" } },
      body: {},
    } as unknown as Koa.Context;
    await SensorsController.update(ctx);

    assert.deepEqual(ctx.body, { id: 1, name: "Updated Name" });
  });

  it("should not update sensors with invalid data", async () => {
    if (!SensorsController.update) {
      assert.fail("SensorsController.update not implemented");
    }
    SensorsRepository.create({ name: "Initial Name" });

    const ctx = {
      params: { id: 1 },
      request: { body: { name: "Updated Name", invalid: "Invalid" } },
      body: {},
    } as unknown as Koa.Context;
    await SensorsController.update(ctx);

    assert.equal(ctx.status, 400);
    assert.equal(database.sensors[1].name, "Initial Name");
  });

  it("should delete sensors correctly", async () => {
    if (!SensorsController.delete) {
      assert.fail("SensorsController.delete not implemented");
    }
    SensorsRepository.create({ name: "Sensor Name" });

    const ctx = { params: { id: 1 }, body: {} } as unknown as Koa.Context;
    await SensorsController.delete(ctx);

    assert.equal(ctx.status, 204);
    assert.equal(database.sensors[1], undefined);
  });
});
