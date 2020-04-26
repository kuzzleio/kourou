import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import * as fs from 'fs'
import chalk from 'chalk'
import { restoreProfiles } from '../../support/restore-securities'

export default class ProfileImport extends Kommand {
  private path?: string;

  static description = 'Imports profiles'

  static flags = {
    help: flags.help({}),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'path', description: 'Dump file', required: true },
  ]

  async runSafe() {
    const { args, flags: userFlags } = this.parse(ProfileImport)

    this.path = args.path

    this.sdk = new KuzzleSDK(userFlags)
    await this.sdk.init(this.log)

    const filename: any = this.path

    this.log(`Restoring profiles from ${filename} ...`)

    const dump = JSON.parse(fs.readFileSync(filename, 'utf-8'))

    const count = await restoreProfiles(this.sdk, dump)

    this.log(chalk.green(`[✔] ${count} profiles restored`))
  }
}
