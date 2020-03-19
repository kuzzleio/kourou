import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import { dumpCollectionData, dumpCollectionMappings } from '../../support/dump-collection'
import * as fs from 'fs'
import chalk from 'chalk'

export default class CollectionDump extends Kommand {
  static description = 'Dump an entire collection content (JSONL format)'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump root directory (default: index name)',
    }),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsFetchCount config)',
      default: '2000'
    }),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'index', description: 'Index name', required: true },
    { name: 'collection', description: 'Collection name', required: true },
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

    const { args, flags: userFlags } = this.parse(CollectionDump)

    const path = userFlags.path || args.index

    const sdk = new KuzzleSDK({ loginTTL: true, ...userFlags })
    await sdk.init(this.log)

    this.log(chalk.green(`Dumping collection "${args.index}:${args.collection}" in ${path}/ ...`))

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
      path)

    this.log(chalk.green(`[✔] Collection ${args.index}:${args.collection} dumped`))
  }
}
