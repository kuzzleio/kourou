import { flags } from '@oclif/command'
import * as _ from 'lodash'
import * as fs from 'fs'
import { Cryptonomicon } from 'kuzzle-vault'

import { Kommand } from '../../common'

export class VaultAdd extends Kommand {
  static description = `
Adds an encrypted key to an encrypted secrets file.

A new secrets file is created if it does not yet exist.

Encrypted secrets are meant to be loaded inside an application with Kuzzle Vault.

See https://github.com/kuzzleio/kuzzle-vault/ for more information.
`

  static examples = [
    'kourou vault:add config/secrets.enc.json aws.s3.keyId b61e267676660c314b006b06 --vault-key <vault-key>'
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
    { name: 'value', description: 'Value to encrypt', required: true }
  ]

  async runSafe() {
    const { args, flags: userFlags } = this.parse(VaultAdd)

    if (_.isEmpty(userFlags['vault-key'])) {
      throw new Error('A vault key must be provided')
    }

    if (_.isEmpty(args['secrets-file'])) {
      throw new Error('A secrets file must be provided')
    }

    const cryptonomicon = new Cryptonomicon(userFlags['vault-key'])

    let encryptedSecrets = {}
    if (fs.existsSync(args['secrets-file'])) {
      encryptedSecrets = JSON.parse(fs.readFileSync(args['secrets-file'], 'utf8'))

      try {
        cryptonomicon.decryptObject(encryptedSecrets)
      }
      catch (error) {
        throw new Error('Trying to add a secret encrypted with a different key')
      }
    }

    _.set(encryptedSecrets, args.key, cryptonomicon.encryptString(args.value))

    fs.writeFileSync(args['secrets-file'], JSON.stringify(encryptedSecrets, null, 2))

    this.logOk(`Key "${args.key}" has been securely added "${args['secrets-file']}"`)
  }
}
