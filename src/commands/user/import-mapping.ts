import { flags } from '@oclif/command'
import fs from 'fs'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

export default class UserImportMappings extends Kommand {
  static description = 'Imports users mappings'

  static flags = {
    help: flags.help({}),
    ...kuzzleFlags,
    protocol: flags.string({
      description: 'Kuzzle protocol (http or websocket)',
      default: 'ws'
    })
  }

  static args = [{ name: 'path', description: 'Dump file', required: true }]

  async runSafe() {
    this.logInfo(`Importing users mappings from ${this.args.path} ...`)

    const dump = JSON.parse(fs.readFileSync(this.args.path, 'utf-8'))

    const mapping = dump.content.mapping
    delete mapping.profileIds

    await this.sdk?.security.updateUserMapping({
      properties: mapping
    })
    this.logOk('Users mappings restored')
  }
}
