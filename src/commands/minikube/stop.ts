import { flags } from '@oclif/command'
import chalk from 'chalk'
import Listr from 'listr'
import emoji from 'node-emoji'

import { Kommand } from '../../common'
import { execute } from '../../support/execute'

const MIN_TF_VERSION = '1.0.0'

export default class MinikubeStop extends Kommand {
  static initSdk = false

  public static description = 'Stop Kuzzle kuzzle stack on minikube';

  public static flags = {
    help: flags.help(),
    check: flags.boolean({
      description: 'Check prerequisite before running services',
      default: false,
    }),
  };

  async runSafe() {
    const successfullCheck = this.flags.check ?
      await this.checkPrerequisites() : true

    if (this.flags.check && successfullCheck) {
      this.log(`\n${emoji.get('ok_hand')} Prerequisites are ${chalk.green.bold('OK')}!`)
    } else if (this.flags.check && !successfullCheck) {
      throw new Error(`${emoji.get('shrug')} Your system doesn't satisfy all the prerequisites`)
    }

    await execute('minikube', 'stop')
  }

  public async checkPrerequisites(): Promise<boolean> {
    this.log(chalk.grey('Checking prerequisites...'))

    const checks: Listr = new Listr([
      {
        title: `Minikube is installed`,
        task: async () => {
          await execute('minikube', 'version')
        },
      },
      {
        title: `Terraform is installed and at the right version`,
        task: async () => {
          const terraformVersionCommand = await execute('terraform', 'version')
          const matches = terraformVersionCommand.stdout.match(/[^0-9.]*([0-9.]*).*/)

          if (matches === null) {
            throw new Error(
              'Unable to read terraform version. This is weird.',
            )
          }
          const terraformVersion = matches.length > 0 ? matches[1] : null

          if (terraformVersion === null) {
            throw new Error(
              'Unable to read terraform version. This is weird.',
            )
          }

          if (terraformVersion < MIN_TF_VERSION) {
            throw new Error(
              `The detected version of Terraform (${terraformVersion}) is not recent enough (${MIN_TF_VERSION})`,
            )
          }
        },
      }
    ])

    await checks.run()
    return true
  }
}
