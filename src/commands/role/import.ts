import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import * as fs from 'fs'
import chalk from 'chalk'
import { restoreRoles } from '../../support/restore-securities'

export default class RoleImport extends Kommand {
  private path?: string;

  static description = 'Import roles'

  static flags = {
    help: flags.help({}),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'path', description: 'Dump file', required: true },
  ]

  async runSafe() {
    const { args, flags: userFlags } = this.parse(RoleImport)

    this.path = args.path

    this.sdk = new KuzzleSDK(userFlags)
    await this.sdk.init(this.log)

    const filename: any = this.path

    this.log(`Restoring roles from ${filename} ...`)

    const dump = JSON.parse(fs.readFileSync(filename, 'utf-8'))

    const count = await restoreRoles(this.sdk, dump)

    this.log(chalk.green(`[✔] ${count} roles restored`))
  }
}
