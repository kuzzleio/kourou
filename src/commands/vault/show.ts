import { flags } from '@oclif/command'
import * as _ from 'lodash'
import * as fs from 'fs'
import chalk from 'chalk'
import { Cryptonomicon } from 'kuzzle-vault'

import { Kommand } from '../../common'

export class VaultShow extends Kommand {
  static description = 'Prints an encrypted key from a secrets file. (see https://github.com/kuzzleio/kuzzle-vault/)'

  static examples = [
    'kourou vault:show config/secrets.enc.json aws.s3.secretKey --vault-key <vault-key>'
  ]

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

  async runSafe() {
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

    const cryptonomicon = new Cryptonomicon(userFlags['vault-key'])

    if (!fs.existsSync(args['secrets-file'])) {
      throw new Error(`File "${args['secrets-file']}" does not exists`)
    }

    let encryptedSecrets = {}
    try {
      encryptedSecrets = JSON.parse(fs.readFileSync(args['secrets-file'], 'utf8'))
    }
    catch (error) {
      throw new Error(`Cannot read secrets from file "${args['secrets-file']}": ${error.message}`)
    }

    const encryptedValue = _.get(encryptedSecrets, args.key)

    if (!encryptedValue) {
      throw new Error(`Key "${args.key}" does not exists`)
    }

    const decryptedValue = cryptonomicon.decryptString(encryptedValue)

    this.logOk(`Key "${args.key}" content:`)
    this.log(chalk.green(decryptedValue))
  }
}
