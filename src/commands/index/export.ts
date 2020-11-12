import { flags } from '@oclif/command'
import fs from 'fs'
import cli from 'cli-ux'
import path from 'path'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'
import { dumpCollectionData, dumpCollectionMappings } from '../../support/dump-collection'

export default class IndexExport extends Kommand {
  static description = 'Exports an index (JSONL or Kuzzle format)'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump root directory',
    }),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsFetchCount config)',
      default: '2000'
    }),
    format: flags.string({
      description: '"jsonl or kuzzle - kuzzle will export in Kuzzle format usable for internal fixtures and jsonl will be usable to re import those data with kourou',
      default: 'jsonl'
    }),
    ...kuzzleFlags,
    protocol: flags.string({
      description: 'Kuzzle protocol (http or websocket)',
      default: 'ws',
    }),
  }

  static args = [
    { name: 'index', description: 'Index name', required: true },
  ]

  async runSafe() {
    const exportPath = this.flags.path
      ? path.join(this.flags.path, this.args.index)
      : this.args.index

    this.logInfo(`Dumping index "${this.args.index}" in ${exportPath}${path.sep} ...`)

    fs.mkdirSync(exportPath, { recursive: true })

    const { collections } = await this.sdk.collection.list(this.args.index)

    for (const collection of collections) {
      try {
        if (collection.type !== 'realtime') {
          await dumpCollectionMappings(
            this.sdk,
            this.args.index,
            collection.name,
            exportPath,
            this.flags.format)

          await dumpCollectionData(
            this.sdk,
            this.args.index,
            collection.name,
            Number(this.flags['batch-size']),
            exportPath,
            {},
            this.flags.format)

          cli.action.stop()
        }
      }
      catch (error) {
        this.logKo(`Error when exporting collection "${collection.name}": ${error}`)
      }
    }

    this.logOk(`Index ${this.args.index} dumped`)
  }
}
