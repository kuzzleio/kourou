import { flags } from '@oclif/command'
import { Client } from '@elastic/elasticsearch'

import { Kommand } from '../../../common'

export default class ESRestore extends Kommand {
  static initSdk = false

  static description = 'Restore a snapshot into an ES instance'

  static flags = {
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
    { name: 'repository', description: 'ES repository name', required: true },
    { name: 'name', description: 'ES snapshot name', required: true },
  ]

  async getIndices(esClient: Client) {
    const beforeResponse = await esClient.cat.indices({ format: 'json' })

    const indices = beforeResponse.body
      .map(({ index }: { index: string }) => index)

    return indices
  }

  async runSafe() {
    // @todo support ssl
    const node = `http://${this.flags.host}:${this.flags.port}`

    const esClient = new Client({ node })

    const indices = await this.getIndices(esClient)
    for (const index of indices) {
      await esClient.indices.close({ index })
    }

    const esRequest = {
      repository: this.args.repository,
      snapshot: this.args.name,
      body: {}
    }

    const response = await esClient.snapshot.restore(esRequest)

    this.logOk(`Success ${JSON.stringify(response.body, null, 2)}`)
  }
}
