import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

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

  async runSafe() {
    const apiKey = await this.sdk.security.createApiKey(
      this.args.user,
      this.flags.description,
      {
        _id: this.flags.id,
        expiresIn: this.flags.expire
      })

    this.logOk(`Successfully created API Key "${apiKey._id}" for user "${this.args.user}"`)
    this.log(apiKey._source.token)
  }
}

export default ApiKeyCreate
