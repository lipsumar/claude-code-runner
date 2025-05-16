import type { ClaudeCodeTodo } from './types';

export type TodoDiff = {
  id: string;
  content: string;
  from: ClaudeCodeTodo['status'];
  to: ClaudeCodeTodo['status'];
};

export function todoStatusDiff(
  todosBase: ClaudeCodeTodo[],
  todosUpdated: ClaudeCodeTodo[],
): TodoDiff[] {
  const todosBaseMap = new Map<string, ClaudeCodeTodo>(todosBase.map((todo) => [todo.id, todo]));
  const todosUpdatedMap = new Map<string, ClaudeCodeTodo>(
    todosUpdated.map((todo) => [todo.id, todo]),
  );

  const diffs: TodoDiff[] = [];

  for (const [id, todo] of todosUpdatedMap.entries()) {
    const baseTodo = todosBaseMap.get(id);
    if (baseTodo && baseTodo.status !== todo.status) {
      diffs.push({ id, from: baseTodo.status, to: todo.status, content: todo.content });
    }
  }

  return diffs;
}
