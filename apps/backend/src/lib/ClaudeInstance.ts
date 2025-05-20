import * as Docker from 'dockerode';
import axios from 'axios';
import { EventEmitter } from 'events';
import { WrappedMessage } from '../mock-data/fake-task';

// Interface for constructor options
interface ClaudeInstanceOptions {
  apiKey: string;
  port?: number;
  docker: Docker;
}

// Define event types for TypeScript
interface ClaudeInstanceEvents {
  data: [data: WrappedMessage];
  end: [];
  error: [error: Error];
}

export class ClaudeInstance extends EventEmitter<ClaudeInstanceEvents> {
  private docker: Docker;
  private container: Docker.Container | null = null;
  private port: number;
  private apiKey: string;
  private isRunning: boolean = false;
  private status: 'starting' | 'idle' | 'executing' | 'stopped' = 'stopped';

  /**
   * Creates a new Claude instance
   * @param options Configuration options including apiKey, port, and docker instance
   */
  constructor(options: ClaudeInstanceOptions) {
    super();

    this.docker = options.docker;
    this.apiKey = options.apiKey;
    this.port = options.port || this.getRandomPort(3000, 10000);
  }

  /**
   * Generates a random port number between min and max (inclusive)
   */
  private getRandomPort(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Creates and starts the Claude executor container
   * @returns The container instance
   */
  public async startContainer(): Promise<Docker.Container> {
    console.log(`Creating Claude executor container on port ${this.port}...`);
    this.status = 'starting';
    this.container = await this.docker.createContainer({
      Image: 'claude-executor-image',
      ExposedPorts: { '3000/tcp': {} },
      HostConfig: {
        PortBindings: { '3000/tcp': [{ HostPort: this.port.toString() }] },
      },
      Env: [`ANTHROPIC_API_KEY=${this.apiKey}`, `GITHUB_TOKEN=${process.env.GITHUB_API_TOKEN}`],
      AttachStdout: true,
      AttachStderr: true,
    });

    await this.container.start();
    this.isRunning = true;
    this.status = 'idle';
    console.log(`Claude executor running on http://localhost:${this.port}`);

    return this.container;
  }

  /**
   * Initializes the Git configuration in the container
   */
  public async initGitConfig({
    githubUsername,
    email,
    sshPrivateKey,
    sshPublicKey,
  }: {
    githubUsername: string;
    email: string;
    sshPrivateKey: string;
    sshPublicKey: string;
  }): Promise<void> {
    if (!this.container) {
      throw new Error('Container is not created. Call createContainer() first');
    }

    if (!this.isRunning) {
      throw new Error('Container is not running. Call createContainer() first');
    }

    this.emit('data', internalMessage('update', 'Initializing Git config...'));

    await this.waitForReady();

    try {
      const response = await axios({
        method: 'post',
        url: `http://localhost:${this.port}/init-git`,
        data: {
          githubUsername,
          email,
          sshPrivateKey,
          sshPublicKey,
        },
      });

      console.log('Git config response:', response.data);
    } catch (error) {
      console.error('Error initializing Git config:', error);
      throw error;
    }
  }

  /**
   * Clones the repository into the container
   * @param repository The GitHub repository full name (e.g., 'user/repo')
   */
  public async cloneRepository(repository: string): Promise<void> {
    if (!this.container) {
      throw new Error('Container is not created. Call createContainer() first');
    }

    if (!this.isRunning) {
      throw new Error('Container is not running. Call createContainer() first');
    }

    this.emit('data', internalMessage('update', 'Cloning repository...'));
    await this.waitForReady();

    try {
      const response = await axios({
        method: 'post',
        url: `http://localhost:${this.port}/git-clone`,
        data: { repositoryUrl: `git@github.com:${repository}.git` },
      });

      console.log('Clone response:', response.data);
    } catch (error) {
      console.error('Error cloning repository:', error);
      throw error;
    }
  }

  /**
   * Executes a prompt against the Claude executor
   * @param prompt The prompt to execute
   * @returns Promise that resolves when the response stream ends
   */
  public async executePrompt(prompt: string): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Container is not running. Call createContainer() first');
    }

    this.emit('data', internalMessage('update', 'Executing prompt...'));
    await this.waitForReady();

    this.status = 'executing';
    try {
      const response = await axios({
        method: 'post',
        url: `http://localhost:${this.port}/execute`,
        data: { prompt },
        responseType: 'stream',
      });

      // Handle streaming response and emit events
      response.data.on('data', (chunk: Buffer) => {
        const rawStr = chunk.toString();

        try {
          const lines = rawStr.split('\n').filter((line) => line.trim() !== '');
          for (const line of lines) {
            const jsonChunk = JSON.parse(line);
            console.log('DATA:', jsonChunk);
            this.emit('data', jsonChunk);
          }
        } catch {
          console.log('ERROR:', rawStr);
          this.emit('error', new Error('Failed to parse JSON chunk: ' + rawStr));
        }
      });

      response.data.on('error', (error: Error) => {
        console.error('Stream error:', error);
        this.status = 'idle';
        this.emit('error', error);
      });

      return new Promise<void>((resolve) => {
        response.data.on('end', () => {
          this.status = 'idle';
          this.emit('end');
          resolve();
        });
      });
    } catch (error) {
      const err = error as Error;
      console.error('Error executing prompt:', err);
      this.emit('error', err);
      this.status = 'idle';
      throw err; // Re-throw to allow caller to handle
    }
  }

  /**
   * Stops and removes the container
   */
  public async stopAndRemoveContainer(): Promise<void> {
    if (this.container && this.isRunning) {
      await this.container.stop();
      await this.container.remove();
      this.isRunning = false;
      this.status = 'stopped';
      console.log('Claude executor container stopped and removed');
    }
  }

  /**
   * Ensures the container is ready to accept requests
   */
  private async isReady(): Promise<boolean> {
    if (!this.container) {
      throw new Error('Container is not created. Call createContainer() first');
    }

    try {
      await axios.get(`http://localhost:${this.port}/health`);
      return true;
    } catch (error) {
      console.error('Not ready:', (error as Error).message);
      return false;
    }
  }

  /**
   * Waits until the container is ready to accept requests
   */
  public async waitForReady(): Promise<void> {
    while (!(await this.isReady())) {
      console.log('Waiting for container to be ready...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log('Container is ready');
  }

  /**
   * Returns the port the executor is running on
   */
  public getPort(): number {
    return this.port;
  }

  /**
   * Returns the current status of the instance
   */
  public getStatus(): string {
    return this.status;
  }

  /**
   * Checks if the container is running
   */
  public isContainerRunning(): boolean {
    return this.isRunning;
  }
}

function internalMessage(type: string, data: string) {
  const msg: WrappedMessage = {
    type: 'internal',
    session_id: '',
    message: {
      role: 'internal',
      content: [{ internal: true, type, data }],
    },
  };
  return msg;
}

export default ClaudeInstance;
