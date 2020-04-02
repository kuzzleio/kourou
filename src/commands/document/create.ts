import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'

export default class DocumentCreate extends Kommand {
  static description = 'Creates a document'

  static examples = [
    'kourou document:create iot sensors --body \'{network: "sigfox"}\'',
    'kourou document:create iot sensors < document.json',
  ]

  static flags = {
    body: flags.string({
      description: 'Document body in JS or JSON format. Will be read from STDIN if available',
      default: '{}'
    }),
    id: flags.string({
      description: 'Optional document ID'
    }),
    replace: flags.boolean({
      description: 'Replaces the document if it already exists'
    }),
    help: flags.help(),
    ...kuzzleFlags
  }

  static args = [
    { name: 'index', description: 'Index name', required: true },
    { name: 'collection', description: 'Collection name', required: true }
  ]

  async runSafe() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(DocumentCreate)

    this.sdk = new KuzzleSDK(userFlags)
    await this.sdk.init(this.log)

    const stdin = await this.fromStdin()

    const body = stdin
      ? stdin
      : userFlags.body

    let document: any

    if (userFlags.replace) {
      document = await this.sdk.document.replace(
        args.index,
        args.collection,
        userFlags.id,
        this.parseJs(body),
        { refresh: 'wait_for' })
    }
    else {
      document = await this.sdk.document.create(
        args.index,
        args.collection,
        this.parseJs(body),
        userFlags.id,
        { refresh: 'wait_for' })
    }

    this.log(JSON.stringify(document, null, 2))
  }
}
