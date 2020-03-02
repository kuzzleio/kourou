import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import * as fs from 'fs'
import chalk from 'chalk'

export default class ProfileDump extends Kommand {
  private batchSize?: string;

  private path?: string;

  private sdk?: any;

  static description = 'Dump Kuzzle profiles'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump directory',
      default: 'profiles'
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

    const { flags: userFlags } = this.parse(ProfileDump)

    this.path = userFlags.path
    this.batchSize = userFlags['batch-size']

    const filename = `${this.path}/profiles.json`

    this.sdk = new KuzzleSDK(userFlags)
    await this.sdk.init(this.log)

    this.log(`Dumping securities in ${filename} ...`)

    fs.mkdirSync(this.path, { recursive: true })

    const profiles = await this._dumpProfiles()

    fs.writeFileSync(filename, JSON.stringify(profiles, null, 2))

    this.log(chalk.green(`[✔] ${Object.keys(profiles).length} profiles dumped`))
  }

  async _dumpProfiles() {
    const options = {
      scroll: '10m',
      size: this.batchSize
    }

    let result = await this.sdk.security.searchProfiles({}, options)

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
