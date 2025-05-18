/* eslint-disable @typescript-eslint/no-namespace */
export type TaskStep = {
  instructions: string;
  checks: string;
};

export type Task = {
  name: string;
  steps: TaskStep[];
};

declare global {
  namespace PrismaJson {
    type TaskSteps = TaskStep[];
  }
}

export {};
