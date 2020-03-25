import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import * as fs from 'fs'
import chalk from 'chalk'
import { restoreCollectionData, restoreCollectionMappings } from '../../support/restore-collection'

export default class IndexImport extends Kommand {
  static description = 'Imports an index'

  static flags = {
    help: flags.help({}),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsWriteCount config)',
      default: '200'
    }),
    index: flags.string({
      description: 'If set, override the index destination name',
    }),
    'no-mappings': flags.boolean({
      description: 'Skip collections mappings'
    }),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'path', description: 'Dump directory or file', required: true },
  ]

  async runSafe() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(IndexImport)

    const index = userFlags.index

    this.sdk = new KuzzleSDK({ protocol: 'ws', loginTTL: '1d', ...userFlags })

    await this.sdk.init(this.log)

    if (index) {
      this.log(chalk.green(`[✔] Start importing dump from ${args.path} in index ${index}`))
    }
    else {
      this.log(chalk.green(`[✔] Start importing dump from ${args.path} in same index`))
    }

    const dumpDirs = fs.readdirSync(args.path).map(f => `${args.path}/${f}`)

    for (const dumpDir of dumpDirs) {
      if (!userFlags['no-mappings']) {
        await restoreCollectionMappings(
          this.sdk,
          dumpDir,
          index)
      }

      await restoreCollectionData(
        this.sdk,
        this.log.bind(this),
        Number(userFlags['batch-size']),
        dumpDir,
        index)

      if (index) {
        this.log(chalk.green(`[✔] Dump directory ${dumpDir} imported in index ${index}`))
      }
      else {
        this.log(chalk.green(`[✔] Dump directory ${dumpDir} imported`))
      }
    }
  }
}
