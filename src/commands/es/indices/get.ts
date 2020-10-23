import { flags } from '@oclif/command'
import { Client } from '@elastic/elasticsearch'

import { Kommand } from '../../../common'

export default class EsGet extends Kommand {
  static initSdk = false

  static description = 'Gets a document from ES'

  static flags = {
    help: flags.help(),
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
  }

  static args = [
    { name: 'index', description: 'ES Index name', required: true },
    { name: 'id', description: 'Document ID', required: true }
  ]

  async runSafe() {
    // @todo support ssl
    const node = `http://${this.flags.host}:${this.flags.port}`

    const esClient = new Client({ node })

    const esRequest = {
      index: this.args.index,
      id: this.args.id
    }

    const { body } = await esClient.get(esRequest)

    this.log(JSON.stringify(body, null, 2))
  }
}
