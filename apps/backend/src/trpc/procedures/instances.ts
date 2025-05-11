import { publicProcedure, router } from "..";
import ClaudeInstance from "../../lib/ClaudeInstance";
import { docker } from "../../lib/docker";
import {
  addInstance,
  getInstance,
  listInstances,
  removeInstance,
} from "../../lib/instances";
import { z } from "zod";

export const instancesRouter = router({
  create: publicProcedure.mutation(async () => {
    const instance = new ClaudeInstance({
      apiKey: process.env.ANTHROPIC_API_KEY as string,
      docker,
    });
    await instance.createContainer();
    addInstance(instance);
    return {
      id: instance.getPort(),
      status: "created",
    };
  }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      const instance = getInstance(input.id);
      return {
        id: instance.getPort(),
        status: instance.getStatus(),
      };
    }),

  remove: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ input }) => {
      const instance = getInstance(input.id);
      instance.stopAndRemoveContainer();
      removeInstance(input.id);
      return { status: "removed" };
    }),

  list: publicProcedure.query(() => {
    const instances = listInstances();
    return instances.map((instance) => ({
      id: instance.id,
      status: instance.instance.getStatus(),
    }));
  }),
});
