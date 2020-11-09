import { execSync } from 'child_process'

export function kourou(command: string) {
  const runtime = process.env.KOUROU_RUNTIME || './bin/run'

  try {
    execSync(`${runtime} ${command}`)
  }
  catch (error) {
    console.error(error)
    console.error('STDOUT: ', error.stdout.toString())
    console.error('STDERR: ', error.stderr.toString())
  }
}
