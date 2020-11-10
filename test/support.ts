import { execSync } from 'child_process'

/* eslint-disable no-console */
export function kourou(command: string) {
  const runtime = process.env.KOUROU_RUNTIME || './bin/run'

  try {
    execSync(`${runtime} ${command}`)
  }
  catch (error) {
    console.log(error)
    console.log('STDOUT: ', error.stdout.toString())
    console.log('STDOUT: ', error.stderr.toString())
  }
}
