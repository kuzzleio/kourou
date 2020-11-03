import path from 'path'
import fs from 'fs'

import { flags } from '@oclif/command'
import cli from 'cli-ux'
import _ from 'lodash'
import chalk from 'chalk'
import Listr from 'listr'

import { Kommand } from '../../common'
import { execute } from '../../support/execute'

const templatesDir = path.join(__dirname, '..', '..', '..', 'templates')

const TEMPLATED_ENTRIES = [
  'package.json',
  'app.ts',
  'README.md'
]

export default class AppScaffold extends Kommand {
  static initSdk = false

  static description = 'Scaffolds a new Kuzzle application'

  static flags = {
    help: flags.help(),
  }

  static args = [
    { name: 'name', description: 'Application name', required: true },
  ]

  async runSafe() {
    const templatePath = path.join(templatesDir, 'app-scaffold', 'ts')

    const tasks = new Listr([
      {
        title: `Creating ${chalk.gray(this.args.name + path.sep)} directory`,
        task: () => execute('mkdir', this.args.name)
      },
      {
        title: 'Creating and rendering application files',
        task: () => this.renderTemplates(templatePath, templatePath)
      },
      {
        title: `Installing latest Kuzzle version via NPM and Docker (this can take some time)`,
        task: () =>
          execute('npm', 'run', 'npm:docker', 'install', 'kuzzle', { cwd: this.args.name })
      },
    ])

    await tasks.run()

    this.logOk(`Scaffolding complete! Use "${chalk.grey('npm run dev:docker')}" to run your application`)
  }

  async renderTemplates(directory: string, templatePath: string) {
    const entries = fs.readdirSync(directory)

    for (const entry of entries) {
      const entryPath = path.join(directory, entry)
      const entryDir = path.dirname(path.join(this.args.name, entryPath))
      const entryInfo = fs.statSync(entryPath)

      if (entryInfo.isDirectory()) {
        fs.mkdirSync(entryDir.replace(templatePath, ''), { recursive: true })

        await this.renderTemplates(entryPath, templatePath)
      }
      else if (entryInfo.isFile() || entryInfo.isSymbolicLink()) {
        const content = fs.readFileSync(entryPath, 'utf8')

        // Only render a whitelist a files who need it
        const rendered = TEMPLATED_ENTRIES.includes(entry)
          ? _.template(content)({ appName: this.args.name })
          : content

        fs.mkdirSync(entryDir.replace(templatePath, ''), { recursive: true })
        fs.writeFileSync(path.join(this.args.name, entryPath.replace(templatePath, '')), rendered)
      }
      else {
        this.logInfo(`Skipped ${entryPath} because it's not a regular file`)
      }
    }
  }
}
