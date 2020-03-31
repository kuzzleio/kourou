import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import * as fs from 'fs'
import chalk from 'chalk'

export default class RoleDump extends Kommand {
  private batchSize?: string;

  private path?: string;

  private sdk?: any;

  static description = 'Exports roles'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump directory',
      default: 'roles'
    }),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsFetchCount config)',
      default: '2000'
    }),
    ...kuzzleFlags,
  }

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

    const { flags: userFlags } = this.parse(RoleDump)

    this.path = userFlags.path
    this.batchSize = userFlags['batch-size']

    const filename = `${this.path}/roles.json`

    this.sdk = new KuzzleSDK(userFlags)
    await this.sdk.init(this.log)

    this.log(`Dumping roles in ${filename} ...`)

    fs.mkdirSync(this.path, { recursive: true })

    const roles = await this._dumpRoles()

    fs.writeFileSync(filename, JSON.stringify(roles, null, 2))

    this.log(chalk.green(`[✔] ${Object.keys(roles).length} roles dumped`))
  }

  async _dumpRoles() {
    const options = {
      scroll: '10s',
      size: this.batchSize
    }

    let result = await this.sdk.security.searchRoles({}, options)

    const roles: any = {}

    while (result) {
      result.hits.forEach((hit: any) => {
        roles[hit._id] = { controllers: hit.controllers }
      })

      result = await result.next()
    }

    return roles
  }
}
