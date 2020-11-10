import { execSync } from 'child_process'

export function kourou(command: string) {
  const runtime = process.env.KOUROU_RUNTIME || './bin/run'

  execSync(`${runtime} ${command}`)
}
