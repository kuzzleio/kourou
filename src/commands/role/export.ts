import fs from 'fs'
import path from 'path'

import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

export default class RoleDump extends Kommand {
  static description = 'Exports roles'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump directory',
      default: 'roles'
    }),
    ...kuzzleFlags,
    protocol: flags.string({
      description: 'Kuzzle protocol (http or websocket)',
      default: 'ws',
    }),
  }

  async runSafe() {
    const filename = path.join(this.flags.path, 'roles.json')

    this.logInfo(`Exporting roles in ${filename} ...`)

    fs.mkdirSync(this.flags.path, { recursive: true })

    const roles = await this._dumpRoles()

    const dump = {
      type: 'roles',
      content: roles
    }

    fs.writeFileSync(filename, JSON.stringify(dump, null, 2))

    this.logOk(`${Object.keys(roles).length} roles dumped`)
  }

  async _dumpRoles() {
    const options = {
      scroll: '3s',
      size: 100
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
