import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

export default class RedisListKeys extends Kommand {
  static description = 'Lists keys stored in Redis'

  static flags = {
    help: flags.help(),
    remove: flags.boolean({
      description: 'Remove matching keys',
      default: false
    }),
    size: flags.string({
      description: 'Page size',
      default: '100'
    }),
    max: flags.string({
      description: 'Maximum number of page to retrieve (-1 to retrieve everything)',
      default: '-1'
    }),
    ...kuzzleFlags
  }

  static args = [
    { name: 'match', description: 'Match Redis keys with a pattern', default: '*' },
  ]

  static readStdin = true

  async runSafe() {
    const match = this.args.match
    const count = parseInt(this.flags.size, 10)
    const maxPages = parseInt(this.flags.max, 10)

    this.logInfo(`Start searching for keys matching "${match}...`)

    let keys = []
    let cursor = '0'
    let pages = 0

    do {
      const result = await this.sdk.ms.scan(cursor, { count, match });

      cursor = result.cursor

      for (const key of result.values) {
        keys.push(key)
      }

      pages++
      process.stdout.write(`Iterate on page ${pages}. ${keys.length} keys found so far.`)
      process.stdout.write('\r')

      if (maxPages !== -1 && pages >= maxPages) {
        break;
      }
    } while (cursor !== '0')

    keys = keys.sort()

    const values = await this.sdk.ms.mget(keys)

    for (let i = 0; i < keys.length; i++) {
      this.log(`"${keys[i]}" = ${values[i]}`)
    }

    if (this.flags.remove) {
      await this.sdk.ms.del(keys)
      this.logOk(`${keys.length} keys deleted`);
    }
    else {
      this.logOk(`${keys.length} keys retrieved`);
    }
  }
}

