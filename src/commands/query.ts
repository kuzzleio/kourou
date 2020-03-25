import { flags } from '@oclif/command'
import { Kommand } from '../common'
import { kuzzleFlags, KuzzleSDK } from '../support/kuzzle'
import chalk from 'chalk'

class Query extends Kommand {
  public static description = 'Executes an API query';

  public static examples = [
    'kourou query document:get --arg index=iot --arg collection=sensors --arg _id=sigfox-42',
    'kourou query collection:create --arg index=iot --arg collection=sensors --body \'{dynamic: "strict"}\'',
    'kourou query admin:loadMappings < mappings.json',
    'echo \'{name: "Aschen"}\' | kourou query document:create --arg index=iot --arg collection=sensors'
  ]

  public static flags = {
    help: flags.help(),
    arg: flags.string({
      char: 'a',
      description: 'Additional argument. Repeatable. (e.g. "-a refresh=wait_for")',
      multiple: true
    }),
    body: flags.string({
      description: 'Request body in JS or JSON format. Will be read from STDIN if available.',
      default: '{}'
    }),
    editor: flags.boolean({
      description: 'Open an editor (EDITOR env variable) to edit the request before sending'
    }),
    ...kuzzleFlags,
  };

  static args = [
    { name: 'controller:action', description: 'Controller and action (eg: "server:now")', required: true },
  ]

  async run() {
    try {
      await this.runSafe()
    }
    catch (error) {
      this.logError(error)
    }
  }

  async runSafe() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(Query)

    const sdk = new KuzzleSDK(userFlags)
    await sdk.init(this.log)

    const [controller, action] = args['controller:action'].split(':')

    const requestArgs: any = {}

    for (const keyValue of userFlags.arg || []) {
      const [key, ...value] = keyValue.split('=')
      requestArgs[key] = value.join()
    }

    // try to read stdin
    const stdin = await this.fromStdin()

    if (stdin && userFlags.editor) {
      throw new Error('Unable to use flag --editor when reading from STDIN')
    }
    const body = stdin
      ? stdin
      : userFlags.body

    let request = {
      controller,
      action,
      ...requestArgs,
      body: this.parseJs(body),
    }

    // content from user editor
    if (userFlags.editor) {
      request = this.fromEditor(request, { json: true })
    }

    try {
      const response = await sdk.query(request)

      this.log(chalk.green(`Successfully executed "${controller}:${action}"`))
      this.log(JSON.stringify(response, null, 2))
    }
    catch (error) {
      this.logError(`${error.stack || error.message}\n\tstatus: ${error.status}\n\tid: ${error.id}`)
    }
  }
}

export default Query
