import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

export default class DocumentSearch extends Kommand {
  static description = 'Searches for documents'

  static examples = [
    'kourou document:search iot sensors \'{ equals: { name: "corona" } }\'',
    'kourou document:search iot sensors \'{ match: { name: "cOrOnna" } }\' -a lang=elasticsearch',
    'kourou document:search iot sensors --editor',
  ]

  static flags = {
    sort: flags.string({
      description: 'Sort in JS or JSON format.',
      default: '{}'
    }),
    aggs: flags.string({
      description: 'Aggregations in JS or JSON format.',
      default: '{}'
    }),
    from: flags.string({
      description: 'Optional offset'
    }),
    size: flags.string({
      description: 'Optional page size',
    }),
    scroll: flags.string({
      description: 'Optional scroll TTL'
    }),
    lang: flags.string({
      description: 'Specify the query language to use',
      default: 'koncorde'
    }),
    editor: flags.boolean({
      description: 'Open an editor (EDITOR env variable) to edit the request before sending'
    }),
    help: flags.help(),
    ...kuzzleFlags
  }

  static args = [
    { name: 'index', description: 'Index name', required: true },
    { name: 'collection', description: 'Collection name', required: true },
    { name: 'query', description: 'Search query in JS or JSON format.' },
  ]

  async runSafe() {
    let request: any = {
      controller: 'document',
      action: 'search',
      index: this.args.index,
      collection: this.args.collection,
      from: this.flags.from,
      size: this.flags.size,
      scroll: this.flags.scroll,
      lang: this.flags.lang,
      body: {
        query: this.parseJs(this.args.query || '{}'),
        sort: this.parseJs(this.flags.sort),
        aggs: this.parseJs(this.flags.aggs)
      }
    }

    // allow to edit request before send
    if (this.flags.editor) {
      request = this.fromEditor(request, { json: true })
    }

    const { result } = await this.sdk.query(request)

    for (const document of result?.hits || []) {
      this.logInfo(`Document ID: ${document._id}`)
      this.log(`Content: ${JSON.stringify(document._source, null, 2)}`)
    }

    this.logOk(`${result?.hits.length} documents fetched on a total of ${result?.total}`)
  }
}
