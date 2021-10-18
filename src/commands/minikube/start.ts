import { flags } from '@oclif/command'
import chalk from 'chalk'
import Listr from 'listr'
import emoji from 'node-emoji'
import fs from 'fs';

import { Kommand } from '../../common'
import { execute } from '../../support/execute'

const MIN_TF_VERSION = '1.0.0'

export default class MinikubeStart extends Kommand {
  static initSdk = false

  public static description = 'Starts Kuzzle kuzzle stack on minikube';

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

    this.log(`\nDeleting previous minikube cluster`)
    await execute('minikube', 'delete')
    this.log(`\nStarting minikube`)
    await execute('minikube', 'start')

    this.log(`\nCloning scaffold into /tmp/scaffold`)

    try {
      fs.statSync('/tmp/scaffold');
      await execute('rm', '-rf', '/tmp/scaffold')
    } catch (error) {
      this.log('/tmp/scaffold does not exists, cloning ...')
    } finally {
      await execute('git', 'clone', 'git@github.com:kuzzleio/scaffolds.git', '/tmp/scaffold')
      this.log(`\nInit module`)
      await execute('terraform', '-chdir=/tmp/scaffold/tf-minikube', 'init')
      this.log(`\nApply module`)
      await execute('terraform', '-chdir=/tmp/scaffold/tf-minikube', 'apply', '-auto-approve')
    }
  }

  public async checkPrerequisites(): Promise<boolean> {
    this.log(chalk.grey('Checking prerequisites...'))

    const checks: Listr = new Listr([
      {
        title: `Git is installed`,
        task: async () => {
          await execute('git', 'version')
        }
      },
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
