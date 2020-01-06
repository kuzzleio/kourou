import { flags } from '@oclif/command'
import { Kommand, printCliName } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../kuzzle'

class ApiKeyDelete extends Kommand {
  public static description = 'Deletes a new API Key for an user';

  public static flags = {
    help: flags.help(),
    user: flags.string({
      char: 'u',
      description: 'User kuid',
      required: true,
    }),
    id: flags.string({
      description: 'API Key unique ID',
    }),
    ...kuzzleFlags,
  };

  public async run() {
    this.log('')
    this.log(`${printCliName()} - ${ApiKeyDelete.description}`)
    this.log('')

    const { flags: userFlags } = this.parse(ApiKeyDelete)

    const sdk = new KuzzleSDK(userFlags)
    await sdk.init()

    const request = {
      controller: 'security',
      action: 'deleteApiKey',
      refresh: 'wait_for',
      _id: userFlags.id,
      userId: userFlags.user,
    }

    try {
      const { result } = await sdk.query(request)

      this.log(`Successfully deleted API Key "${result._id}" of user "${userFlags.user}"`)
    } catch (error) {
      this.logError(error.message)
    }
  }
}

export default ApiKeyDelete
