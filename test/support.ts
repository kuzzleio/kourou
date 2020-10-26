import { execSync } from 'child_process'

export function kourou(command: string) {
  const runtime = process.env.KOUROU_RUNTIME || 'npm run dev'

  execSync(`${runtime} -- ${command}`)
}
