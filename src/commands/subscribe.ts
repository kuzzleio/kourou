import { flags } from '@oclif/command'
import * as _ from 'lodash'

import { Kommand } from '../common'
import { kuzzleFlags } from '../support/kuzzle'

export default class RealtimeSubscribe extends Kommand {
  static description = 'Subscribes to realtime notifications'

  static examples = [
    'kourou subscribe iot-data sensors',
    'kourou subscribe iot-data sensors --filters \'{ range: { temperature: { gt: 0 } } }\'',
    'kourou subscribe iot-data sensors --filters \'{ exists: "position" }\' --scope out',
    'kourou subscribe iot-data sensors --users all --volatile \'{ clientId: "citizen-kane" }\'',
    'kourou subscribe iot-data sensors --display result._source.temperature',
  ]

  static flags = {
    filters: flags.string({
      description: 'Set of Koncorde filters',
      default: '{}'
    }),
    scope: flags.string({
      description: 'Subscribe to document entering or leaving the scope (all, in, out, none)',
      default: 'all'
    }),
    users: flags.string({
      description: 'Subscribe to users entering or leaving the room (all, in, out, none)',
      default: 'all'
    }),
    volatile: flags.string({
      description: 'Additional subscription information used in user join/leave notifications',
      default: '{}'
    }),
    display: flags.string({
      description: 'Path of the property to display from the notification (empty string to display everything)',
      default: 'result'
    }),
    editor: flags.boolean({
      description: 'Open an editor (EDITOR env variable) to edit the filters before subscribing.'
    }),
    help: flags.help(),
    ...kuzzleFlags,
    protocol: flags.string({
      description: 'Kuzzle protocol (only websocket for realtime)',
      default: 'websocket',
    }),
  }

  static args = [
    { name: 'index', description: 'Index name', required: true },
    { name: 'collection', description: 'Collection name', required: true }
  ]

  async afterParsing() {
    if (this.flags.protocol === 'http') {
      throw new Error('Realtime notification does not work with the Http protocol')
    }
  }

  async runSafe() {
    const stdin = await this.fromStdin()

    if (stdin && this.flags.editor) {
      throw new Error('Unable to use flag --editor when reading from STDIN')
    }

    let filters = stdin ? stdin : this.flags.filters

    // content from user editor
    if (this.flags.editor) {
      filters = this.fromEditor(filters, { json: true })
    }

    await this.sdk?.realtime.subscribe(
      this.args.index,
      this.args.collection,
      this.parseJs(filters),
      async (notification: any) => {
        this.logInfo('New notification')

        const display = this.flags.display === ''
          ? notification
          : _.get(notification, this.flags.display)

        this.log(JSON.stringify(display, null, 2))
      },
      {
        scope: this.flags.scope,
        users: this.flags.users,
        volatile: this.parseJs(this.flags.volatile),
      })

    this.logInfo(`Waiting for realtime notifications on "${this.args.index}":"${this.args.collection}" ...`)

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => { })
  }
}
