import type { ClaudeCodeTodo } from './types';

export type TodoInput = {
  todos: ClaudeCodeTodo[];
};

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isClaudeCodeTodo(value: unknown): value is ClaudeCodeTodo {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    isString(obj.id) && isString(obj.content) && isString(obj.status) && isString(obj.priority)
  );
}

export function isTodoInput(value: unknown): value is TodoInput {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (!Array.isArray(obj.todos)) {
    return false;
  }

  return obj.todos.every((item) => isClaudeCodeTodo(item));
}

export type BashInput = {
  command: string;
  description?: string;
};
export function isBashInput(value: unknown): value is BashInput {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return isString(obj.command) && (obj.description === undefined || isString(obj.description));
}

export type ReadInput = {
  file_path: string;
};
export function isReadInput(value: unknown): value is ReadInput {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return isString(obj.file_path);
}
