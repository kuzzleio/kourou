import * as fs from 'fs'
import path from 'path'

import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, } from '../../support/kuzzle'

export default class ProfileExport extends Kommand {
  static description = 'Exports profiles'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump directory',
      default: 'profiles'
    }),
    ...kuzzleFlags,
    protocol: flags.string({
      description: 'Kuzzle protocol (http or websocket)',
      default: 'websocket',
    }),
  }

  async runSafe() {
    const filename = path.join(this.flags.path, 'profiles.json')

    this.logInfo(`Exporting profiles in ${filename} ...`)

    fs.mkdirSync(this.flags.path, { recursive: true })

    const profiles = await this._dumpProfiles()

    const dump = {
      type: 'profiles',
      content: profiles
    }

    fs.writeFileSync(filename, JSON.stringify(dump, null, 2))

    this.logOk(`${Object.keys(profiles).length} profiles dumped`)
  }

  async _dumpProfiles() {
    const options = {
      scroll: '3s',
      size: 100
    }

    let result = await this.sdk?.security.searchProfiles({}, options)

    const profiles: any = {}

    while (result) {
      result.hits.forEach((hit: any) => {
        profiles[hit._id] = { policies: hit.policies }
      })

      result = await result.next()
    }

    return profiles
  }
}
