import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

export default class DocumentCreate extends Kommand {
  static description = 'Creates a document'

  static examples = [
    'kourou document:create iot sensors \'{network: "sigfox"}\'',
    'kourou document:create iot sensors < document.json',
  ]

  static flags = {
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
    { name: 'collection', description: 'Collection name', required: true },
    { name: 'body', description: 'Document body in JS or JSON format. Will be read from STDIN if available' }
  ]

  static readStdin = true

  async runSafe() {
    const body = this.stdin ? this.stdin : this.args.body

    if (this.flags.replace) {
      const document = await this.sdk?.document.replace(
        this.args.index,
        this.args.collection,
        this.flags.id,
        this.parseJs(body),
        { refresh: 'wait_for' })

      this.logOk(`Document "${document._id}" successfully replaced`)
    }
    else {
      const document = await this.sdk?.document.create(
        this.args.index,
        this.args.collection,
        this.parseJs(body),
        this.flags.id,
        { refresh: 'wait_for' })

      this.logOk(`Document "${document._id}" successfully created`)
    }
  }
}
