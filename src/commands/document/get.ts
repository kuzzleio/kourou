import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

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
    const document = await this.sdk?.document.get(
      this.args.index,
      this.args.collection,
      this.args.id)

    this.log(JSON.stringify(document, null, 2))
  }
}
