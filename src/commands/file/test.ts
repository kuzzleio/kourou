import * as fs from 'fs'
import * as _ from 'lodash'
import { flags } from '@oclif/command'
import { Cryptonomicon } from 'kuzzle-vault'

import { Kommand } from '../../common'

export class FileTest extends Kommand {
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
    this.printCommand()

    const { args, flags: userFlags } = this.parse(FileTest)

    if (_.isEmpty(userFlags['vault-key'])) {
      throw new Error('A vault key must be provided')
    }

    if (_.isEmpty(args.file)) {
      throw new Error('An encrypted file must be provided')
    }

    if (!fs.existsSync(args.file)) {
      throw new Error(`Encrypted file "${args.file} does not exists`)
    }

    const cryptonomicon = new Cryptonomicon(userFlags['vault-key'])

    let encryptedContent
    try {
      encryptedContent = fs.readFileSync(args.file, 'utf8')
    }
    catch (error) {
      throw new Error(`Cannot read encrypted content from file "${args.file}": ${error.message}`)
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
