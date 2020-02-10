import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import chalk from 'chalk'
import restoreCollection from '../../support/restore-collection'

export default class CollectionRestore extends Kommand {
  static description = 'Restore the content of a previously dumped collection'

  static flags = {
    help: flags.help({}),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsFetchCount config)',
      default: '5000'
    }),
    index: flags.string({
      description: 'If set, override the index destination name',
    }),
    collection: flags.string({
      description: 'If set, override the collection destination name',
    }),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'path', description: 'Dump file path', required: true },
  ]

  async run() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(CollectionRestore)

    const index = userFlags.index
    const collection = userFlags.collection

    const sdk = new KuzzleSDK(userFlags)

    await sdk.init()

    this.log(chalk.green(`[✔] Start importing dump from ${args.path}`))

    try {
      await restoreCollection(
        sdk,
        this.log.bind(this),
        Number(userFlags['batch-size']),
        args.path,
        index,
        collection)

      this.log(chalk.green(`[✔] Dump file ${args.path} imported`))
    } catch (error) {
      this.log(chalk.red(`[ℹ] Error while importing: ${error.message}`))
    }
  }
}
