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

import { Message, MessageParam } from '@anthropic-ai/sdk/resources/messages';

// LaxMessage is a Message but with a more lax type for `usage`
type LaxMessage = Omit<Message, 'usage'> & {
  usage: {
    input_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
    output_tokens: number;
  };
};

type SystemMessage = {
  role: 'system';
  cost_usd: number;
  duration_ms: number;
  duration_api_ms: number;
  result: unknown;
  session_id: string;
};

export type TaskMessages = (LaxMessage | MessageParam | SystemMessage | InternalMesssage)[];

export type WrappedMessage = {
  type: string;
  session_id: string;
  message: LaxMessage | MessageParam | SystemMessage | InternalMesssage;
};
export type InternalMesssage = {
  role: 'internal';
  content: InternalContentBlock[];
};
export type InternalContentBlock = { internal: true; type: string; data: string };

export {};
