import { z } from "zod";
import { SensorValuesRepository } from "../repositories/sensor_values_repository";
import { Sensor, SensorsRepository } from "../repositories/sensors_repository";
import { Controller } from "./_controller";

export const SensorsController: Controller = {
  async list(ctx) {
    const list = await SensorsRepository.list();
    ctx.body = list;
  },

  async read(ctx) {
    const { id } = z
      .object({
        id: z.coerce.number().nonnegative(),
      })
      .parse(ctx.params);

    const sensor = await SensorsRepository.read(id);
    const values = await SensorValuesRepository.list(
      (value) => value.sensor_id === id
    );

    ctx.body = {
      ...sensor,
      values,
    };
  },

  async update(ctx) {
    const { id } = z
      .object({
        id: z.coerce.number().nonnegative(),
      })
      .parse(ctx.params);

    let updateData;
    try {
      updateData = z
        .object({
          name: z.string().min(1, "Name cannot be empty"),
        })
        .strict()
        .parse(ctx.request.body);
    } catch (err) {
      ctx.status = 400;
      ctx.body = { error: "Invalid request body: unrecognized key or invalid data" };
      return;
    }

    const sensor = await SensorsRepository.update(id, updateData);

    ctx.body = {
      ...sensor,
    };
  },

  async delete(ctx) {
    const { id } = z
      .object({
        id: z.coerce.number().nonnegative(),
      })
      .parse(ctx.params);

    await SensorsRepository.delete(id);

    ctx.status = 204;
  },
};
