import { Hook } from '@oclif/config'
import SdkQuery from '../../commands/sdk/query'

const hook: Hook<'command_not_found'> = async function (opts) {
  const [controller, action] = opts.id.split(':')

  if (!controller || !action) {
    return
  }

  const argv = [opts.id, ...process.argv.slice(3)];

  try {
    await SdkQuery.run(argv)

    process.exit(0)
  }
  catch (error) {
    process.exit(1)
  }
}

export default hook
