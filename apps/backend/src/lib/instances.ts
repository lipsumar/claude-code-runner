import { PrismaClient } from '../../generated/prisma';
import ClaudeInstance from './ClaudeInstance';
import { docker } from './docker';

const prisma = new PrismaClient();
const instances: Record<string, ClaudeInstance> = {};

export async function getInstance(id: string) {
  // Check if the instance exists in memory
  if (!instances[id]) {
    // Check if it exists in the database
    const dbInstance = await prisma.claudeInstance.findUnique({
      where: { id },
    });

    if (!dbInstance) {
      throw new Error(`Instance with id ${id} does not exist`);
    }

    // If it exists in DB but not in memory, recreate it using the port
    instances[id] = new ClaudeInstance({
      port: dbInstance.port,
      docker: docker,
      apiKey: process.env.ANTHROPIC_API_KEY as string,
    });
  }

  return instances[id];
}

export async function addInstance(instance: ClaudeInstance) {
  const port = instance.getPort();

  // Create a record in the database
  const dbInstance = await prisma.claudeInstance.create({
    data: {
      name: 'Unnamed Instance',
      port: port,
    },
  });

  // Store in memory with the generated ID
  instances[dbInstance.id] = instance;

  // Return the ID so it can be used to reference this instance
  return dbInstance.id;
}

export async function removeInstance(id: string) {
  // Check if the instance exists in the database
  const exists = await prisma.claudeInstance.findUnique({
    where: { id },
  });

  if (!exists) {
    throw new Error(`Instance with id ${id} does not exist`);
  }

  // Remove from the database
  await prisma.claudeInstance.delete({
    where: { id },
  });

  // Remove from memory if it exists there
  if (instances[id]) {
    delete instances[id];
  }
}

export async function listInstances() {
  // Get all instances from database
  const dbInstances = await prisma.claudeInstance.findMany();

  return dbInstances.map((dbInstance) => {
    // If the instance is not in memory, create it
    if (!instances[dbInstance.id]) {
      instances[dbInstance.id] = new ClaudeInstance({
        port: dbInstance.port,
        docker: docker,
        apiKey: process.env.ANTHROPIC_API_KEY as string,
      });
    }

    return {
      id: dbInstance.id,
      name: dbInstance.name,
      port: dbInstance.port,
      createdAt: dbInstance.createdAt,
      updatedAt: dbInstance.updatedAt,
      instance: instances[dbInstance.id],
    };
  });
}
