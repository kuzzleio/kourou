import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import { dumpCollectionData, dumpCollectionMappings } from '../../support/dump-collection'
import * as fs from 'fs'
import chalk from 'chalk'

export default class CollectionExport extends Kommand {
  static description = 'Exports a collection (JSONL format)'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump root directory (default: index name)',
    }),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsFetchCount config)',
      default: '2000'
    }),
    query: flags.string({
      description: 'Only dump documents matching the query (JS or JSON format)',
      default: '{}'
    }),
    editor: flags.boolean({
      description: 'Open an editor (EDITOR env variable) to edit the query before sending'
    }),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'index', description: 'Index name', required: true },
    { name: 'collection', description: 'Collection name', required: true },
  ]

  static examples = [
    'kourou collection:export nyc-open-data yellow-taxi',
    'kourou collection:export nyc-open-data yellow-taxi --query \'{ term: { city: "Saigon" } }\'',
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

    const { args, flags: userFlags } = this.parse(CollectionExport)

    const path = userFlags.path || args.index

    const sdk = new KuzzleSDK({ loginTTL: true, ...userFlags })
    await sdk.init(this.log)

    let query = this.parseJs(userFlags.query)

    if (userFlags.editor) {
      query = this.fromEditor(query, { json: true })
    }

    const countAll = await sdk.document.count(args.index, args.collection)
    const count = await sdk.document.count(args.index, args.collection, { query })

    this.log(`Dumping ${count} of ${countAll} documents from collection "${args.index}:${args.collection}" in ${path}/ ...`)

    fs.mkdirSync(path, { recursive: true })

    await dumpCollectionMappings(
      sdk,
      args.index,
      args.collection,
      path)

    await dumpCollectionData(
      sdk,
      args.index,
      args.collection,
      Number(userFlags['batch-size']),
      path,
      query)

    this.log(chalk.green(`[✔] Collection ${args.index}:${args.collection} dumped`))
  }
}
