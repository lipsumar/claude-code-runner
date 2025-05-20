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

    if (prompt === "mock") {
      let count = 0;
      function sendMockMessage() {
        count++;
        const mockMessage = JSON.stringify({
          type: "assistant",
          message: {
            id: "msg_0141YRdx8NEHpfBu36FVhkeS",
            type: "message",
            role: "assistant",
            model: "claude-3-7-sonnet-20250219",
            content: [
              {
                type: "text",
                text: `This is a mock response from Claude. (${count})`,
              },
            ],
            stop_reason: "end_turn",
            stop_sequence: null,
            usage: {
              input_tokens: 4,
              cache_creation_input_tokens: 0,
              cache_read_input_tokens: 24543,
              output_tokens: 23,
            },
          },
          session_id: "53c78480-8d5a-4a58-8b4f-e797450f7011",
        });
        outputStream.write(mockMessage);
        if (count < 10) {
          setTimeout(sendMockMessage, 1000); // Send mock message every second
        } else {
          outputStream.end(); // End the stream after 10 messages
        }
      }
      sendMockMessage();
      return;
    }

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
