import { flags } from '@oclif/command'
import { Kommand, printCliName } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'

class ApiKeyCreate extends Kommand {
  public static description = 'Creates a new API Key for an user';

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
    this.log('')
    this.log(`${printCliName()} - ${ApiKeyCreate.description}`)
    this.log('')

    const { args, flags: userFlags } = this.parse(ApiKeyCreate)

    const sdk = new KuzzleSDK(userFlags)
    await sdk.init()

    const request = {
      controller: 'security',
      action: 'createApiKey',
      _id: userFlags.id,
      userId: args.user,
      expiresIn: userFlags.expire,
      refresh: 'wait_for',
      body: {
        description: userFlags.description,
      },
    }

    try {
      const { result } = await sdk.query(request)

      this.log(`Successfully created API Key "${result._id}" for user "${userFlags.user}"`)
      this.log(result._source.token)
    } catch (error) {
      this.logError(error.message)
    }
  }
}

export default ApiKeyCreate
