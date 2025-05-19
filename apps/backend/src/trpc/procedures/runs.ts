import { publicProcedure, router } from '..';
import { createInstance } from '../../lib/instances-pool';
import { z } from 'zod';
import { prisma } from '../../prisma';

export const runsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const task = await prisma.task.findUnique({
        where: { id: input.taskId },
      });
      if (!task) {
        throw new Error('Task not found');
      }

      // create a taskrun first
      const taskRun = await prisma.taskRun.create({
        data: {
          taskId: task.id,
          name: task.name,
          steps: task.steps,
          messages: [],
        },
      });
      console.log('TaskRun created:', taskRun);

      const instance = await createInstance(taskRun.id);

      const prompt = taskRun.steps[0].instructions; //starting simple
      const messages: unknown[] = [];
      instance.on('data', (data: unknown) => {
        console.log('Received data:', data);
        messages.push(data);
        prisma.taskRun
          .update({
            where: { id: taskRun.id },
            data: {
              messages: messages,
            },
          })
          .then(() => {
            console.log('Messages updated in database');
          })
          .catch((error) => {
            console.error('Error updating messages in database:', error);
          });
      });
      console.log('Prompt:', prompt);
      console.log('Executing prompt...');
      instance
        .executePrompt(prompt)
        .then(() => instance.stopAndRemoveContainer()) // for now, stop immediately
        .catch((error) => {
          console.error('Error executing prompt:', error);
          throw new Error('Failed to execute prompt');
        })
        .catch((error) => {
          console.error('Error stopping container:', error);
          throw new Error('Failed to stop container');
        });
      return {
        id: taskRun.id,
      };
    }),

  byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const taskRun = await prisma.taskRun.findUnique({
      where: { id: input.id },
    });
    if (!taskRun) {
      throw new Error('TaskRun not found');
    }
    return taskRun;
  }),
});
