import { Router } from "express";
import { execa } from "execa";
import { constants } from "fs";
import { writeFile, mkdir, access } from "fs/promises";
import { join } from "path";

const router = Router();

interface InitGitRequest {
  githubUsername: string;
  email: string;
  sshPrivateKey: string; // The private key content
  sshPublicKey: string; // The public key content
}

router.post("/init-git", async (req, res) => {
  try {
    const { githubUsername, email, sshPrivateKey, sshPublicKey } =
      req.body as InitGitRequest;

    if (!githubUsername || !email || !sshPrivateKey || !sshPublicKey) {
      res.status(400).json({
        success: false,
        message: "GitHub username, email, and SSH keys are required",
      });
      return;
    }

    // 1. Configure Git user
    await execa("git", ["config", "--global", "user.name", githubUsername]);
    await execa("git", ["config", "--global", "user.email", email]);

    // 2. Create .ssh directory if it doesn't exist
    const sshDir = join(process.env.HOME || "/root", ".ssh");
    try {
      await access(sshDir, constants.F_OK);
    } catch {
      await mkdir(sshDir, { recursive: true, mode: 0o700 });
    }

    // 3. Save the provided SSH keys
    const sshKeyPath = join(sshDir, "id_ed25519");
    await writeFile(sshKeyPath, sshPrivateKey + "\n");
    await writeFile(`${sshKeyPath}.pub`, sshPublicKey);

    // 4. Set proper permissions
    await execa("chmod", ["600", sshKeyPath]);
    await execa("chmod", ["644", `${sshKeyPath}.pub`]);

    // 5. Add github.com to known_hosts
    await execa("ssh-keyscan", ["-t", "rsa", "github.com"]).then((result) =>
      writeFile(join(sshDir, "known_hosts"), result.stdout, { flag: "a" })
    );

    // 6. Create or update SSH config file
    const sshConfigPath = join(sshDir, "config");
    const sshConfig = `Host github.com
  HostName github.com
  User git
  IdentityFile ${sshKeyPath}
  IdentitiesOnly yes`;

    await writeFile(sshConfigPath, sshConfig);
    await execa("chmod", ["600", sshConfigPath]);

    // 7. Test the connection to GitHub
    try {
      await execa("ssh", [
        "-T",
        "git@github.com",
        "-o",
        "StrictHostKeyChecking=no",
      ]);
    } catch (sshError: any) {
      // The command will always "fail" with exit code 1 because GitHub doesn't provide shell access
      // But the output should contain "Hi username! You've successfully authenticated"
      if (!sshError.stderr?.includes("successfully authenticated")) {
        throw new Error(
          `SSH authentication failed: ${sshError.stderr || sshError.message}`
        );
      }
    }

    res.status(200).json({
      success: true,
      message:
        "Git and SSH have been initialized successfully with the provided keys",
    });
  } catch (error: any) {
    console.error("Error initializing Git:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize Git",
      error: error.message || String(error),
    });
  }
});

router.post("/git-clone", async (req, res) => {
  const { repositoryUrl } = req.body;

  if (!repositoryUrl) {
    res.status(400).send({ error: "repositoryUrl is required" });
    return; // Added missing return statement
  }

  try {
    console.log(`Cloning repository ${repositoryUrl}`);
    const { stderr, stdout } = await execa("git", [
      "clone",
      repositoryUrl,
      "/workspace",
    ]);
    res.status(200).send({ stdout, stderr });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: (error as any).message });
  }
});

export default router;