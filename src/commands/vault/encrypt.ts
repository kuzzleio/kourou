import { Kommand } from '../../common'
import * as _ from 'lodash'
import chalk from 'chalk'
import { flags } from '@oclif/command'

const Vault = require('kuzzle-vault')

export class VaultEncrypt extends Kommand {
  static description = 'Encrypt an entire file'

  static flags = {
    force: flags.boolean({
      char: 'f',
      description: 'Overwrite the output file if it already exists'
    }),
    'output-file': flags.string({
      char: 'o',
      description: 'Output file (default: <file>.enc.json)'
    }),
    'vault-key': flags.string({
      description: 'Kuzzle Vault Key (or KUZZLE_VAULT_KEY)',
      default: process.env.KUZZLE_VAULT_KEY,
    }),
  }

  static args = [
    { name: 'file', description: 'File containing unencrypted secrets', required: true }
  ]

  async run() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(VaultEncrypt)

    if (_.isEmpty(userFlags['vault-key'])) {
      this.log(chalk.red('A vault key must be provided'))
      return
    }

    if (_.isEmpty(args.file)) {
      this.log(chalk.red('A secrets file must be provided'))
      return
    }

    const outputFile = _.isEmpty(userFlags['output-file'])
      ? `${args.file.split('.json')[0]}.enc.json`
      : userFlags['output-file']

    const vault = new Vault(userFlags['vault-key'], args.file)

    vault.encrypt(outputFile, userFlags.force)
    this.log(chalk.green(`[✔] Secrets were successfully encrypted into the file ${outputFile}`))
  }
}
