import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import { dumpCollectionData, dumpCollectionMappings } from '../../support/dump-collection'
import * as fs from 'fs'
import cli from 'cli-ux'
import chalk from 'chalk'

export default class IndexExport extends Kommand {
  static description = 'Exports an index (JSONL format)'

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

  async runSafe() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(IndexExport)

    const path = userFlags.path || args.index

    this.sdk = new KuzzleSDK({ protocol: 'ws', loginTTL: '1d', ...userFlags })
    await this.sdk.init(this.log)

    this.log(chalk.green(`Dumping index "${args.index}" in ${path}/ ...`))

    fs.mkdirSync(path, { recursive: true })

    const { collections } = await this.sdk.collection.list(args.index, { size: 42000 })

    for (const collection of collections) {
      try {
        if (collection.type !== 'realtime') {
          await dumpCollectionMappings(
            this.sdk,
            args.index,
            collection.name,
            path)

          await dumpCollectionData(
            this.sdk,
            args.index,
            collection.name,
            Number(userFlags['batch-size']),
            path)

          cli.action.stop()
        }
      }
      catch (error) {
        this.logError(`Error when exporting collection "${collection.name}": ${error}`)
      }
    }

    this.log(chalk.green(`[✔] Index ${args.index} dumped`))
  }
}
