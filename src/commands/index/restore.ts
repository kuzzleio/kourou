import { flags } from '@oclif/command'
import { Kommand, printCliName } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../kuzzle'
import * as fs from 'fs'
import chalk from 'chalk'
import restoreCollection from '../../support/restore-collection'

export default class IndexRestore extends Kommand {
  static description = 'Restore the content of a previously dumped index'

  static flags = {
    help: flags.help({}),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsWriteCount config)',
      default: '5000'
    }),
    index: flags.string({
      description: 'If set, override the index destination name',
    }),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'path', description: 'Dump directory or file', required: true },
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
    this.log(`${printCliName()} - ${IndexRestore.description}`)
    this.log('')

    const { args, flags: userFlags } = this.parse(IndexRestore)

    const index = userFlags.index

    const sdk = new KuzzleSDK(userFlags)

    await sdk.init()

    if (index) {
      this.log(chalk.green(`[✔] Start importing dump from ${args.path} in index ${index}`))
    } else {
      this.log(chalk.green(`[✔] Start importing dump from ${args.path} in same index`))
    }

    const dumpFiles = fs.readdirSync(args.path).map(f => `${args.path}/${f}`)

    try {
      for (const dumpFile of dumpFiles) {
        await restoreCollection(
          sdk,
          this.log.bind(this),
          Number(userFlags['batch-size']),
          dumpFile,
          index)

        if (index) {
          this.log(chalk.green(`[✔] Dump file ${dumpFile} imported in index ${index}`))
        } else {
          this.log(chalk.green(`[✔] Dump file ${dumpFile} imported`))
        }
      }
    } catch (error) {
      this.log(chalk.red(`[ℹ] Error while importing: ${error.message}`))
    }
  }
}
