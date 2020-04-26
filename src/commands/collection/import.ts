import * as path from 'path'
import * as fs from 'fs'

import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
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
  }

  static args = [
    { name: 'path', description: 'Dump directory path', required: true },
  ]

  async runSafe() {
    const { args, flags: userFlags } = this.parse(CollectionImport)

    const index = userFlags.index
    const collection = userFlags.collection

    this.sdk = new KuzzleSDK({ protocol: 'ws', loginTTL: '1d', ...userFlags })

    await this.sdk.init(this.log)

    this.logInfo(`Start importing dump from ${args.path}`)

    if (!userFlags['no-mappings']) {
      const mappingsPath = path.join(args.path, 'mappings.json')
      const dump = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'))

      await restoreCollectionMappings(
        this.sdk,
        dump,
        index,
        collection)
    }

    const { total } = await restoreCollectionData(
      this.sdk,
      this.log.bind(this),
      Number(userFlags['batch-size']),
      path.join(args.path, 'documents.jsonl'),
      index,
      collection)

    this.logOk(`Successfully imported ${total} documents in "${index}:${collection}"`)

    this.logOk(`Dump directory ${args.path} imported`)
  }
}
