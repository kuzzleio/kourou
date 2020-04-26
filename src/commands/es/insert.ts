import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { Client } from '@elastic/elasticsearch'

export default class EsInsert extends Kommand {
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
    const { args, flags: userFlags } = this.parse(EsInsert)

    const node = `http://${userFlags.host}:${userFlags.port}`
    const esClient = new Client({ node })
    const esRequest = {
      index: args.index,
      id: userFlags.id,
      body: userFlags.body,
    }

    try {
      const { body } = await esClient.index(esRequest)

      this.log(JSON.stringify(body, null, 2))
    }
    catch (error) {
      this.logError(JSON.stringify(error, null, 2))
      throw error
    }
  }
}
