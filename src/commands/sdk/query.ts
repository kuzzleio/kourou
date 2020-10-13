import { flags } from '@oclif/command'
import _ from 'lodash'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

class SdkQuery extends Kommand {
  public static description = `
Executes an API query.

Query arguments

  Arguments can be passed and repeated using the --arg or -a flag.
  Index and collection names can be passed with --index (-i) and --collection (-c) flags
  ID can be passed with the --id flag.

  Examples:
    - kourou sdk:query document:delete -i iot -c sensors -a refresh=wait_for

Query body

  Body can be passed with the --body flag with either a JSON or JS string.
  Body will be read from STDIN if available

  Examples:
    - kourou sdk:query document:create -i iot -c sensors --body '{creation: Date.now())}'
    - kourou sdk:query admin:loadMappings < mappings.json
    - echo '{dynamic: "strict"}' | kourou sdk:query collection:create -i iot -c sensors

Other

  Use the --editor flag to modify the query before sending it to Kuzzle
  Use the --display flag to display a specific property of the response

  Examples:
    - kourou sdk:query document:create -i iot -c sensors --editor
    - kourou sdk:query server:now --display 'result.now'

Default fallback to API method

  It's possible to use this command by only specifying the corresponding controller
  and action as first argument.
  Kourou will try to infer the first arguments to one the following pattern:
    - <command> <index>
    - <command> <index> <collection>
    - <command> <index> <collection> <id>
    - <command> <index> <collection> <body>
    - <command> <index> <collection> <id> <body>
  If a flag is given (-i, -c, --body or --id), then the flag value has prior to
  argument infering.

  Examples:
    - kourou collection:list iot
    - kourou collection:delete iot sensors
    - kourou document:createOrReplace iot sensors sigfox-1 '{}'
    - kourou bulk:import iot sensors '{bulkData: [...]}'
    - kourou admin:loadMappings < mappings.json
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
    'body-editor': flags.boolean({
      description: 'Open an editor (EDITOR env variable) to edit the body before sending.'
    }),
    index: flags.string({
      char: 'i',
      description: 'Index argument'
    }),
    collection: flags.string({
      char: 'c',
      description: 'Collection argument'
    }),
    id: flags.string({
      description: 'ID argument (_id)'
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
    requestArgs._id = this.flags.id

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
    if (this.flags.editor && this.flags['body-editor']) {
      throw new Error('You cannot specify --editor and --body-editor at the same time')
    }
    else if (this.flags.editor) {
      request = this.fromEditor(request, { json: true })
    }
    else if (this.flags['body-editor']) {
      request.body = this.fromEditor(request.body, { json: true })
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
