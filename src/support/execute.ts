import { spawn, ChildProcess } from 'child_process'
import { Readable } from 'stream'

interface ProcessExecutor<T> extends Promise<T> {
  process: ChildProcess;
}

type ExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
}

class ExecutionError extends Error {
  public exitCode: number;
  public command: string;

  constructor(stderr: string, code: number, command: string[]) {
    super(stderr);

    this.exitCode = code;
    this.command = command.join(' ')
  }
}

export function execute(...args: any[]): ProcessExecutor<ExecutionResult> {
  let options: any
  if (typeof args[args.length - 1] === 'object') {
    options = args.splice(args.length - 1)[0]
  }

  const [command, ...commandArgs] = args
  const process = spawn(command, commandArgs, options)

  let stdout = ''
  let stderr = ''

  // eslint-disable-next-line
  process.stdout.on('data', data => stdout += data.toString())

  // eslint-disable-next-line
  process.stderr.on('data', data => stderr += data.toString())

  const executor: any = new Promise((resolve, reject) => {
    process.on('close', code => {
      if (code === 0) {
        resolve({ stdout, stderr, exitCode: code })
      }
      else {
        reject(new ExecutionError(stderr, code, args))
      }
    })
  })

  executor.process = process

  return executor as ProcessExecutor<ExecutionResult>
}
