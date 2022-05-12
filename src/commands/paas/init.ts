import path from 'path'
import fs from 'fs'

import { flags } from '@oclif/command'

import { PaasKommand } from '../../support/PaasKommand'

class PaasInit extends PaasKommand {
  public static description = 'Initialize a PaaS project in current directory';

  public static flags = {
    help: flags.help(),
  };

  static args = [
    { name: 'project', description: 'Kuzzle PaaS project name', required: true },
  ]

  async runSafe() {
    const packageJsonPath = path.join(process.cwd(), 'package.json')

    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`Cannot find package json in current directory. (${packageJsonPath})`)
    }

    const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'))

    this.logInfo('Add the "kuzzle" property inside project package.json.')

    packageJson.kuzzle = {
      paas: {
        project: this.args.project,
      },
    };

    await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

export default PaasInit
