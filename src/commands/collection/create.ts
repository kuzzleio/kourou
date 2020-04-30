import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

export default class CollectionCreate extends Kommand {
  static description = 'Creates a collection'

  static flags = {
    help: flags.help(),
    body: flags.string({
      description: 'Collection mappings and settings in JS or JSON format. Will be read from STDIN if available',
      default: '{}'
    }),
    ...kuzzleFlags
  }

  static args = [
    { name: 'index', description: 'Index name', required: true },
    { name: 'collection', description: 'Collection name', required: true }
  ]

  async runSafe() {
    const stdin = await this.fromStdin()

    const body = stdin ? this.parseJs(stdin) : this.parseJs(this.flags.body)

    if (!await this.sdk?.index.exists(this.args.index)) {
      await this.sdk?.index.create(this.args.index)

      this.logInfo(`Index "${this.args.index}" created`)
    }

    await this.sdk?.collection.create(this.args.index, this.args.collection, body)

    this.logOk(`Collection "${this.args.index}":"${this.args.collection}" created`)
  }
}
