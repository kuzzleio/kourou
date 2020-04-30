import * as path from 'path'
import * as fs from 'fs'

import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'
import { restoreCollectionData, restoreCollectionMappings } from '../../support/restore-collection'

export default class CollectionImport extends Kommand {
  static description = 'Imports a collection'

  static flags = {
    help: flags.help({}),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsWriteCount config)',
      default: '200'
    }),
    index: flags.string({
      description: 'If set, override the index destination name',
    }),
    collection: flags.string({
      description: 'If set, override the collection destination name',
    }),
    'no-mappings': flags.boolean({
      description: 'Skip collection mappings'
    }),
    ...kuzzleFlags,
    protocol: flags.string({
      description: 'Kuzzle protocol (http or websocket)',
      default: 'websocket',
    }),
  }

  static args = [
    { name: 'path', description: 'Dump directory path', required: true },
  ]

  async runSafe() {
    this.logInfo(`Start importing dump from ${this.args.path}`)

    if (!this.flags['no-mappings']) {
      const mappingsPath = path.join(this.args.path, 'mappings.json')
      const dump = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'))

      await restoreCollectionMappings(
        this.sdk,
        dump,
        this.flags.index,
        this.flags.collection)
    }

    const { total } = await restoreCollectionData(
      this.sdk,
      this.log.bind(this),
      Number(this.flags['batch-size']),
      path.join(this.args.path, 'documents.jsonl'),
      this.flags.index,
      this.flags.collection)

    this.logOk(`Successfully imported ${total} documents from "${this.args.path}" in "${this.flags.index}:${this.flags.collection}"`)
  }
}
