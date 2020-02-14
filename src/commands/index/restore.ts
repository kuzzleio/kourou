import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import * as fs from 'fs'
import chalk from 'chalk'
import { restoreCollectionData, restoreCollectionMappings } from '../../support/restore-collection'

export default class IndexRestore extends Kommand {
  static description = 'Restore the content of a previously dumped index'

  static flags = {
    help: flags.help({}),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsWriteCount config)',
      default: '200'
    }),
    index: flags.string({
      description: 'If set, override the index destination name',
    }),
    mappings: flags.boolean({
      description: 'Restore collections mappings',
      default: true
    }),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'path', description: 'Dump directory or file', required: true },
  ]

  async run() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(IndexRestore)

    const index = userFlags.index

    const sdk = new KuzzleSDK(userFlags)

    await sdk.init()

    if (index) {
      this.log(chalk.green(`[✔] Start importing dump from ${args.path} in index ${index}`))
    }
    else {
      this.log(chalk.green(`[✔] Start importing dump from ${args.path} in same index`))
    }

    const dumpDirs = fs.readdirSync(args.path).map(f => `${args.path}/${f}`)

    try {
      for (const dumpDir of dumpDirs) {
        await restoreCollectionMappings(
          sdk,
          dumpDir,
          index)

        await restoreCollectionData(
          sdk,
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
    } catch (error) {
      this.log(chalk.red(`[ℹ] Error while importing: ${error.message}`))
    }
  }
}
