import { publicProcedure, router } from '..';
import { z } from 'zod';
import { fakeTask } from '../../mock-data/fake-task';

export const tasksRouter = router({
  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async () => {
      // let's just pretend for now
      return fakeTask;
    }),
});
