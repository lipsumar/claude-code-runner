# claude-code-runner

claude-code-runner allows to run Claude Code as an agent in the background. Define tasks and launch tasks against repositories.

## General architecture

![General architecture](./docs/architecture.jpg)

- **Server** stores prompts and message history in database, spawns Docker containers for task execution (executors)
- **Frontend** is a UI to create prompt, execute tasks against repositories and inspect task runs (messages and actions performed by claude code)
- **Executor container** is a Docker container built on top of [claude code's devContainer](https://github.com/anthropics/claude-code/blob/main/.devcontainer/Dockerfile) provisionned with tooling for Claude and a firewall
  - **executor server** is a small NodeJS server that allows communication from and to the executor container, starts claude-code, relays messages and perform initial git setup

## API Documentation

### Backend Server (apps/backend)

The backend server primarily uses tRPC for its API functionality.

#### tRPC Endpoints

- `/trpc/instances.get` - Gets details of a specific Claude instance by ID
- `/trpc/instances.remove` - Stops and removes a specific Claude instance by ID
- `/trpc/instances.list` - Lists all available Claude instances with their status
- `/trpc/tasks.byId` - Gets a specific task by ID
- `/trpc/tasks.create` - Creates a new task with name and steps
- `/trpc/tasks.update` - Updates an existing task by ID
- `/trpc/tasks.list` - Lists all tasks
- `/trpc/tasks.delete` - Deletes a task by ID
- `/trpc/runs.create` - Creates a new task run with a specified task ID and repository URL
- `/trpc/runs.byId` - Gets a specific task run by ID
- `/trpc/runs.onMessage` - Creates a subscription to receive real-time messages from a running task

### Executor Server (executor)

The executor server uses traditional REST endpoints.

- `POST /execute` - Executes a Claude prompt and streams the responses back to the client
- `POST /init-git` - Initializes Git configuration with GitHub username, email, and SSH keys
- `POST /git-clone` - Clones a Git repository into the /workspace directory
- `GET /health` - Simple health check endpoint
