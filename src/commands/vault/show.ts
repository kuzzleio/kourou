import { Kommand } from '../../common'
import { flags } from '@oclif/command'
import * as _ from 'lodash'
import chalk from 'chalk'

const Vault = require('kuzzle-vault')

export class VaultShow extends Kommand {
  static description = 'Prints an encrypted key.'

  static flags = {
    'vault-key': flags.string({
      description: 'Kuzzle Vault Key (or KUZZLE_VAULT_KEY)',
      default: process.env.KUZZLE_VAULT_KEY,
    }),
  }

  static args = [
    { name: 'secrets-file', description: 'Encrypted secrets file', required: true },
    { name: 'key', description: 'Path to the key (lodash style)', required: true },
  ]

  async run() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(VaultShow)

    if (_.isEmpty(userFlags['vault-key'])) {
      this.log(chalk.red('A vault key must be provided'))
      return
    }

    if (_.isEmpty(args['secrets-file'])) {
      this.log(chalk.red('A secrets file must be provided'))
      return
    }

    const vault = new Vault(userFlags['vault-key'])

    const decryptedValue = vault.decryptKey(args.key, args['secrets-file'])

    this.log(chalk.green(`[✔] Key "${args.key}" content:`))
    this.log(chalk.green(decryptedValue))
  }
}
