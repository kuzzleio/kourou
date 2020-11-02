import { flags } from '@oclif/command'
import { Client } from '@elastic/elasticsearch'

import { Kommand } from '../../../common'

export default class EsSnapshotsList extends Kommand {
  static initSdk = false

  static description = 'List all snapshot from a repository acknowledge by an ES instance'

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
    { name: 'repository', description: 'Name of repository from which to fetch the snapshot information', required: true },
  ]

  async runSafe() {
    // @todo support ssl
    const node = `http://${this.flags.host}:${this.flags.port}`

    const esClient = new Client({ node })

    const esRequest = {
      repository: this.args.repository,
      ignore_unavailable: true,
    }

    const response = await esClient.cat.snapshots(esRequest)
    const snapshots = response.body.split('\n').filter(Boolean)
    const result = []

    for (const snapshot of snapshots) {
      const snap = snapshot.split(' ').filter(Boolean)
      result.push({
        name: snap[0],
        status: snap[1],
        timestampStart: snap[2],
        hourStart: snap[3],
        timeStampEnd: snap[4],
        hourEnd: snap[5],
        duration: snap[6]
      })
    }

    this.logOk(`Success: ${JSON.stringify(result, null, 2)}`)
  }
}
