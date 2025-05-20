import { publicProcedure, router } from '..';
import { createInstance, getInstance } from '../../lib/instances-pool';
import { z } from 'zod';
import { prisma } from '../../prisma';
import { on } from 'events';

export const runsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
        repository: z.string(),
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
          repository: input.repository,
        },
      });
      console.log('TaskRun created:', taskRun);

      const instance = await createInstance(taskRun.id);

      const prompt = taskRun.steps[0].instructions; //starting simple
      const messages: unknown[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      instance.on('data', (data: any) => {
        if (!('message' in data)) {
          console.log('No message in data, ignoring ->', data);
          return;
        }
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

      console.log('Cloning repository:', input.repository);
      instance
        .initGitConfig({
          email: process.env.GITHUB_USER_EMAIL as string,
          githubUsername: process.env.GITHUB_USER_USERNAME as string,
          sshPrivateKey: process.env.GITHUB_USER_PRIVATE_KEY as string,
          sshPublicKey: process.env.GITHUB_USER_PUBLIC_KEY as string,
        })
        .then(() => {
          instance.cloneRepository(input.repository).then(() => {
            console.log('Prompt:', prompt);
            console.log('Executing prompt...');
            instance
              .executePrompt(prompt)
              //.then(() => instance.stopAndRemoveContainer()) // for now, stop immediately
              .catch((error) => {
                console.error('Error executing prompt:', error);
                throw new Error('Failed to execute prompt');
              })
              .catch((error) => {
                console.error('Error stopping container:', error);
                throw new Error('Failed to stop container');
              });
          });
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

  onMessage: publicProcedure.input(z.object({ id: z.string() })).subscription(async function* ({
    input,
    signal,
  }) {
    // find instance for this taskRun
    const dbInstance = await prisma.claudeInstance.findUniqueOrThrow({
      where: { taskRunId: input.id },
    });

    const instance = await getInstance(dbInstance.id);
    if (!instance) {
      throw new Error('Instance not found');
    }

    const dataIterator = on(instance, 'data', {
      // Passing the AbortSignal from the request automatically cancels the event emitter when the request is aborted
      signal,
    });

    for await (const [data] of dataIterator) {
      if (!('message' in data)) {
        continue;
      }
      //console.log('Yielding data:', data);
      yield data;
    }
  }),
});
