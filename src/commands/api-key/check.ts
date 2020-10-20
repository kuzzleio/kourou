import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

class ApiKeyCheck extends Kommand {
  public static description = 'Checks an API key validity';

  public static flags = {
    help: flags.help(),
    ...kuzzleFlags,
  };

  static args = [
    { name: 'token', description: 'API key token', required: true },
  ]

  static examples = [
    'kourou api-key:check eyJhbG...QxfQrc'
  ]

  async runSafe() {
    const { valid } = await this.sdk.auth.checkToken(this.args.token)

    if (valid) {
      this.logOk('API key is still valid')
    }
    else {
      this.logKo('API key is not valid')
    }
  }
}

export default ApiKeyCheck
