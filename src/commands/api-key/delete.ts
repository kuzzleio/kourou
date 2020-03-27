import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'

class ApiKeyDelete extends Kommand {
  public static description = 'Deletes an API key.';

  public static flags = {
    help: flags.help(),
    ...kuzzleFlags,
  };

  static args = [
    { name: 'user', description: 'User kuid', required: true },
    { name: 'id', description: 'API Key unique ID', required: true },
  ]

  static examples = [
    'kourou vault:delete sigfox-gateway 1k-BF3EBjsXdvA2PR8x'
  ];

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

    const { flags: userFlags, args } = this.parse(ApiKeyDelete)

    const sdk = new KuzzleSDK(userFlags)
    await sdk.init(this.log)

    try {
      await sdk.security.deleteApiKey(args.user, args.id)

      this.log(`Successfully deleted API Key "${args.id}" of user "${args.user}"`)
    } catch (error) {
      this.logError(error.message)
    }
  }
}

export default ApiKeyDelete
