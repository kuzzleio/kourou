import * as fs from 'fs'
import * as _ from 'lodash'
import path from 'path'

import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, } from '../../support/kuzzle'

export default class UserExport extends Kommand {
  static description = 'Exports users'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump directory',
      default: 'users'
    }),
    exclude: flags.string({
      description: 'Exclude users by matching their IDs',
      default: '[]'
    }),
    ...kuzzleFlags,
    protocol: flags.string({
      description: 'Kuzzle protocol (http or websocket)',
      default: 'ws',
    }),
  }

  private excludes: string[] = []

  async runSafe() {
    const filename = path.join(this.flags.path, 'users.json')

    this.logInfo(`Exporting users in ${filename} ...`)

    fs.mkdirSync(this.flags.path, { recursive: true })

    this.excludes = this.parseJs(this.flags.exclude)

    const users = await this._dumpUsers()

    const dump = {
      type: 'users',
      content: users
    }

    fs.writeFileSync(filename, JSON.stringify(dump, null, 2))

    this.logOk(`${Object.keys(users).length} users dumped`)
  }

  async _dumpUsers() {
    const users: any = {}

    let results = await this.sdk?.security.searchUsers(
      {},
      { scroll: '5s', size: 100 })

    while (results) {
      for (const user of results.hits) {
        const shouldInclude = this.excludes.every((exclude: string) => (
          !user._id.match(new RegExp(exclude))
        ))

        if (shouldInclude) {
          users[user._id] = _.omit(user.content, ['_kuzzle_info'])
        }
      }

      results = await results.next()
    }

    return users
  }
}
