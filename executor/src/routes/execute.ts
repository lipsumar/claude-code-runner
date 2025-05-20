import { Router } from "express";
import { execa } from "execa";
import { writeFile } from "fs/promises";
import { PassThrough } from "stream";
import readline from "readline";

const router = Router();

router.post("/execute", async (req, res) => {
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
      cwd: "/workspace",
    });

    // Use a line-by-line stream parser
    const rl = readline.createInterface({
      input: subprocess.stdout,
      crlfDelay: Infinity,
    });

    // Stream stdout to client
    rl.on("line", (line) => {
      console.log(`stdout: ${line}`);
      outputStream.write(line);
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

export default router;
