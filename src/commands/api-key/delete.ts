import { flags } from '@oclif/command'
import { Kommand, printCliName } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../kuzzle'

class ApiKeyDelete extends Kommand {
  static description = 'Deletes a new API Key for an user'

  static flags = {
    help: flags.help(),
    user: flags.string({
      char: 'u',
      description: 'User kuid',
      required: true
    }),
    id: flags.string({
      description: 'API Key unique ID'
    }),
    ...kuzzleFlags
  }

  async run() {
    this.log('')
    this.log(`${printCliName()} - ${ApiKeyDelete.description}`)
    this.log('')

    const { flags } = this.parse(ApiKeyDelete)

    const sdk = new KuzzleSDK(flags)
    await sdk.init()

    const request = {
      controller: 'security',
      action: 'deleteApiKey',
      _id: flags.id,
      userId: flags.user
    }

    try {
      const { result } = await sdk.query(request)

      this.log(`Successfully deleted API Key "${result._id}" of user "${flags.user}"`)
    }
    catch (error) {
      this.logError(error.message)
    }
  }
}

export default ApiKeyDelete