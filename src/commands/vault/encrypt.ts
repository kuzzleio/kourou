import * as fs from 'fs'
import * as _ from 'lodash'
import { flags } from '@oclif/command'
import { Cryptonomicon } from 'kuzzle-vault'

import { Kommand } from '../../common'

export class VaultEncrypt extends Kommand {
  static shortDescription = 'Encrypts an entire secrets file.'

  static description = `
Encrypts an entire secrets file.

The secrets file must be in JSON format and contains only string or objects.

Example:
{
  aws: {
    s3: {
      keyId: 'b61e267676660c314b006b06'
    }
  }
}

Encrypted secrets are meant to be loaded inside an application with Kuzzle Vault.

See https://github.com/kuzzleio/kuzzle-vault/ for more informations.
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
    this.printCommand()

    const { args, flags: userFlags } = this.parse(VaultEncrypt)

    if (_.isEmpty(userFlags['vault-key'])) {
      throw new Error('A vault key must be provided')
    }

    if (_.isEmpty(args.file)) {
      throw new Error('A secrets file must be provided')
    }

    const [filename, ext] = args.file.split('.')
    let outputFile = `${filename}.enc.${ext}`
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

    let secrets = {}
    try {
      secrets = JSON.parse(fs.readFileSync(args.file, 'utf8'))
    }
    catch (error) {
      throw new Error(`Cannot read secrets from file "${args.file}": ${error.message}`)
    }

    const encryptedSecrets = cryptonomicon.encryptObject(secrets)

    fs.writeFileSync(outputFile, JSON.stringify(encryptedSecrets, null, 2))

    this.logOk(`Secrets were successfully encrypted into the file ${outputFile}`)
  }
}
