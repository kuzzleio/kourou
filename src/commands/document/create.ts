import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'

export default class DocumentCreate extends Kommand {
  static description = 'Creates a document'

  static flags = {
    body: flags.string({
      description: 'Document body in JSON format',
      required: true
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

    const { args, flags: userFlags } = this.parse(DocumentCreate)

    const sdk = new KuzzleSDK(userFlags)
    await sdk.init(this.log)

    try {
      let document: any

      const body = JSON.parse(userFlags.body)

      if (userFlags.replace) {
        document = await sdk.document.replace(
          args.index,
          args.collection,
          userFlags.id,
          body,
          { refresh: 'wait_for' })
      }
      else {
        document = await sdk.document.create(
          args.index,
          args.collection,
          body,
          userFlags.id,
          { refresh: 'wait_for' })
      }

      this.log(JSON.stringify(document, null, 2))
    } catch (error) {
      this.logError(error.message)
    }
  }
}
