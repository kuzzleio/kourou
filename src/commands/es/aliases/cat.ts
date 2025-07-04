import { flags } from '@oclif/command'
import { Client } from 'sdk-es7'

import { Kommand } from '../../../common'

export default class EsListAliases extends Kommand {
  static initSdk = false

  static description = 'Lists available ES aliases'

  static flags = {
    help: flags.help(),
    node: flags.string({
      char: 'n',
      description: 'Elasticsearch server URL',
      default: 'http://localhost:9200',
    }),
    grep: flags.string({
      char: 'g',
      description: 'Match output with pattern',
    }),
  }

  async runSafe() {
    const esClient = new Client({ node: this.flags.node })

    try {
      const { body } = await esClient.cat.aliases({ format: 'json' });
      const elements: string[] = body
        .map((e:any) => ({ index: e.index, alias: e.alias}))
        .filter((e: any) => (
          this.flags.grep ? e.alias.match(new RegExp(this.flags.grep)) : true
        ))
        .sort()
      this.log(JSON.stringify(elements, null, 2))
    }
    catch (error: any) {
      console.log(error)
    }
  }
}
