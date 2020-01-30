import { Kommand, printCliName } from '../../common'
import { vaultFlags, vaultArgs } from '../../support/vault'
import * as _ from 'lodash'
import chalk from 'chalk'

// tslint:disable-next-line
const Vault = require('kuzzle-vault')

export class VaultShow extends Kommand {
  static description = 'Display an encrypted key on stdout'

  static flags = {
    ...vaultFlags
  }

  static args = [
    ...vaultArgs,
    { name: 'key', description: 'Path to the key (lodash style)', required: true },
  ]

  async run() {
    this.log('')
    this.log(`${printCliName()} - ${VaultShow.description}`)
    this.log('')

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
