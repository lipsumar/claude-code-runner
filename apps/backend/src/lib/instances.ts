import ClaudeInstance from "./ClaudeInstance";

const instances: Record<string, ClaudeInstance> = {};

export function getInstance(id: string) {
  if (!instances[id]) {
    throw new Error(`Instance with id ${id} does not exist`);
  }
  return instances[id];
}

export function addInstance(instance: ClaudeInstance) {
  const id = instance.getPort().toString();
  if (instances[id]) {
    throw new Error(`Instance with id ${id} already exists`);
  }
  instances[id] = instance;
}

export function removeInstance(id: string) {
  if (!instances[id]) {
    throw new Error(`Instance with id ${id} does not exist`);
  }
  delete instances[id];
}

export function listInstances() {
  return Object.keys(instances).map((id) => ({
    id,
    instance: instances[id],
  }));
}
