import { Kommand } from '../../common'
import { flags } from '@oclif/command'
import * as _ from 'lodash'
import chalk from 'chalk'

const Vault = require('kuzzle-vault')

export class VaultTest extends Kommand {
  static description = 'Tests if an encrypted secrets file can be decrypted.'

  static flags = {
    'vault-key': flags.string({
      description: 'Kuzzle Vault Key (or KUZZLE_VAULT_KEY)',
      default: process.env.KUZZLE_VAULT_KEY,
    }),
  }

  static args = [
    { name: 'secrets-file', description: 'Encrypted secrets file', required: true }
  ]

  async run() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(VaultTest)

    if (_.isEmpty(userFlags['vault-key'])) {
      this.log(chalk.red('A vault key must be provided'))
      return
    }

    if (_.isEmpty(args['secrets-file'])) {
      this.log(chalk.red('A secrets file must be provided'))
      return
    }

    const vault = new Vault(userFlags['vault-key'], null, args['secrets-file'])

    try {
      vault.decrypt(args['secrets-file'])
      this.log(chalk.green('[✔] Secrets file can be decrypted'))
    }
    catch (error) {
      this.log(chalk.red('[X] Secrets file cannot be decrypted'))
      throw error
    }
  }
}
