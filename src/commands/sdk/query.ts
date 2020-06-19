import { flags } from '@oclif/command'
import  _ from 'lodash'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

class SdkQuery extends Kommand {
  public static description = `
Executes an API query.

Query arguments

  arguments can be passed and repeated using the --arg or -a flag.
  index and collection names can be passed with --index (-i) and --collection (-c) flags

  Examples:
    - kourou sdk:query document:get -i iot -c sensors -a _id=sigfox-42

Query body

  body can be passed with the --body flag with either a JSON or JS string.
  body will be read from STDIN if available

  Examples:
    - kourou sdk:query document:create -i iot -c sensors --body '{creation: Date.now())}'
    - kourou sdk:query admin:loadMappings < mappings.json
    - echo '{dynamic: "strict"}' | kourou sdk:query collection:create -i iot -c sensors

Other

  use the --editor flag to modify the query before sending it to Kuzzle
  use the --display flag to display a specific property of the response

  Examples:
    - kourou sdk:query document:create -i iot -c sensors --editor
    - kourou sdk:query server:now --display 'result.now'
`;

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
      description: 'Open an editor (EDITOR env variable) to edit the request before sending.'
    }),
    index: flags.string({
      char: 'i',
      description: 'Index argument'
    }),
    collection: flags.string({
      char: 'c',
      description: 'Collection argument'
    }),
    display: flags.string({
      description: 'Path of the property to display from the response (empty string to display everything)',
      default: 'result'
    }),
    ...kuzzleFlags,
  };

  static args = [
    { name: 'controller:action', description: 'Controller and action (eg: "server:now")', required: true },
  ]

  static readStdin = true

  async runSafe() {
    const [controller, action] = this.args['controller:action'].split(':')

    if (controller === 'realtime' && action === 'subscribe') {
      throw new Error('Use the "subscribe" command to listen to realtime notifications')
    }

    const requestArgs: any = {}

    requestArgs.index = this.flags.index
    requestArgs.collection = this.flags.collection

    for (const keyValue of this.flags.arg || []) {
      const [key, ...value] = keyValue.split('=')
      requestArgs[key] = value.join()
    }

    const body = this.stdin ? this.stdin : this.flags.body

    let request = {
      controller,
      action,
      ...requestArgs,
      body: this.parseJs(body),
    }

    // content from user editor
    if (this.flags.editor) {
      request = this.fromEditor(request, { json: true })
    }

    const response = await this.sdk?.query(request)

    const display = this.flags.display === ''
      ? response
      : _.get(response, this.flags.display)

    this.log(JSON.stringify(display, null, 2))

    this.logOk(`Successfully executed "${controller}:${action}"`)
  }
}

export default SdkQuery
