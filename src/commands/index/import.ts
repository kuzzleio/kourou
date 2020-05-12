import * as path from 'path'
import * as fs from 'fs'

import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'
import { restoreCollectionData, restoreCollectionMappings } from '../../support/restore-collection'

export default class IndexImport extends Kommand {
  static description = 'Imports an index (JSONL format)'

  static examples = [
    'kourou index:import ./dump/iot-data',
    'kourou index:import ./dump/iot-data --index iot-data-production --no-mappings'
  ]

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
    protocol: flags.string({
      description: 'Kuzzle protocol (http or websocket)',
      default: 'ws',
    }),
  }

  static args = [
    { name: 'path', description: 'Dump directory or file', required: true },
  ]

  async runSafe() {
    if (this.flags.index) {
      this.logInfo(`Start importing dump from ${this.args.path} in index ${this.flags.index}`)
    }
    else {
      this.logInfo(`Start importing dump from ${this.args.path} in same index`)
    }

    const dumpDirs = fs.readdirSync(this.args.path).map(f => path.join(this.args.path, f))

    for (const dumpDir of dumpDirs) {
      try {
        if (!this.flags['no-mappings']) {
          const mappingsPath = path.join(dumpDir, 'mappings.json')
          const dump = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'))

          await restoreCollectionMappings(
            this.sdk,
            dump,
            this.flags.index)
        }

        const { total, collection, index: dstIndex } = await restoreCollectionData(
          this.sdk,
          this.log.bind(this),
          Number(this.flags['batch-size']),
          path.join(dumpDir, 'documents.jsonl'),
          this.flags.index)

        this.logOk(`Successfully imported ${total} documents in "${dstIndex}:${collection}"`)
      }
      catch (error) {
        this.logKo(`Error when importing collection from "${dumpDir}": ${error}`)
      }
    }
  }
}
