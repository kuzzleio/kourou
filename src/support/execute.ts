import { spawn } from 'child_process'

export async function execute(...args: any[]): Promise<any> {
  let options: any
  if (typeof args[args.length - 1] === 'object') {
    options = args.splice(args.length - 1)[0]
  }

  const [command, ...commandArgs] = args
  const childProcess = spawn(command, commandArgs, options)

  // eslint-disable-next-line
  childProcess.stdout.on('data', data => console.log(data.toString()))

  // eslint-disable-next-line
  childProcess.stderr.on('data', data => console.error(data.toString()))

  return new Promise((resolve, reject) => {
    childProcess.on('close', code => {
      if (code === 0) {
        resolve({ code })
      }
      else {
        // eslint-disable-next-line
        reject({ code, command: [command, ...args].join(' ') })
      }
    })
  })
}
