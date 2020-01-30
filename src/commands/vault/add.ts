import { Kommand, printCliName } from '../../common'
import { vaultFlags, vaultArgs } from '../../support/vault'
import * as _ from 'lodash'
import chalk from 'chalk'

// tslint:disable-next-line
const Vault = require('kuzzle-vault')

export class VaultAdd extends Kommand {
  static description = 'Add an encrypted key to a secrets file'

  static flags = {
    ...vaultFlags
  }

  static args = [
    ...vaultArgs,
    { name: 'key', description: 'Path to the key (lodash style)', required: true },
    { name: 'value', description: 'Value to encrypt', required: true }
  ]

  async run() {
    this.log('')
    this.log(`${printCliName()} - ${VaultAdd.description}`)
    this.log('')

    const { args, flags: userFlags } = this.parse(VaultAdd)

    if (_.isEmpty(userFlags['vault-key'])) {
      this.log(chalk.red('A vault key must be provided'))
      return
    }

    if (_.isEmpty(args['secrets-file'])) {
      this.log(chalk.red('A secrets file must be provided'))
      return
    }

    const vault = new Vault(userFlags['vault-key'])

    vault.encryptKey(args.key, args.value, args['secrets-file'])

    this.log(chalk.green(`[✔] Key "${args.key}" has been securely added "${args['secrets-file']}"`))
  }
}
