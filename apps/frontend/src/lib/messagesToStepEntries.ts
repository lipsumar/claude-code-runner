import type {
  ContentBlock,
  ContentBlockParam,
  InternalContentBlock,
  TaskMessages,
  WrappedMessage,
} from 'backend';
import {
  isBashInput,
  isEditInput,
  isGrepInput,
  isReadInput,
  isTodoInput,
  isWriteInput,
  type BashInput,
} from './toolInputValidation';
import type { ClaudeCodeTodo } from './types';
import { todoStatusDiff, type TodoDiff } from './todoDiff';

type InternalUpdateEntry = {
  type: 'internal-update';
  content: string;
};
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
export type EditStepEntry = {
  type: 'edit';
  filePath: string;
  oldString: string;
  newString: string;
};
export type GrepStepEntry = {
  type: 'grep';
  path: string;
  pattern: string;
  content: string;
};

export type StepEntry =
  | TextStepEntry
  | TodoCreateStepEntry
  | TodoUpdateStepEntry
  | BashStepEntry
  | ReadStepEntry
  | WriteStepEntry
  | EditStepEntry
  | GrepStepEntry
  | InternalUpdateEntry;

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
  let runningGrepCommand: {
    toolUseId: string;
    grepInput: {
      path: string;
      pattern: string;
    };
  } | null = null;

  for (const block of blocks) {
    if ('internal' in block) {
      if (block.type === 'update') {
        entries.push({
          type: 'internal-update',
          content: block.data,
        });
      } else {
        console.warn('unknown internal message type', block);
      }
      continue;
    }

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

    if (block.type === 'tool_use' && block.name === 'Edit') {
      if (!isEditInput(block.input)) {
        throw new Error('tool_use: Edit: unexpected input');
      }
      entries.push({
        type: 'edit',
        filePath: block.input.file_path,
        oldString: block.input.old_string,
        newString: block.input.new_string,
      });
      continue;
    }

    if (block.type === 'tool_use' && block.name === 'Grep') {
      if (!isGrepInput(block.input)) {
        throw new Error('tool_use: Grep: unexpected input');
      }
      runningGrepCommand = {
        toolUseId: block.id,
        grepInput: {
          path: block.input.path,
          pattern: block.input.pattern,
        },
      };
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
      } else if (toolName === 'Grep') {
        if (!runningGrepCommand) {
          throw new Error('tool_result: Grep: no running command');
        }
        if (typeof block.content !== 'string') {
          throw new Error('tool_result: Grep: unexpected content (not string)');
        }
        entries.push({
          type: 'grep',
          path: runningGrepCommand.grepInput.path,
          pattern: runningGrepCommand.grepInput.pattern,
          content: block.content,
        });
      }
    }

    runningBashCommand = null;
    runningReadCommand = null;
    runningGrepCommand = null;
  }

  return entries;
}

function messagesToBlocks(messages: TaskMessages) {
  const nonSystemMessages = messages.filter((m) => m.role !== 'system');
  const blocks: (ContentBlock | ContentBlockParam | InternalContentBlock)[] =
    nonSystemMessages.flatMap((m) => {
      if (typeof m.content === 'string') {
        return [{ type: 'text', text: m.content, citations: null }];
      }

      if (m.role === 'internal') {
        return m.content as any; // TODO: fix this type. It's late and typescript is mean
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
