import { flags } from '@oclif/command'
import { Client } from '@elastic/elasticsearch'

import { Kommand } from '../../../common'

export default class EsCreateSnapshot extends Kommand {
  static initSdk = false

  static description = 'Create a snapshot repository inside an ES instance'

  static flags = {
    compress: flags.boolean({
      description: 'Compress data when storing them',
      default: false
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
    { name: 'repository', description: 'ES repository name', required: true },
    { name: 'location', description: 'ES snapshot repository location', required: true },
  ]

  async runSafe() {
    // @todo support ssl
    const node = `http://${this.flags.host}:${this.flags.port}`

    const esClient = new Client({ node })

    const esRequest = {
      repository: this.args.repository,
      verify: true,
      body: {
        type: 'fs',
        settings: {
          location: this.args.location,
          compress: this.flags.compress
        }
      }
    }

    const response = await esClient.snapshot.createRepository(esRequest)

    this.logOk(`Success ${JSON.stringify(response.body)}`)
  }
}
