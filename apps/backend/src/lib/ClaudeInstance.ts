import * as Docker from 'dockerode';
import axios from 'axios';
import { EventEmitter } from 'events';

// Interface for constructor options
interface ClaudeInstanceOptions {
  apiKey: string;
  port?: number;
  docker: Docker;
}

// Define event types for TypeScript
interface ClaudeInstanceEvents {
  data: [data: string];
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
      Env: [`ANTHROPIC_API_KEY=${this.apiKey}`],
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
   * Executes a prompt against the Claude executor
   * @param prompt The prompt to execute
   * @returns Promise that resolves when the response stream ends
   */
  public async executePrompt(prompt: string): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Container is not running. Call createContainer() first');
    }

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
        const data = chunk.toString();

        try {
          const jsonChunk = JSON.parse(data);
          console.log('DATA:', data);
          this.emit('data', jsonChunk);
        } catch {
          console.log('ERROR:', data);
          this.emit('error', new Error('Failed to parse JSON chunk: ' + data));
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
  private async waitForReady(): Promise<void> {
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

export default ClaudeInstance;
