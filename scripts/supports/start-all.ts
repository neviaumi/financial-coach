import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";

const serverPrefix = "\x1b[36m[server]\x1b[0m"; // Cyan
const clientPrefix = "\x1b[35m[client]\x1b[0m"; // Magenta

const rootDir = resolve(import.meta.dirname, "../..");

function pipeProcess(child: ChildProcess, prefix: string) {
  child.stdout?.on("data", (data: Buffer) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (line) console.log(`${prefix} ${line}`);
    }
  });
  child.stderr?.on("data", (data: Buffer) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (line) console.error(`${prefix} ${line}`);
    }
  });
}

console.log(`${serverPrefix} Starting server...`);
const serverChild = spawn("./scripts/start.sh", [], {
  cwd: resolve(rootDir, "server"),
  shell: true,
  stdio: ["inherit", "pipe", "pipe"],
});
pipeProcess(serverChild, serverPrefix);

console.log(`${clientPrefix} Starting web-client...`);
const clientChild = spawn("./scripts/start.sh", [], {
  cwd: resolve(rootDir, "web-client"),
  shell: true,
  stdio: ["inherit", "pipe", "pipe"],
});
pipeProcess(clientChild, clientPrefix);

let exiting = false;
function cleanup() {
  if (exiting) return;
  exiting = true;
  console.log("\nShutting down both processes...");
  try {
    serverChild.kill("SIGINT");
  } catch {
    // ignore
  }
  try {
    clientChild.kill("SIGINT");
  } catch {
    // ignore
  }
}

process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});

process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});

serverChild.on("exit", (code) => {
  console.log(`${serverPrefix} Exited with code ${code}`);
  cleanup();
  process.exit(code ?? 0);
});

clientChild.on("exit", (code) => {
  console.log(`${clientPrefix} Exited with code ${code}`);
  cleanup();
  process.exit(code ?? 0);
});
