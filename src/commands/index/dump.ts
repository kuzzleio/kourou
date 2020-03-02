import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import { dumpCollectionData, dumpCollectionMappings } from '../../support/dump-collection'
import * as fs from 'fs'
import cli from 'cli-ux'
import chalk from 'chalk'

export default class IndexDump extends Kommand {
  static description = 'Dump an entire index content (JSONL format)'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump directory (default: index name)',
    }),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsFetchCount config)',
      default: '2000'
    }),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'index', description: 'Index name', required: true },
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

    const { args, flags: userFlags } = this.parse(IndexDump)

    const path = userFlags.path || args.index

    const sdk = new KuzzleSDK(userFlags)
    await sdk.init(this.log)

    this.log(chalk.green(`Dumping index "${args.index}" in ${path}/ ...`))

    fs.mkdirSync(path, { recursive: true })

    const { collections } = await sdk.collection.list(args.index)

    for (const collection of collections) {
      if (collection.type !== 'realtime') {
        await dumpCollectionMappings(
          sdk,
          args.index,
          collection.name,
          path)

        await dumpCollectionData(
          sdk,
          args.index,
          collection.name,
          Number(userFlags['batch-size']),
          path)

        cli.action.stop()
      }
    }

    this.log(chalk.green(`[✔] Index ${args.index} dumped`))
  }
}
