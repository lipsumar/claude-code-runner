import { publicProcedure, router } from '..';
import { z } from 'zod';

import { prisma } from '../../prisma';

export const tasksRouter = router({
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return prisma.task.findUnique({
        where: { id: input.id },
      });
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        steps: z.array(
          z.object({
            instructions: z.string(),
            checks: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.task.create({
        data: {
          name: input.name,
          steps: input.steps,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        steps: z.array(
          z.object({
            instructions: z.string(),
            checks: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.task.update({
        where: { id: input.id },
        data: {
          name: input.name,
          steps: input.steps,
        },
      });
    }),

  list: publicProcedure.query(async () => {
    return prisma.task.findMany();
  }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.task.delete({
        where: { id: input.id },
      });
    }),
});
