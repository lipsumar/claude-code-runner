import { publicProcedure, router } from '..';

import { getInstance, listInstances, removeInstance } from '../../lib/instances-pool';
import { z } from 'zod';

export const instancesRouter = router({
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
