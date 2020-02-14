import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { Client } from '@elastic/elasticsearch'

export default class EsListIndex extends Kommand {
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

    const { flags: userFlags } = this.parse(EsListIndex)

    const node = `http://${userFlags.host}:${userFlags.port}`
    const esClient = new Client({ node })

    try {
      const { body } = await esClient.cat.indices({ format: 'json' })
      // nice typescript destructuring syntax (:
      const indexes: string[] = body
        .map(({ index }: { index: string }) => index)
        .filter((index: string) => (
          userFlags.grep ? index.match(new RegExp(userFlags.grep)) : true
        ))
        .sort()

      this.log(JSON.stringify(indexes, null, 2))
    }
    catch (error) {
      this.log(JSON.stringify(error, null, 2))
      this.log(error.message)
    }
  }
}
