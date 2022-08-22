import fs from 'fs'
import path from 'path'

import _ from 'lodash'
import { flags } from '@oclif/command'
import { Cryptonomicon, Vault } from 'kuzzle-vault'

import { Kommand } from '../../common'

export class VaultEncrypt extends Kommand {
  static initSdk = false

  static description = `
Encrypts an entire secrets file.

The secrets file must be in JSON format and it must contain only strings or objects.

Example:
{
  aws: {
    s3: {
      keyId: 'b61e267676660c314b006b06'
    }
  }
}

Encrypted secrets are meant to be loaded inside an application with Kuzzle Vault.

See https://github.com/kuzzleio/kuzzle-vault/ for more information.
`

  static examples = [
    'kourou vault:encrypt config/secrets.json --vault-key <vault-key>',
    'kourou vault:encrypt config/secrets.json -o config/secrets_prod.enc.json --vault-key <vault-key>'
  ]

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

  async runSafe() {
    if (_.isEmpty(this.flags['vault-key'])) {
      throw new Error('A vault key must be provided')
    }

    if (_.isEmpty(this.args.file)) {
      throw new Error('A secrets file must be provided')
    }

    const { name, ext } = path.parse(this.args.file);
    let outputFile = `${name}.enc.${ext}`

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

    let secrets = {}
    try {
      secrets = PARSER.parse(fs.readFileSync(this.args.file, 'utf8'))
    }
    catch (error: any) {
      throw new Error(`Cannot read secrets from file "${this.args.file}": ${error.message}`)
    }

    const encryptedSecrets = cryptonomicon.encryptObject(secrets)

    fs.writeFileSync(outputFile, PARSER.stringify(encryptedSecrets, null, 2))

    this.logOk(`Secrets were successfully encrypted into the file ${outputFile}`)
  }
}
