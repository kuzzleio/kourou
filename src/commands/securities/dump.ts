import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'
import * as fs from 'fs'
import cli from 'cli-ux'
import chalk from 'chalk'
import _ from 'lodash'

// tslint:disable-next-line
const ndjson = require('ndjson')

export default class SecuritiesDump extends Kommand {
  private batchSize?: string;

  private path?: string;

  private sdk?: any;

  static description = 'Dump Kuzzle securities (roles, profiles and users)'

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump directory',
      default: 'securities'
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

    const { flags: userFlags } = this.parse(SecuritiesDump)

    this.path = userFlags.path
    this.batchSize = userFlags['batch-size']

    this.sdk = new KuzzleSDK(userFlags)
    await this.sdk.init()

    this.log(chalk.green(`Dumping securities in ${this.path}/ ...`))

    fs.mkdirSync(this.path, { recursive: true })

    const users = await this._getSecurity('users')

    console.log({ users })

    this.log(chalk.green('[✔] Securities dumped'))
  }

  async _dumpRoles() {
  }

  async _getSecurity(securityType: string) {
    const dumpObject = {
      [securityType]: {}
    }
    const method = `search${_.upperFirst(securityType)}`
    const options = {
      scroll: '10m',
      size: this.batchSize
    }

    let { result } = await this.sdk.security[method]({}, options)

    do {
      for (const hit of result.hits) {
        let content

        if (securityType === 'users') {
          hit._source._kuzzle_info = undefined

          content = hit._source
        }
        else if (securityType === 'roles') {
          content = { controllers: hit.controllers }
        }
        else { // profiles
          content = { policies: hit.policies }
        }
        dumpObject[hit._id] = content
      }
    } while (result = await result.next())

    return dumpObject
  }
}
