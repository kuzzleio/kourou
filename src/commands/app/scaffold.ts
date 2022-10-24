import { flags } from '@oclif/command';
import chalk from 'chalk';
import * as fsp from 'fs/promises';
import Listr from 'listr';
import fetch from 'node-fetch';
import path from 'path';
import tar from 'tar';
import tmp from 'tmp';

import { Kommand } from '../../common';


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

      this.logOk(`Scaffolding complete! Install dependencies with :
        ${chalk.grey(`cd ${destination} && npm run docker npm install`)}
        and run your application with:
        ${chalk.grey('npm run docker:dev')}`)
    }
    catch (error: any) { }
  }

  async cloneTemplate(flavor: string, destination: string) {
    const tmpDir = tmp.dirSync();

    const assetName = `${flavor}.tar.gz`;
    const link = `https://github.com/kuzzleio/project-templates/releases/latest/download/${assetName}`;

    let directoryExist = true;
    try {
      await fsp.access(destination);
    }
    catch (error) {
      directoryExist = false;
    }

    if (directoryExist) {
      throw new Error(`Directory "${destination}" already exist`);
    }

    const response = await fetch(link);

    if (! response.ok) {
      throw new Error(`Scaffold for the flavor "${flavor}" does not exist`);
    }

    await fsp.writeFile(path.join(tmpDir.name, assetName), response.body as any);

    tar.extract({
      cwd: tmpDir.name,
      file: path.join(tmpDir.name, assetName),
      keep: true,
      strict: true,
      sync: true,
    });

    await fsp.rename(path.join(tmpDir.name, flavor), destination);

  }
}
