import { flags } from '@oclif/command'
import { Client } from '@elastic/elasticsearch'

import { Kommand } from '../../../common'

export default class EsSnapshotsCreateRepository extends Kommand {
  static initSdk = false

  static description = 'Create a FS snapshot repository inside an ES instance'

  static flags = {
    compress: flags.boolean({
      description: 'Compress data when storing them',
      default: false
    }),
    node: flags.string({
      char: 'n',
      description: 'Elasticsearch server URL',
      default: 'http://localhost:9200',
    }),
    help: flags.help(),
  }

  static args = [
    { name: 'repository', description: 'ES repository name', required: true },
    { name: 'location', description: 'ES snapshot repository location', required: true },
  ]

  async runSafe() {
    const esClient = new Client({ node: this.flags.node })

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
