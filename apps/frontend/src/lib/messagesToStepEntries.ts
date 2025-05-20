import type { ContentBlock, ContentBlockParam, TaskMessages, WrappedMessage } from 'backend';
import {
  isBashInput,
  isReadInput,
  isTodoInput,
  isWriteInput,
  type BashInput,
} from './toolInputValidation';
import type { ClaudeCodeTodo } from './types';
import { todoStatusDiff, type TodoDiff } from './todoDiff';

type TextStepEntry = {
  type: 'text';
  text: string;
};
type TodoCreateStepEntry = {
  type: 'todoCreate';
  todos: ClaudeCodeTodo[];
};
type TodoUpdateStepEntry = {
  type: 'todoUpdate';
  todoDiffs: TodoDiff[];
};
type BashStepEntry = {
  type: 'bash';
  command: string;
  description: string;
  output: string;
  isError: boolean;
};
export type ReadStepEntry = {
  type: 'read';
  filePath: string;
  content: string;
};
export type WriteStepEntry = {
  type: 'write';
  filePath: string;
  content: string;
};

export type StepEntry =
  | TextStepEntry
  | TodoCreateStepEntry
  | TodoUpdateStepEntry
  | BashStepEntry
  | ReadStepEntry
  | WriteStepEntry;

export function messageToStepEntries(wrappedMessages: WrappedMessage[]): StepEntry[] {
  const entries: StepEntry[] = [];
  const messages = wrappedMessages.map((m) => m.message);
  const blocks = messagesToBlocks(messages);
  let todoList: ClaudeCodeTodo[] = [];
  const toolNameById: Record<string, string> = {};
  let runningBashCommand: {
    toolUseId: string;
    bashInput: BashInput;
  } | null = null;
  let runningReadCommand: {
    toolUseId: string;
    readInput: {
      filePath: string;
    };
  } | null = null;

  for (const block of blocks) {
    if (block.type === 'text') {
      entries.push(block);
    }

    if (block.type === 'tool_use') {
      toolNameById[block.id] = block.name;
    }

    if (block.type === 'tool_use' && block.name === 'TodoWrite') {
      if (!isTodoInput(block.input)) {
        throw new Error('tool_use: TodoWrite: unexpected input');
      }
      if (todoList.length === 0) {
        entries.push({
          type: 'todoCreate',
          todos: block.input.todos,
        });
        todoList = block.input.todos;
      } else {
        const todoDiffs = todoStatusDiff(todoList, block.input.todos);
        if (todoDiffs.length === 0) {
          console.warn('no todo diffs');
        }
        entries.push({
          type: 'todoUpdate',
          todoDiffs,
        });
        todoList = block.input.todos;
      }
    }

    if (block.type === 'tool_use' && block.name === 'Bash') {
      if (!isBashInput(block.input)) {
        throw new Error('tool_use: Bash: unexpected input');
      }
      runningBashCommand = {
        toolUseId: block.id,
        bashInput: block.input,
      };
      continue;
    }

    if (block.type === 'tool_use' && block.name === 'Read') {
      if (!isReadInput(block.input)) {
        throw new Error('tool_use: Read: unexpected input');
      }
      runningReadCommand = {
        toolUseId: block.id,
        readInput: {
          filePath: block.input.file_path,
        },
      };
      continue;
    }

    if (block.type === 'tool_use' && block.name === 'Write') {
      if (!isWriteInput(block.input)) {
        throw new Error('tool_use: Write: unexpected input');
      }
      entries.push({
        type: 'write',
        filePath: block.input.file_path,
        content: block.input.content,
      });
      continue;
    }

    if (block.type === 'tool_result') {
      const toolName = toolNameById[block.tool_use_id];
      if (toolName === 'TodoWrite') {
        // ignore for now, seems to always be a comfirmation message
      } else if (toolName === 'Bash') {
        if (!runningBashCommand) {
          throw new Error('tool_result: Bash: no running command');
        }
        if (typeof block.content !== 'string') {
          throw new Error('tool_result: Bash: unexpected content (not string)');
        }
        entries.push({
          type: 'bash',
          command: runningBashCommand.bashInput.command,
          description: runningBashCommand.bashInput.description || '',
          output: block.content,
          isError: block.is_error ?? false,
        });
      } else if (toolName === 'Read') {
        if (!runningReadCommand) {
          throw new Error('tool_result: Read: no running command');
        }
        if (typeof block.content !== 'string') {
          throw new Error('tool_result: Read: unexpected content (not string)');
        }
        entries.push({
          type: 'read',
          filePath: runningReadCommand.readInput.filePath,
          content: block.content,
        });
      }
    }

    runningBashCommand = null;
    runningReadCommand = null;
  }

  return entries;
}

function messagesToBlocks(messages: TaskMessages) {
  const nonSystemMessages = messages.filter((m) => m.role !== 'system');
  const blocks: (ContentBlock | ContentBlockParam)[] = nonSystemMessages.flatMap((m) => {
    if (typeof m.content === 'string') {
      return [{ type: 'text', text: m.content, citations: null }];
    }

    // Transform ContentBlockParam to ContentBlock if needed
    if (Array.isArray(m.content)) {
      return m.content.map((block) => transformToContentBlock(block));
    }

    return m.content;
  });
  return blocks;
}

function transformToContentBlock(param: ContentBlockParam): ContentBlock {
  if ('citations' in param && param.citations === undefined) {
    return { ...param, citations: null } as ContentBlock;
  }
  return param as ContentBlock;
}
