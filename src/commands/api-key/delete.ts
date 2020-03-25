import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'

class ApiKeyDelete extends Kommand {
  public static description = 'Deletes an API key.';

  public static flags = {
    help: flags.help(),
    id: flags.string({
      description: 'API Key unique ID',
    }),
    ...kuzzleFlags,
  };

  static args = [
    { name: 'user', description: 'User kuid', required: true },
  ]

  async runSafe() {
    this.printCommand()

    const { flags: userFlags, args } = this.parse(ApiKeyDelete)

    const sdk = new KuzzleSDK(userFlags)
    await sdk.init(this.log)

    await sdk.security.deleteApiKey(args.user, userFlags.id)

    this.log(`Successfully deleted API Key "${userFlags.id}" of user "${args.user}"`)
  }
}

export default ApiKeyDelete
