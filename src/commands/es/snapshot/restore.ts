import { flags } from '@oclif/command'
import { Client } from '@elastic/elasticsearch'

import { Kommand } from '../../../common'

export default class ESRestore extends Kommand {
  static initSdk = false

  static description = 'Restore a snapshot into an ES instance'

  static flags = {
    node: flags.string({
      char: 'n',
      description: 'Elasticsearch server URL',
      default: 'http://localhost:9200',
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
    const esClient = new Client({ node: this.flags.node })

    const indices = await this.getIndices(esClient)

    try {
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
    } catch (error: any) {
      this.logKo(`Failed to restore requested snapshot ${this.args.name}`)
    } finally {
      for (const index of indices) {
        await esClient.indices.open({ index })
      }
    }
  }
}
