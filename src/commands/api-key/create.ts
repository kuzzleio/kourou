import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'

class ApiKeyCreate extends Kommand {
  public static description = 'Creates a new API Key for a user';

  public static flags = {
    help: flags.help(),
    description: flags.string({
      char: 'd',
      description: 'API Key description',
      required: true,
    }),
    id: flags.string({
      description: 'API Key unique ID',
    }),
    expire: flags.string({
      description: 'API Key validity',
      default: '-1',
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

    const { args, flags: userFlags } = this.parse(ApiKeyCreate)

    const sdk = new KuzzleSDK(userFlags)
    await sdk.init(this.log)

    try {
      const apiKey = await sdk.security.createApiKey(
        args.user,
        userFlags.description,
        {
          _id: userFlags.id,
          expiresIn: userFlags.expire
        })

      this.log(`Successfully created API Key "${apiKey._id}" for user "${args.user}"`)
      this.log(apiKey._source.token)
    } catch (error) {
      this.logError(error.message)
    }
  }
}

export default ApiKeyCreate
