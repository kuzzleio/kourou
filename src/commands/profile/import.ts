import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import * as fs from 'fs'
import chalk from 'chalk'

export default class ProfileImport extends Kommand {
  private path?: string;

  private sdk?: any;

  static description = 'Imports profiles'

  static flags = {
    help: flags.help({}),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'path', description: 'Dump file', required: true },
  ]

  async run() {
    try {
      await this.runSafe()
    }
    catch (error) {
      this.logError(error)
    }
  }

  async runSafe() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(ProfileImport)

    this.path = args.path

    this.sdk = new KuzzleSDK(userFlags)
    await this.sdk.init(this.log)

    const filename: any = this.path

    this.log(`Restoring profiles from ${filename} ...`)

    const profiles = JSON.parse(fs.readFileSync(filename, 'utf-8'))

    await this._restoreRoles(profiles)

    this.log(chalk.green(`[✔] ${Object.keys(profiles).length} profiles restored`))
  }

  async _restoreRoles(profiles: any) {
    const promises = Object.entries(profiles).map(([profileId, profile]) => {
      return this.sdk.security.createOrReplaceProfile(profileId, profile, { force: true })
    })

    await Promise.all(promises)
  }
}
