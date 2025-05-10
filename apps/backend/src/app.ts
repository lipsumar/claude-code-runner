import express from "express";
import Docker from "dockerode";
import axios from "axios";
import bodyParser from "body-parser";

const docker = new Docker();
const { Readable } = require('stream');
const app = express();
app.use(bodyParser.json());


async function createClaudeContainer() {
  console.log("Creating Claude executor container...");
  const container = await docker.createContainer({
    Image: 'claude-executor-image',
    ExposedPorts: { '3000/tcp': {} },
    HostConfig: {
      PortBindings: { '3000/tcp': [{ HostPort: '3000' }] }
    },
    Env: [
      `ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY}`,
    ],
    AttachStdout: true,
    AttachStderr: true
  });

  // Log container output
  // const stream = await container.attach({stream: true, stdout: true, stderr: true});
  // stream.pipe(process.stdout);
  
  await container.start();
  return container;
}


async function executePrompt(prompt: string): Promise<void> {
  try {
    const response = await axios({
      method: 'post',
      url: 'http://localhost:3000/execute',
      data: { prompt },
      responseType: 'stream'
    });

    // Handle streaming response
    response.data.on('data', (chunk:any) => {
      console.log("DATA:", chunk.toString());
      // const jsonChunk = JSON.parse(chunk.toString());
      // console.log(jsonChunk);
      // Forward to your application as needed
    });

    return new Promise((resolve) => {
      response.data.on('end', () => {
        resolve();
      });
    });
  } catch (error) {
    console.error('Error executing prompt:', error);
  }
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post('/prompt', async (req, res) => {
  const container = await createClaudeContainer();
  await pause(2000); // Wait for the container to be ready
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).send({ error: "Prompt is required" });
    return;
  }
  console.log("Executing prompt:", prompt);

  await executePrompt(prompt);
  res.send({ status: "Prompt executed" });
  await container.stop();
  await container.remove();
  console.log("Container stopped and removed");
});

function pause(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default app;
