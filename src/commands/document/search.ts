import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import chalk from 'chalk'

export default class DocumentSearch extends Kommand {
  static description = 'Searches for documents'

  static examples = [
    'kourou document:search iot sensors --query \'{ term: { name: "corona" } }\'',
    'kourou document:search iot sensors --editor',
  ]

  static flags = {
    query: flags.string({
      description: 'Query in JS or JSON format.',
      default: '{}'
    }),
    sort: flags.string({
      description: 'Sort in JS or JSON format.',
      default: '{}'
    }),
    from: flags.string({
      description: 'Optional offset'
    }),
    size: flags.string({
      description: 'Optional page size',
    }),
    scroll: flags.string({
      description: 'Optional scroll TTL'
    }),
    editor: flags.boolean({
      description: 'Open an editor (EDITOR env variable) to edit the request before sending'
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

    const { args, flags: userFlags } = this.parse(DocumentSearch)

    const sdk = new KuzzleSDK(userFlags)
    await sdk.init(this.log)

    let request: any = {
      controller: 'document',
      action: 'search',
      index: args.index,
      collection: args.collection,
      from: userFlags.from,
      size: userFlags.size,
      scroll: userFlags.scroll,
      body: {
        query: this.parseJs(userFlags.query),
        sort: this.parseJs(userFlags.sort)
      }
    }

    // allow to edit request before send
    if (userFlags.editor) {
      request = this.fromEditor(request, { json: true })
    }

    const { result } = await sdk.query(request)

    for (const document of result.hits) {
      this.log(chalk.yellow(`Document ID: ${document._id}`))
      this.log(`Content: ${JSON.stringify(document._source, null, 2)}`)
    }

    this.log(chalk.green(`${result.hits.length} documents fetched on a total of ${result.total}`))
  }
}
