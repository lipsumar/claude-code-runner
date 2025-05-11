import { publicProcedure, router } from '..';
import ClaudeInstance from '../../lib/ClaudeInstance';
import { docker } from '../../lib/docker';
import { addInstance, getInstance, listInstances, removeInstance } from '../../lib/instances';
import { z } from 'zod';

export const instancesRouter = router({
  create: publicProcedure.mutation(async () => {
    const instance = new ClaudeInstance({
      apiKey: process.env.ANTHROPIC_API_KEY as string,
      docker,
    });
    await instance.createContainer();
    const id = await addInstance(instance);
    return {
      id,
      status: 'created',
    };
  }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const instance = await getInstance(input.id);
      return {
        id: input.id,
        status: instance.getStatus(),
      };
    }),

  remove: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const instance = await getInstance(input.id);
      instance.stopAndRemoveContainer();
      await removeInstance(input.id);
      return { status: 'removed' };
    }),

  list: publicProcedure.query(async () => {
    const instances = await listInstances();
    return instances.map((instance) => ({
      id: instance.id,
      status: instance.instance.getStatus(),
    }));
  }),
});
