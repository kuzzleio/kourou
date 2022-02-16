import path from 'path'
import fs from 'fs'

import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

class PaasInit extends Kommand {
  public static description = 'Initialize a PaaS project in current directory';

  public static flags = {
    help: flags.help(),
    ...kuzzleFlags,
  };

  static args = [
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
      paasProject: this.args.namespace,
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

export default PaasInit
