import { flags } from '@oclif/command'
import { Kommand, printCliName } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../kuzzle'
import dumpCollection from '../../support/dump-collection'
import * as fs from 'fs'
import chalk from 'chalk'

export default class CollectionDump extends Kommand {
  static description = 'Dump an entire collection content (JSONL format)'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump directory (default: index name)',
    }),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsFetchCount config)',
      default: '5000'
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
    this.log('')
    this.log(`${printCliName()} - ${CollectionDump.description}`)
    this.log('')

    const { args, flags: userFlags } = this.parse(CollectionDump)

    const path = userFlags.path || args.index

    const sdk = new KuzzleSDK(userFlags)
    await sdk.init()

    this.log(`Dumping collection "${args.index}:${args.collection}" in ${path}/ ...`)

    fs.mkdirSync(path, { recursive: true })

    await dumpCollection(
      sdk,
      args.index,
      args.collection,
      Number(userFlags['batch-size']),
      path)

    this.log(chalk.green(`[✔] Collection ${args.index}:${args.collection.name} dumped`))
  }
}
