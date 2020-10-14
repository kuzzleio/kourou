import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

class ApiKeySearch extends Kommand {
  public static description = 'Lists a user\'s API Keys.';

  public static flags = {
    help: flags.help(),
    filter: flags.string({
      description: 'Filter to match the API Key descriptions',
    }),
    ...kuzzleFlags,
  };

  static args = [
    { name: 'user', description: 'User kuid', required: true },
  ]

  async runSafe() {
    let query = {}
    if (this.flags.filter) {
      query = {
        match: {
          description: this.flags.filter,
        },
      }
    }

    const result = await this.sdk?.security.searchApiKeys(
      this.args.user,
      query,
      {
        from: 0,
        size: 100
      })

    this.logOk(`${result.total} API Keys found for user ${this.args.user}`)

    if (result.total !== 0) {
      this.log('')
      for (const { _id, _source } of result.hits) {
        this.log(` - Key "${_id}"`)
        this.log(`    Description: ${_source.description}`)
        this.log(`    Fingerprint: ${_source.fingerprint}`)
        this.log(`    Expires at: ${_source.expiresAt}`)
      }
    }
  }
}

export default ApiKeySearch
