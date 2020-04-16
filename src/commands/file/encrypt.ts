import * as fs from 'fs'
import * as _ from 'lodash'
import { flags } from '@oclif/command'
import { Cryptonomicon } from 'kuzzle-vault'

import { Kommand } from '../../common'

export class VaultEncrypt extends Kommand {
  static description = 'Encrypts an entire file.'

  static examples = [
    'kourou file:encrypt books/cryptonomicon.txt --vault-key <vault-key>',
    'kourou file:encrypt books/cryptonomicon.txt -o books/cryptonomicon.txt.enc --vault-key <vault-key>'
  ]

  static flags = {
    force: flags.boolean({
      char: 'f',
      description: 'Overwrite the output file if it already exists'
    }),
    'output-file': flags.string({
      char: 'o',
      description: 'Output file (default: <filename>.enc)'
    }),
    'vault-key': flags.string({
      description: 'Kuzzle Vault Key (or KUZZLE_VAULT_KEY)',
      default: process.env.KUZZLE_VAULT_KEY,
    }),
  }

  static args = [
    { name: 'file', description: 'Filename', required: true }
  ]

  async runSafe() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(VaultEncrypt)

    if (_.isEmpty(userFlags['vault-key'])) {
      throw new Error('A vault key must be provided')
    }

    if (_.isEmpty(args.file)) {
      throw new Error('A file must be provided')
    }

    let outputFile = `${args.file}.enc`
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

    let content
    try {
      content = fs.readFileSync(args.file, 'utf8')
    }
    catch (error) {
      throw new Error(`Cannot read file "${args.file}": ${error.message}`)
    }

    const encryptedContent = cryptonomicon.encryptString(content)

    fs.writeFileSync(outputFile, encryptedContent)

    this.logOk(`File content successfully encrypted into ${outputFile}`)
  }
}
