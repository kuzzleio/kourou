import chalk from 'chalk'
import { Hook } from '@oclif/config'
import SdkQuery from '../../commands/sdk/query'

/**
 * Hooks that run the corresponding API method with sdk:query.
 *
 * Example:
 *  - kourou document:create -i index -c collection --id foobar-1 --body '{}'
 *
 * Index, collection, ID and body can be infered if they are
 * passed as argument in one of the following order:
 *  - <index> <collection> <id> <body>
 *  - <index> <collection> <body>
 *  - <index> <collection> <id>
 *  - <index> <collection>
 *  - <index>
 *
 * This is mainly to match easily methods from the document, bulk, realtime
 * and collection controllers.
 *
 * If one of the infered arguments is passed as a flag, then Kourou will
 * use the flag value and will not try to infere arguments.
 *
 * Example:
 *  - kourou document:create index collection foobar-1 '{}'
 *  - kourou bulk:import index collection '{bulkData: []}'
 */

async function callSdkQuery(args: string[]) {
  try {
    await SdkQuery.run(args)

    // eslint-disable-next-line
    process.exit(0)
  }
  catch (error) {
    // eslint-disable-next-line
    process.exit(1)
  }
}

const hook: Hook<'command_not_found'> = async function (opts) {
  const [controller, action] = opts.id.split(':')

  if (!controller || !action) {
    return
  }

  this.log(chalk.yellow(`[ℹ] Unknown command "${opts.id}", fallback to API method`))

  const args = process.argv.slice(3)
  const commandArgs = [opts.id]

  // first positional argument (index)
  if (args[0]
    && args[0].charAt(0) !== '-'
    && !args.includes('-i')
    && !args.includes('--index')
  ) {
    commandArgs.push('-i')
    commandArgs.push(args[0])

    args.splice(0, 1)
  }
  else {
    return callSdkQuery([...commandArgs, ...args])
  }

  // 2th positional argument (collection)
  if (args[0]
    && args[0].charAt(0) !== '-'
    && !args.includes('-c')
    && !args.includes('--collection')
  ) {
    commandArgs.push('-c')
    commandArgs.push(args[0])

    args.splice(0, 1)
  }
  else {
    return callSdkQuery([...commandArgs, ...args])
  }

  // 3th positional argument (_id or body)
  if (args[0] && args[0].charAt(0) !== '-') {
    if (args[0].includes('{') && !args.includes('--body')) {
      commandArgs.push('--body')
      commandArgs.push(args[0])

      args.splice(0, 1)
    }
    else if (!args.includes('--id')) {
      commandArgs.push('--id')
      commandArgs.push(args[0])

      args.splice(0, 1)
    }
  }
  else {
    return callSdkQuery([...commandArgs, ...args])
  }

  // 4th positional argument (body)
  if (args[0]
    && args[0].charAt(0) !== '-'
    && !commandArgs.includes('--body')
  ) {
    commandArgs.push('--body')
    commandArgs.push(args[0])

    args.splice(0, 1)
  }

  return callSdkQuery([...commandArgs, ...args])
}

export default hook
