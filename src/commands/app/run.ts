import path from 'path'
import fs from 'fs'

import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { execute } from '../../support/execute'
import AppStartServices from '../../commands/app/start-services'

export default class AppRun extends Kommand {
  static initSdk = false

  static description = 'Run the Kuzzle application in the current directory'

  static flags = {
    help: flags.help(),
  }

  async runSafe() {
    await AppStartServices.run()

    await execute('node', '-r', 'ts-node/register', 'app.ts')
  }
}
