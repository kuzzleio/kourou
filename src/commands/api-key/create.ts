import { flags } from '@oclif/command'
import { Kommand, printCliName } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../kuzzle'

class ApiKeyCreate extends Kommand {
  static description = 'Creates a new API Key for an user'

  static flags = {
    help: flags.help(),
    user: flags.string({
      char: 'u',
      description: 'User kuid',
      required: true
    }),
    description: flags.string({
      char: 'd',
      description: 'API Key description',
      required: true
    }),
    id: flags.string({
      description: 'API Key unique ID'
    }),
    expire: flags.string({
      description: 'API Key validity',
      default: '-1'
    }),
    ...kuzzleFlags
  }

  async run() {
    this.log('')
    this.log(`${printCliName()} - ${ApiKeyCreate.description}`)
    this.log('')

    const { flags } = this.parse(ApiKeyCreate)

    const sdk = new KuzzleSDK(flags)
    await sdk.init()

    const request = {
      controller: 'security',
      action: 'createApiKey',
      _id: flags.id,
      userId: flags.user,
      expiresIn: flags.expire,
      body: {
        description: flags.description
      }
    }

    try {
      const { result } = await sdk.query(request)

      this.log(`Successfully created API Key "${result._id}" for user "${flags.user}"`)
      this.log(result._source.token)
    }
    catch (error) {
      this.logError(error.message)
    }
  }
}

export default ApiKeyCreate