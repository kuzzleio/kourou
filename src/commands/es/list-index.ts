import { flags } from '@oclif/command'
import { Client } from '@elastic/elasticsearch'

import { Kommand } from '../../common'

export default class EsListIndex extends Kommand {
  static initSdk = false

  static description = 'Lists available ES indexes'

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
    grep: flags.string({
      char: 'g',
      description: 'Match output with pattern',
    })
  }

  async runSafe() {
    // @todo support ssl
    const node = `http://${this.flags.host}:${this.flags.port}`

    const esClient = new Client({ node })

    const { body } = await esClient.cat.indices({ format: 'json' })

    // nice typescript destructuring syntax (:
    const indexes: string[] = body
      .map(({ index }: { index: string }) => index)
      .filter((index: string) => (
        this.flags.grep ? index.match(new RegExp(this.flags.grep)) : true
      ))
      .sort()

    this.log(JSON.stringify(indexes, null, 2))
  }
}
