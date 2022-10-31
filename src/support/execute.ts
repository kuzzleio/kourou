import { spawn, ChildProcess } from "child_process";

interface ProcessExecutor<T> extends Promise<T> {
  process: ChildProcess;
}

type ExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export class ExecutionError extends Error {
  public command: string;

  public result: ExecutionResult;

  constructor(stderr: string, stdout: string, code: number, command: string[]) {
    super(stderr);

    this.result = { stdout, stderr, exitCode: code };

    this.command = command.join(" ");
  }
}

/**
 * Executes a command.
 *
 * The given should be given as strings as for the child_process.spawn command.
 * If the last argument is an object, it will be passed to the child_process.spawn command.
 *
 * @example
 * await execute('ls', '-la')
 * await execute('ls', '-la', { cwd: '/home/aschen' })
 * @returns {ProcessExecutor<ExecutionResult>} ProcessExecutor
 */
export function execute(...args: any[]): ProcessExecutor<ExecutionResult> {
  let options: any;
  if (typeof args[args.length - 1] === "object") {
    options = args.splice(args.length - 1)[0];
  }

  const [command, ...commandArgs] = args;
  const process = spawn(command, commandArgs, options);

  let stdout = "";
  let stderr = "";

  // eslint-disable-next-line
  process.stdout.on("data", (data) => (stdout += data.toString()));

  // eslint-disable-next-line
  process.stderr.on("data", (data) => (stderr += data.toString()));

  const executor: any = new Promise((resolve, reject) => {
    process.on("close", (code: any) => {
      if (code === 0) {
        resolve({ stdout, stderr, exitCode: code });
      } else {
        reject(new ExecutionError(stderr, stdout, code, args));
      }
    });
  });

  executor.process = process;

  return executor as ProcessExecutor<ExecutionResult>;
}
