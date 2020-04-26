import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'

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
    const { args, flags: userFlags } = this.parse(CollectionCreate)

    this.sdk = new KuzzleSDK(userFlags)
    await this.sdk.init(this.log)

    const stdin = await this.fromStdin()

    const body = stdin
      ? this.parseJs(stdin)
      : this.parseJs(userFlags.body)

    if (!await this.sdk.index.exists(args.index)) {
      await this.sdk.index.create(args.index)

      this.logOk(`Index "${args.index}" created`)
    }

    await this.sdk.collection.create(args.index, args.collection, body)

    this.logOk(`Collection "${args.index}":"${args.collection}" has been created`)
  }
}
