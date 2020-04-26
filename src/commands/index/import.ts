import * as path from 'path'
import * as fs from 'fs'

import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import { restoreCollectionData, restoreCollectionMappings } from '../../support/restore-collection'

export default class IndexImport extends Kommand {
  static description = ''

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
  }

  static args = [
    { name: 'path', description: 'Dump directory or file', required: true },
  ]

  async runSafe() {
    const { args, flags: userFlags } = this.parse(IndexImport)

    const index = userFlags.index

    this.sdk = new KuzzleSDK({ protocol: 'ws', ...userFlags })
    await this.sdk.init(this.log)

    if (index) {
      this.logOk(`Start importing dump from ${args.path} in index ${index}`)
    }
    else {
      this.logOk(`Start importing dump from ${args.path} in same index`)
    }

    const dumpDirs = fs.readdirSync(args.path).map(f => `${args.path}/${f}`)

    for (const dumpDir of dumpDirs) {
      try {
        if (!userFlags['no-mappings']) {
          const mappingsPath = path.join(dumpDir, 'mappings.json')
          const dump = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'))

          await restoreCollectionMappings(
            this.sdk,
            dump,
            index)
        }

        const { total, collection, index: dstIndex } = await restoreCollectionData(
          this.sdk,
          this.log.bind(this),
          Number(userFlags['batch-size']),
          path.join(dumpDir, 'documents.jsonl'),
          index)

        this.logOk(`Successfully imported ${total} documents in "${dstIndex}:${collection}"`)
      }
      catch (error) {
        this.logError(`Error when importing collection from "${dumpDir}": ${error}`)
      }

      if (index) {
        this.logOk(`Dump directory ${dumpDir} imported in index ${index}`)
      }
      else {
        this.logOk(`Dump directory ${dumpDir} imported`)
      }
    }
  }
}
