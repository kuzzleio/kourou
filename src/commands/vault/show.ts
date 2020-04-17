import { flags } from '@oclif/command'
import * as _ from 'lodash'
import * as fs from 'fs'
import chalk from 'chalk'
import { Cryptonomicon } from 'kuzzle-vault'

import { Kommand } from '../../common'

export class VaultShow extends Kommand {
  static description = `
Prints an encrypted file content. (see https://github.com/kuzzleio/kuzzle-vault/)

This method can display either:
 - the entire content of the secrets file
 - a single key value
`

  static examples = [
    'kourou vault:show config/secrets.enc.json --vault-key <vault-key>',
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
    { name: 'key', description: 'Path to a key (lodash style)' },
  ]

  async runSafe() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(VaultShow)

    if (_.isEmpty(userFlags['vault-key'])) {
      throw new Error('A vault key must be provided')
    }

    if (_.isEmpty(args['secrets-file'])) {
      throw new Error('A secrets file must be provided')
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

    if (args.key) {
      const encryptedValue = _.get(encryptedSecrets, args.key)

      if (!encryptedValue) {
        throw new Error(`Key "${args.key}" does not exists`)
      }

      const decryptedValue = cryptonomicon.decryptString(encryptedValue)

      this.logOk(`Key "${args.key}" content:`)
      this.log(chalk.green(decryptedValue))
    }
    else {
      const decryptedSecrets = cryptonomicon.decryptObject(encryptedSecrets);

      this.logOk(`Secrets file content:`)
      this.log(chalk.green(JSON.stringify(decryptedSecrets, null, 2)))
    }
  }
}
