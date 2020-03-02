import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'

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

  public async run() {
    try {
      await this.runSafe()
    }
    catch (error) {
      this.logError(error)
    }
  }

  async runSafe() {
    this.printCommand()

    const { flags: userFlags, args } = this.parse(ApiKeySearch)

    const sdk = new KuzzleSDK(userFlags)
    await sdk.init(this.log)

    let query = {}
    if (userFlags.filter) {
      query = {
        match: {
          description: userFlags.filter,
        },
      }
    }

    try {
      const result = await sdk.security.searchApiKeys(
        args.user,
        query,
        {
          from: 0,
          size: 100
        })

      this.log(`${result.total} API Keys found for user ${args.user}`)

      if (result.total !== 0) {
        this.log('')
        for (const { _id, _source } of result.hits) {
          this.log(` - Key "${_id}"`)
          this.log(`    Description: ${_source.description}`)
          this.log(`    Expires at: ${_source.expiresAt}`)
        }
      }
    } catch (error) {
      this.logError(error.message)
    }
  }
}

export default ApiKeySearch
