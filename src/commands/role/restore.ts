import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import * as fs from 'fs'
import chalk from 'chalk'

export default class RoleRestore extends Kommand {
  private batchSize?: string;

  private path?: string;

  private sdk?: any;

  static description = 'Restores previously dumped Kuzzle roles'

  static flags = {
    help: flags.help({}),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsWriteCount config)',
      default: '200'
    }),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'path', description: 'Dump file', required: true },
  ]

  async runSafe() {
    this.printCommand()

    const { args, flags: userFlags } = this.parse(RoleRestore)

    this.path = args.path
    this.batchSize = userFlags['batch-size']

    this.sdk = new KuzzleSDK(userFlags)
    await this.sdk.init(this.log)

    const filename: any = this.path

    this.log(`Restoring roles from ${filename} ...`)

    const roles = JSON.parse(fs.readFileSync(filename, 'utf-8'))

    await this._restoreRoles(roles)

    this.log(chalk.green(`[✔] ${Object.keys(roles).length} roles restored`))
  }

  async _restoreRoles(roles: any) {
    const promises = Object.entries(roles).map(([roleId, role]) => {
      return this.sdk.security.createOrReplaceRole(roleId, role, { force: true })
    })

    await Promise.all(promises)
  }
}
