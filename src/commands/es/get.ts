import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { Client } from '@elastic/elasticsearch'

export default class EsGet extends Kommand {
  static description = 'Get a document from ES'

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

  async run() {
    try {
      await this.runSafe()
    }
    catch (error) {
      this.logError(error)
    }
  }

  async runSafe() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(EsGet)

    const node = `http://${userFlags.host}:${userFlags.port}`
    const esClient = new Client({ node })
    const esRequest = {
      index: args.index,
      id: args.id
    }

    try {
      const { body } = await esClient.get(esRequest)

      this.log(JSON.stringify(body, null, 2))
    }
    catch (error) {
      this.log(JSON.stringify(error, null, 2))
      this.log(error.message)
    }
  }
}
