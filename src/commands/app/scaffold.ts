import path from 'path'
import fs from 'fs'

import { flags } from '@oclif/command'
import _ from 'lodash'
import chalk from 'chalk'
import Listr from 'listr'
import inquirer from 'inquirer'


import { Kommand } from '../../common'
import { execute } from '../../support/execute'


export default class AppScaffold extends Kommand {
  static initSdk = false

  static description = 'Scaffolds a new Kuzzle application'

  static flags = {
    help: flags.help(),
    flavor: flags.string({
      default: 'generic',
      description: 'Template flavor'
    })
  }

  static args = [
    { name: 'destination', description: 'Directory to scaffold the app', required: true },
  ]

  async runSafe() {
    const destination = this.args.destination
    const flavor = this.flags.flavor

    const tasks = new Listr([
      {
        title: `Creating directory: ${chalk.gray(destination + path.sep)}`,
        task: () => execute('mkdir', destination)
      },
      {
        title: 'Creating and rendering application files',
        task: async () => this.cloneTemplate(this.flags.flavor, destination)
      },
    ]);

    await tasks.run();

    this.logOk(`Scaffolding complete! Use ${chalk.grey(`cd ${destination} && npm run docker npm install`)} install dependencies and then ${chalk.grey(`npm run docker:dev`)} to run your application!`);
  }

  async cloneTemplate(flavor: string, destination: string) {
    await execute('git', 'clone', '--depth=1', 'https://github.com/kuzzleio/project-scaffold', '--branch', flavor, '--single-branch', destination);

    await execute('rm', '-rf', `${destination}/.git`);
  }
}
