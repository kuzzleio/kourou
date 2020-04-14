import * as fs from 'fs'
import * as _ from 'lodash'
import chalk from 'chalk'
import { flags } from '@oclif/command'
import { Cryptonomicon } from 'kuzzle-vault'

import { Kommand } from '../../common'

export class VaultDecrypt extends Kommand {
  static description = 'Decrypts an entire secrets file. (see https://github.com/kuzzleio/kuzzle-vault/)'

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
    this.printCommand()

    const { args, flags: userFlags } = this.parse(VaultDecrypt)

    if (_.isEmpty(userFlags['vault-key'])) {
      this.log(chalk.red('A vault key must be provided'))
      return
    }

    if (_.isEmpty(args.file)) {
      this.log(chalk.red('A secrets file must be provided'))
      return
    }

    let outputFile = `${args.file.replace('.enc', '')}`
    if (userFlags['output-file']) {
      outputFile = userFlags['output-file']
    }

    const cryptonomicon = new Cryptonomicon(userFlags['vault-key'])

    if (!fs.existsSync(args.file)) {
      throw new Error(`File "${args.file}" does not exists`)
    }

    let encryptedSecrets = {}
    try {
      encryptedSecrets = JSON.parse(fs.readFileSync(args.file, 'utf8'))
    }
    catch (error) {
      throw new Error(`Cannot read secrets from file "${args.file}": ${error.message}`)
    }

    const secrets = cryptonomicon.decryptObject(encryptedSecrets)

    fs.writeFileSync(outputFile, JSON.stringify(secrets, null, 2))

    this.logOk(`Secrets were successfully decrypted into the file ${outputFile}`)
  }
}
