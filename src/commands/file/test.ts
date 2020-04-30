import * as fs from 'fs'
import * as _ from 'lodash'
import { flags } from '@oclif/command'
import { Cryptonomicon } from 'kuzzle-vault'

import { Kommand } from '../../common'

export class FileTest extends Kommand {
  static initSdk = false

  static description = 'Tests if an encrypted file can be decrypted.'

  static examples = [
    'kourou file:test books/cryptonomicon.txt.enc --vault-key <vault-key>'
  ]

  static flags = {
    'vault-key': flags.string({
      description: 'Kuzzle Vault Key (or KUZZLE_VAULT_KEY)',
      default: process.env.KUZZLE_VAULT_KEY,
    }),
  }

  static args = [
    { name: 'file', description: 'Encrypted file', required: true }
  ]

  async runSafe() {
    if (_.isEmpty(this.flags['vault-key'])) {
      throw new Error('A vault key must be provided')
    }

    if (_.isEmpty(this.args.file)) {
      throw new Error('An encrypted file must be provided')
    }

    if (!fs.existsSync(this.args.file)) {
      throw new Error(`Encrypted file "${this.args.file} does not exists`)
    }

    const cryptonomicon = new Cryptonomicon(this.flags['vault-key'])

    let encryptedContent
    try {
      encryptedContent = fs.readFileSync(this.args.file, 'utf8')
    }
    catch (error) {
      throw new Error(`Cannot read encrypted content from file "${this.args.file}": ${error.message}`)
    }

    try {
      cryptonomicon.decryptString(encryptedContent)
      this.logOk('Encrypted file can be decrypted')
    }
    catch (error) {
      this.logKo(`Encrypted file cannot be decrypted: ${error.message}`)
    }
  }
}
