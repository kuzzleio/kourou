import { flags } from '@oclif/command'
import * as _ from 'lodash'
import { Vault } from 'kuzzle-vault'

import { Kommand } from '../../common'

export class VaultTest extends Kommand {
  static description = 'Tests if an encrypted secrets file can be decrypted. (see https://github.com/kuzzleio/kuzzle-vault/)'

  static examples = [
    'kourou vault:test config/secrets.enc.json --vault-key <vault-key>'
  ]

  static flags = {
    'vault-key': flags.string({
      description: 'Kuzzle Vault Key (or KUZZLE_VAULT_KEY)',
      default: process.env.KUZZLE_VAULT_KEY,
    }),
  }

  static args = [
    { name: 'secrets-file', description: 'Encrypted secrets file', required: true }
  ]

  async runSafe() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(VaultTest)

    if (_.isEmpty(userFlags['vault-key'])) {
      throw new Error('A vault key must be provided')
    }

    if (_.isEmpty(args['secrets-file'])) {
      throw new Error('A secrets file must be provided')
    }

    const vault = new Vault(userFlags['vault-key'])

    try {
      vault.decrypt(args['secrets-file'])
      this.logOk('Secrets file can be decrypted')
    }
    catch (error) {
      this.logKo(`Secrets file cannot be decrypted: ${error.message}`)
    }
  }
}
