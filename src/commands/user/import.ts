import { flags } from '@oclif/command'
import fs from 'fs'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'
import { restoreUsers } from '../../support/restore-securities'

export default class UserImport extends Kommand {
  static description = 'Imports users'

  static flags = {
    help: flags.help({}),
    ...kuzzleFlags,
    protocol: flags.string({
      description: 'Kuzzle protocol (http or websocket)',
      default: 'ws',
    }),
  }

  static args = [
    { name: 'path', description: 'Dump file', required: true },
  ]

  async runSafe() {
    this.logInfo(`Importing users from ${this.args.path} ...`)

    const dump = JSON.parse(fs.readFileSync(this.args.path, 'utf-8'))

    const count = await restoreUsers(this, dump)

    this.logOk(`${count} users restored`)
  }
}
