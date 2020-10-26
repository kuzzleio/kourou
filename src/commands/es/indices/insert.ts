import { flags } from '@oclif/command'
import { Client } from '@elastic/elasticsearch'

import { Kommand } from '../../../common'

export default class EsInsert extends Kommand {
  static initSdk = false

  static description = 'Inserts a document directly into ES (will replace if exists)'

  static flags = {
    body: flags.string({
      description: 'Document body in JSON',
      default: '{}'
    }),
    id: flags.string({
      description: 'Document ID'
    }),
    host: flags.string({
      char: 'h',
      description: 'Elasticsearch server host',
      default: process.env.KUZZLE_HOST || 'localhost',
    }),
    port: flags.string({
      char: 'p',
      description: 'Elasticsearch server port',
      default: process.env.KUZZLE_PORT || '9200',
    }),
    help: flags.help(),
  }

  static args = [
    { name: 'index', description: 'ES Index name', required: true },
  ]

  async runSafe() {
    // @todo support ssl
    const node = `http://${this.flags.host}:${this.flags.port}`

    const esClient = new Client({ node })

    const esRequest = {
      index: this.args.index,
      id: this.flags.id,
      body: this.flags.body,
    }

    await esClient.index(esRequest)

    this.logOk('Document successfully inserted.')
  }
}
