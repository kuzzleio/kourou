import * as fs from 'fs'
import * as _ from 'lodash'
import { flags } from '@oclif/command'
import { Cryptonomicon } from 'kuzzle-vault'

import { Kommand } from '../../common'

export class FileDecrypt extends Kommand {
  static description = 'Decrypts an encrypted file.'

  static examples = [
    'kourou file:decrypt books/cryptonomicon.txt.enc --vault-key <vault-key>',
    'kourou file:decrypt books/cryptonomicon.txt.enc -o books/cryptonomicon.txt --vault-key <vault-key>'
  ]

  static flags = {
    force: flags.boolean({
      char: 'f',
      description: 'Overwrite the output file if it already exists'
    }),
    'output-file': flags.string({
      char: 'o',
      description: 'Output file (default: remove ".enc")'
    }),
    'vault-key': flags.string({
      description: 'Kuzzle Vault Key (or KUZZLE_VAULT_KEY)',
      default: process.env.KUZZLE_VAULT_KEY,
    }),
  }

  static args = [
    { name: 'file', description: 'Encrypted file', required: true }
  ]

  async runSafe() {
    const { args, flags: userFlags } = this.parse(FileDecrypt)

    if (_.isEmpty(userFlags['vault-key'])) {
      throw new Error('A vault key must be provided')
    }

    if (_.isEmpty(args.file)) {
      throw new Error('An encrypted file must be provided')
    }

    let outputFile = `${args.file.replace('.enc', '')}`
    if (userFlags['output-file']) {
      outputFile = userFlags['output-file']
    }

    if (fs.existsSync(outputFile) && !userFlags.force) {
      throw new Error(`Output file "${outputFile}" already exists. Use -f flag to overwrite it.`)
    }

    const cryptonomicon = new Cryptonomicon(userFlags['vault-key'])

    if (!fs.existsSync(args.file)) {
      throw new Error(`File "${args.file}" does not exists`)
    }

    let encryptedContent
    try {
      encryptedContent = fs.readFileSync(args.file, 'utf8')
    }
    catch (error) {
      throw new Error(`Cannot read encrypted content from file "${args.file}": ${error.message}`)
    }

    const content = cryptonomicon.decryptString(encryptedContent)

    fs.writeFileSync(outputFile, content)

    this.logOk(`Successfully decrypted content into the file ${outputFile}`)
  }
}
