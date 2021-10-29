import fs from 'fs'

import _ from 'lodash'
import { flags } from '@oclif/command'
import { Cryptonomicon, Vault } from 'kuzzle-vault'

import { Kommand } from '../../common'

export class VaultDecrypt extends Kommand {
  static initSdk = false

  static description = `
Decrypts an entire secrets file.

Decrypted secrets file must NEVER be committed into the repository.

See https://github.com/kuzzleio/kuzzle-vault/ for more information.
`

  static examples = [
    'kourou vault:decrypt config/secrets.enc.json --vault-key <vault-key>',
    'kourou vault:decrypt config/secrets.enc.json -o config/secrets.json --vault-key <vault-key>'
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
    { name: 'file', description: 'File containing encrypted secrets', required: true }
  ]

  async runSafe() {
    if (_.isEmpty(this.flags['vault-key'])) {
      throw new Error('A vault key must be provided')
    }

    if (_.isEmpty(this.args.file)) {
      throw new Error('A secrets file must be provided')
    }

    let outputFile = `${this.args.file.replace('.enc', '')}`
    if (this.flags['output-file']) {
      outputFile = this.flags['output-file']
    }

    if (fs.existsSync(outputFile) && !this.flags.force) {
      throw new Error(`Output file "${outputFile}" already exists. Use -f flag to overwrite it.`)
    }

    const cryptonomicon = new Cryptonomicon(this.flags['vault-key'])

    if (!fs.existsSync(this.args.file)) {
      throw new Error(`File "${this.args.file}" does not exists`)
    }

    const PARSER = Vault.getParser(this.args.file);

    let encryptedSecrets = {}
    try {
      encryptedSecrets = PARSER.parse(fs.readFileSync(this.args.file, 'utf8'))
    }
    catch (error: any) {
      throw new Error(`Cannot read secrets from file "${this.args.file}": ${error.message}`)
    }

    const secrets = cryptonomicon.decryptObject(encryptedSecrets)

    fs.writeFileSync(outputFile, PARSER.stringify(secrets, null, 2))

    this.logOk(`Secrets were successfully decrypted into the file ${outputFile}`)
  }
}
