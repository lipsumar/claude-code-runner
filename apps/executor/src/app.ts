import express from "express";
import bodyParser from "body-parser";
import { execa } from "execa";
import { writeFile } from "fs/promises";
import { PassThrough } from "stream";

const app = express();

app.use(bodyParser.json());

app.post("/execute", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).send({ error: "Prompt is required" });
    return;
  }

  try {
    console.log(`Writing prompt to /tmp/prompt.txt`);
    await writeFile("/tmp/prompt.txt", prompt);

    // Set headers for streaming response
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Transfer-Encoding", "chunked");

    // Create a PassThrough stream to handle the output
    const outputStream = new PassThrough();

    // Pipe the stream to the response
    outputStream.pipe(res);

    console.log(`Executing claude with prompt from /tmp/prompt.txt`);
    const subprocess = execa("/executor-server/start-claude.sh", {
      stdout: "pipe",
      stderr: "pipe",
    });

    // Stream stdout to client
    subprocess.stdout.on("data", (data) => {
      outputStream.write(data);
    });

    // Log stderr but don't send to client (optional)
    subprocess.stderr.on("data", (data) => {
      console.error(`stderr: ${data.toString()}`);
    });

    // Handle process completion
    subprocess.on("close", (code) => {
      if (code === 0) {
        console.log("Claude execution completed successfully");
      } else {
        console.error(`Claude execution failed with code ${code}`);
      }
      outputStream.end();
    });

    // Handle errors
    subprocess.on("error", (err) => {
      console.error("Execution error:", err);
      outputStream.end(JSON.stringify({ error: err.message }));
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: (error as any).message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.send({ status: "ok" });
});

export default app;
