import { writeFileSync } from 'fs'

import { flags } from '@oclif/command'
import chalk from 'chalk'
import Listr from 'listr'
import emoji from 'node-emoji'

import { Kommand } from '../../common'
import { execute } from '../../support/execute'

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
    const docoFilename = '/tmp/kuzzle-services.yml'

    const successfullCheck = this.flags.check ?
      await this.checkPrerequisites() : true

    if (this.flags.check && successfullCheck) {
      this.log(`\n${emoji.get('ok_hand')} Prerequisites are ${chalk.green.bold('OK')}!`)
    } else if (this.flags.check && !successfullCheck) {
      throw new Error(`${emoji.get('shrug')} Your system doesn't satisfy all the prerequisites`)
    }

    // clean up
    await execute('docker-compose', '-f', docoFilename, 'down')

    await execute('docker-compose', '-f', docoFilename, 'up', '-d')

    this.logOk('Elasticsearch and Redis are booting in the background right now.')
    this.log(chalk.grey('\nTo watch the logs, run'))
    this.log(chalk.grey(`  docker-compose -f ${docoFilename} logs -f\n`))
    this.log('  Elasticsearch port: 9200')
    this.log('  Redis port: 6379')
  }

  public async checkPrerequisites(): Promise<boolean> {
    this.log(chalk.grey('Checking prerequisites...'))

    const checks: Listr = new Listr([
      {
        title: `Minikube is installed`,
        task: async () => {
          const minikubeVersionCommand = await execute('minikube', 'version')
          const matches = minikubeVersionCommand.stdout.match(/[^0-9.]*([0-9.]*).*/)
          if (matches === null) {
            throw new Error(
              'Unable to read minikube. This is weird.',
            )
          }
          const minikubeVersion = matches.length > 0 ? matches[1] : null

          if (minikubeVersion === null) {
            throw new Error(
              'Unable to read minikube version. This is weird.',
            )
          }
        },
      },
      {
        title: `Terraform is installed`,
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
        },
      }
    ])

    await checks.run()
    return true
  }
}
