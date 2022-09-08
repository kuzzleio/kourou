import { flags } from '@oclif/command'
import chalk from 'chalk'
import Listr from 'listr'
import * as fs from 'fs/promises'


import { Kommand } from '../../common'
import { execute, ExecutionError } from '../../support/execute'


export default class AppScaffold extends Kommand {
  static initSdk = false

  static description = 'Scaffolds a new Kuzzle application'

  static flags = {
    help: flags.help(),
    flavor: flags.string({
      default: 'generic',
      description: `Template flavor ("generic", "iot-platform", "iot-console", "iot-platform").
    Those can be found here: https://github.com/kuzzleio/project-templates`
    })
  };

  static args = [
    { name: 'destination', description: 'Directory to scaffold the app', required: true },
  ];

  async runSafe() {
    const destination = this.args.destination
    const flavor = this.flags.flavor

    const tasks = new Listr([
      {
        title: 'Creating and rendering application files',
        task: async () => this.cloneTemplate(flavor, destination)
      },
    ]);

    try {
      await tasks.run();

      this.log('')
      this.logOk(`Scaffolding complete! To run your application, use:
        ${chalk.grey(`cd ${destination} && npm run docker npm install && npm run docker:dev`)}`);
    }
    catch (error: any) { }
  }

  async cloneTemplate(flavor: string, destination: string) {
    const templatesDir = '/tmp/kourou-template';
    const assetName = `${flavor}.tar.gz`

    let directoryExist = true;
    try {
      await fs.access(destination);
    }
    catch (error) {
      directoryExist = false;
    }
    
    if (directoryExist) {
      throw new Error(`Directory "${destination}" already exist`);
    }

    await execute('mkdir', '-p', templatesDir);

    try {
      await execute(
        'curl', '--output-dir', templatesDir, '-L', '-O', '--fail-with-body', '--silent',
        `https://github.com/ChillPC/multi-release-test/releases/latest/download/${assetName}`);
      // `https://github.com/kuzzleio/project-templates/releases/latest/download/${assetName}`);
    }
    catch (error) {
      const executionError = error as ExecutionError;
      if (executionError.result.exitCode === 22) {
        throw new Error(`Scaffold for the flavor "${flavor}" does not exist`);
      }
    }

    await execute('tar', '-zxf', `${templatesDir}/${assetName}`, '--directory', templatesDir);

    await execute('cp', '-r', `${templatesDir}/${flavor}`, `${destination}/`);
  }
}
