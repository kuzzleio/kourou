import path from 'path'
import fs from 'fs'

import { cli } from 'cli-ux'
import { flags } from '@oclif/command'

import PaasLogin from './login'
import { PaasKommand } from '../../support/PaasKommand'

class PaasInit extends PaasKommand {
  public static description = 'Initialize a PaaS namespace in current directory';

  public static flags = {
    help: flags.help(),
  };

  static args = [
    { name: 'username', description: 'Username', required: true },
    { name: 'namespace', description: 'Namespace', required: true },
  ]

  async runSafe() {
    const packageJsonPath = path.join(process.cwd(), 'package.json')

    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`Cannot find package json in current directory. (${packageJsonPath})`)
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    this.logInfo('Add the "kuzzle" property inside project package.json.')

    packageJson.kuzzle = {
      paas: {
        application: 'kuzzle',
        namespace: this.args.namespace,
      },
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    this.log('');
    const nextStep = await cli.prompt('Do you want to login to the namespace? [Y/N]', { type: 'single' })
    this.log('');

    if (nextStep.toLowerCase().startsWith('y')) {
      await PaasLogin.run(['--username', this.args.username, '--namespace', this.args.namespace]);
    }
  }
}

export default PaasInit
