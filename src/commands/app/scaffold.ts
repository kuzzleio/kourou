import { flags } from '@oclif/command'
import chalk from 'chalk'
import Listr from 'listr'


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
        title: 'Creating and rendering application files',
        task: async () => this.cloneTemplate(flavor, destination)
      },
    ]);

    await tasks.run();
    this.log('')
    this.logOk(`Scaffolding complete! Use ${chalk.grey(`cd ${destination} && npm run docker npm install`)} install dependencies and then ${chalk.grey(`npm run docker:dev`)} to run your application!`);
  }

  async cloneTemplate(flavor: string, destination: string) {
    await execute('git', 'clone', '--depth=1', 'https://github.com/kuzzleio/project-templates', '--branch', flavor, '--single-branch');

    await execute('mv', `project-templates/${flavor}`, `${destination}/`);

    await execute('rm', '-rf', 'project-templates/');
  }
}
