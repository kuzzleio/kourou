import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import * as fs from 'fs'
import chalk from 'chalk'

export default class ProfileExport extends Kommand {
  private batchSize?: string;

  private path?: string;

  static description = 'Exports profiles'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump directory',
      default: 'profiles'
    }),
    ...kuzzleFlags,
  }

  async runSafe() {
    this.printCommand()

    const { flags: userFlags } = this.parse(ProfileExport)

    this.path = userFlags.path

    const filename = `${this.path}/profiles.json`

    this.sdk = new KuzzleSDK(userFlags)
    await this.sdk.init(this.log)

    this.log(`Dumping securities in ${filename} ...`)

    fs.mkdirSync(this.path, { recursive: true })

    const profiles = await this._dumpProfiles()

    const dump = {
      type: 'profiles',
      content: profiles
    }

    fs.writeFileSync(filename, JSON.stringify(dump, null, 2))

    this.log(chalk.green(`[✔] ${Object.keys(profiles).length} profiles dumped`))
  }

  async _dumpProfiles() {
    const options = {
      scroll: '10s',
      size: 100
    }

    let result
    // f*** you TS
    if (this.sdk) {
      result = await this.sdk.security.searchProfiles({}, options)
    }

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
