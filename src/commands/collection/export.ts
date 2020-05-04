import { flags } from '@oclif/command'
import * as fs from 'fs'
import path from 'path'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'
import { dumpCollectionData, dumpCollectionMappings } from '../../support/dump-collection'

export default class CollectionExport extends Kommand {
  static description = 'Exports a collection (JSONL format)'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump root directory',
    }),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsFetchCount config)',
      default: '2000'
    }),
    query: flags.string({
      description: 'Only dump documents matching the query (JS or JSON format)',
      default: '{}'
    }),
    editor: flags.boolean({
      description: 'Open an editor (EDITOR env variable) to edit the query before sending'
    }),
    ...kuzzleFlags,
    protocol: flags.string({
      description: 'Kuzzle protocol (http or websocket)',
      default: 'ws',
    }),
  }

  static args = [
    { name: 'index', description: 'Index name', required: true },
    { name: 'collection', description: 'Collection name', required: true },
  ]

  static examples = [
    'kourou collection:export nyc-open-data yellow-taxi',
    'kourou collection:export nyc-open-data yellow-taxi --query \'{ term: { city: "Saigon" } }\'',
  ]

  async runSafe() {
    const exportPath = this.flags.path
      ? path.join(this.flags.path, this.args.index)
      : this.args.index

    let query = this.parseJs(this.flags.query)

    if (this.flags.editor) {
      query = this.fromEditor(query, { json: true })
    }

    const countAll = await this.sdk?.document.count(this.args.index, this.args.collection)
    const count = await this.sdk?.document.count(this.args.index, this.args.collection, { query })

    this.logInfo(`Dumping ${count} of ${countAll} documents from collection "${this.args.index}:${this.args.collection}" in ${path}/ ...`)

    fs.mkdirSync(exportPath, { recursive: true })

    await dumpCollectionMappings(
      this.sdk,
      this.args.index,
      this.args.collection,
      exportPath)

    await dumpCollectionData(
      this.sdk,
      this.args.index,
      this.args.collection,
      Number(this.flags['batch-size']),
      exportPath,
      query)

    this.logOk(`Collection ${this.args.index}:${this.args.collection} dumped`)
  }
}
