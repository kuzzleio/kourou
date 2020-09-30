import path from 'path'
import fs from 'fs'

import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { execute } from '../../support/execute'

const templatesDir = path.join(__dirname, '..', '..', 'templates');

export default class AppScaffold extends Kommand {
  static initSdk = false

  static description = 'Scaffold a new Kuzzle application'

  static flags = {
    help: flags.help(),
  }

  static args = [
    { name: 'name', description: 'Application name', required: true },
  ]

  async runSafe() {
    this.logInfo(`Scaffold a new Kuzzle application in ${this.args.name}/`)

    await execute('mkdir', this.args.name)

    await execute('cp', `${templatesDir}/app-scaffold/app.ts`, this.args.name)
    const packageJson = require(`${templatesDir}/app-scaffold/package.json`)
    packageJson.name = this.args.name
    fs.writeFileSync(
      `${this.args.name}/package.json`,
      JSON.stringify(packageJson, null, 2))

    this.logInfo('Installing latest Kuzzle version via NPM...')

    await execute('npm', 'install', 'kuzzle', { cwd: this.args.name })
    await execute('npm', 'install', { cwd: this.args.name })

    this.logOk(`Scaffolding complete. Start to develop you application in ${this.args.name}`)
  }
}
