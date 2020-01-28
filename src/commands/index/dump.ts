import { flags } from '@oclif/command'
import { Kommand, printCliName } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../kuzzle'
import dumpCollection from '../../support/dump-collection'
import * as fs from 'fs'
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
      default: '5000'
    }),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'index', description: 'Index name', required: true },
  ]

  async run() {
    this.log('')
    this.log(`${printCliName()} - ${IndexDump.description}`)
    this.log('')

    const { args, flags: userFlags } = this.parse(IndexDump)

    const path = userFlags.path || args.index

    const sdk = new KuzzleSDK(userFlags)
    await sdk.init()

    this.log(`Dumping index "${args.index}" in ${path}/ ...`)

    fs.mkdirSync(path, { recursive: true })

    const { collections } = await sdk.collection.list(args.index)

    for (const collection of collections) {
      if (collection.type !== 'realtime') {
        await dumpCollection(
          sdk,
          args.index,
          collection.name,
          Number(userFlags['batch-size']),
          path)

        this.log(chalk.green(`[✔] Collection ${args.index}:${collection.name} dumped`))
      }
    }
  }
}
