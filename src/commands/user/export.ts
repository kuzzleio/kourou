import * as fs from 'fs'
import * as _ from 'lodash'
import * as crypto from 'crypto'
import path from 'path'

import { flags } from '@oclif/command'
import { Kommand } from '../../common'
import { kuzzleFlags, } from '../../support/kuzzle'

function randomPassword(): string {
  return crypto.randomBytes(20).toString('hex')
}

export default class UserExport extends Kommand {
  static description = `
Exports users to JSON.

The users will be exported WITHOUT their credentials since Kuzzzle can't access them.

You can either:
  - manually re-create credentials for your users
  - use the "mustChangePasswordIfSetByAdmin" option Kuzzle password policies (see https://github.com/kuzzleio/kuzzle-plugin-auth-passport-local/#optional-properties)
  - use the "--generate-credentials" flag to auto-generate credentials for your users

Auto-generation of credentials

  With the "--generate-credentials" flag, Kourou will adds credentials for the "local" strategy.
  By default, the username will be the user ID.
  Use the "generated-username" flag to use an other property than the user ID for the generated username
  The password will be a strong random 40 characters string

Examples:

  - kourou user:export
  - kourou user:export --exclude '.*admin.*' --exclude 'supervisor.*'
  - kourou user:export --generate-credentials
  - kourou user:export --generate-credentials --generated-username content.email
`

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: 'Dump directory',
      default: 'users'
    }),
    exclude: flags.string({
      description: 'Exclude users by matching their IDs with a regexp',
      multiple: true
    }),
    'generate-credentials': flags.boolean({
      description: 'Generate credentials with a random password for users'
    }),
    'generated-username': flags.string({
      description: 'User content property used as a username for local credentials',
      default: '_id'
    }),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsFetchCount config)',
      default: '2000'
    }),
    ...kuzzleFlags,
    protocol: flags.string({
      description: 'Kuzzle protocol (http or websocket)',
      default: 'ws',
    }),
  }

  private excludes: string[] = []

  async beforeConnect() {
    if (this.flags['generated-username'] !== '_id' && !this.flags['generate-credentials']) {
      throw new Error('The "--generated-username" cannot be used without "--generate-credentials"')
    }
  }

  async runSafe() {
    const filename = path.join(this.flags.path, 'users.json')

    this.logInfo(`Exporting users in ${filename} ...`)

    fs.mkdirSync(this.flags.path, { recursive: true })

    this.excludes = this.flags.exclude || []

    const users = await this._dumpUsers()

    const dump = {
      type: 'users',
      content: users
    }

    fs.writeFileSync(filename, JSON.stringify(dump, null, 2))

    this.logOk(`${Object.keys(users).length} users dumped`)

    if (this.flags['generate-credentials']) {
      this.logOk('Credentials have been generated')
    }
  }

  async _dumpUsers() {
    const users: any = {}

    let results = await this.sdk?.security.searchUsers(
      {},
      { scroll: '5s', size: this.flags['batch-size'] })

    while (results) {
      for (const user of results.hits) {
        const shouldInclude = this.excludes.every((exclude: string) => (
          !user._id.match(new RegExp(exclude))
        ))

        if (!shouldInclude) {
          continue;
        }

        users[user._id] = {
          content: _.omit(user.content, ['_kuzzle_info']),
          credentials: {}
        }

        if (this.flags['generate-credentials']) {
          let username = `${_.get(user, this.flags['generated-username'])}`
          const password = randomPassword()

          // Check for empty string or undefined property converted to string
          if (_.isEmpty(username) || username === 'undefined') {
            this.logInfo(`User ${user._id} does not have a "${this.flags['generated-username']}" property. Use user ID instead.`)
            username = user._id
          } s

          users[user._id].credentials.local = { username, password }
        }
      }

      results = await results.next()
    }

    return users
  }
}
