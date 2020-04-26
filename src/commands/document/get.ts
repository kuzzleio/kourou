import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'

export default class DocumentGet extends Kommand {
  static description = 'Gets a document'

  static flags = {
    help: flags.help(),
    ...kuzzleFlags
  }

  static args = [
    { name: 'index', description: 'Index name', required: true },
    { name: 'collection', description: 'Collection name', required: true },
    { name: 'id', description: 'Document ID', required: true }
  ]

  async runSafe() {
    const { args, flags: userFlags } = this.parse(DocumentGet)

    this.sdk = new KuzzleSDK(userFlags)
    await this.sdk.init(this.log)

    const document = await this.sdk.document.get(
      args.index,
      args.collection,
      args.id)

    this.log(JSON.stringify(document, null, 2))
  }
}
