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
    try {
      const { id } = z
        .object({
          id: z.coerce.number().nonnegative(),
        })
        .parse(ctx.params);

      const sensor = await SensorsRepository.read(id);
      const sensorValues = await SensorValuesRepository.list(
        (value) => value.sensor_id === id
      );

      const transformedValues = sensorValues.map(value => {
        const average = value.values.reduce((sum, val) => sum + val, 0) / value.values.length;
        return [value.timestamp, average];
      });

      ctx.body = {
        ...sensor,
        values: transformedValues,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        ctx.status = 400;
        ctx.body = { 
          error: "Invalid sensor ID format. Please provide a valid non-negative number.",
          details: error.errors 
        };
        return;
      }

      if (error instanceof Error && error.message.includes("Failed to find Sensor")) {
        ctx.status = 404;
        ctx.body = { 
          error: `Sensor with ID ${ctx.params.id} not found.`,
          message: error.message 
        };
        return;
      }

      console.error("Unexpected error in SensorsController.read:", error);
      ctx.status = 500;
      ctx.body = { 
        error: "An unexpected error occurred while reading the sensor.",
        message: "Please try again later or contact support if the problem persists."
      };
    }
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
