import { flags } from '@oclif/command'
import inquirer from 'inquirer'
import cli from 'cli-ux'
import { ChildProcess, spawn } from 'child_process'
import chalk from 'chalk'
import emoji from 'node-emoji'

import { Kommand } from '../../common'
import { execute } from '../../support/execute'

export class InstanceLogs extends Kommand {
  static initSdk = false

  static description =
    'Stop and remove all the containers of a running kuzzle instance'

  static flags = {
    instance: flags.string({
      char: 'i',
      description: 'Kuzzle instance name [ex: stack-0]'
    }),
    all: flags.boolean({
      char: 'a',
      description: 'Kill all instances'
    })
  }

  async runSafe() {
    let instance: string = this.flags.instance
    const all: boolean = this.flags.all

    const instancesList = await this.getInstancesList()
    if (instancesList.length === 0) {
      throw new Error('There are no Kuzzle running instances')
    }

    if (all) {
      for (const i of instancesList) {
        await this.killInstance(i)
      }
      return
    }
    if (!instance) {
      const responses: any = await inquirer.prompt([
        {
          name: 'instance',
          message: 'Which kuzzle instance do you want to kill',
          type: 'list',
          choices: instancesList
        }
      ])
      instance = responses.instance!
    } else if (!instancesList.includes(instance)) {
      throw new Error(
        `The instance parameter you setted ${instance} isn't running`
      )
    }
    await this.killInstance(instance)
  }

  private async killInstance(instanceName: string) {
    const docoFilename = `/tmp/kuzzle-${instanceName}.yml`
    cli.action.start(
      `${emoji.get('boom')}  Killing Kuzzle instance ${instanceName}`,
      undefined,
      {
        stdout: true
      }
    )
    const instanceKill: ChildProcess = spawn('docker-compose', [
      '-f',
      docoFilename,
      '-p',
      instanceName,
      'down'
    ])
    return new Promise(resolve => instanceKill.on('close', code => {
      if (code === 0) {
        cli.action.stop(
          chalk.green(
            `\n${emoji.get(
              'thumbsup'
            )}  Instance ${instanceName} successfully killed.`
          )
        )
      } else {
        cli.action.stop(
          chalk.red(
            `\n${emoji.get(
              'thumbsdown'
            )}  Something went wrong whilde killing instance ${instanceName}.`
          )
        )
      }
      resolve()
    }))
  }

  private async getInstancesList(): Promise<string[]> {
    let containersListProcess

    try {
      containersListProcess = await execute('docker', 'ps', '--format', '"{{.Names}}"')
    }
    catch {
      this.warn('Something went wrong while getting kuzzle running instances list')
      return []
    }

    const containersList: string[] = containersListProcess.stdout
      .replace(/"/g, '')
      .split('\n')

    return containersList
      .filter(
        containerName =>
          containerName.includes('kuzzle') &&
          !containerName.includes('redis') &&
          !containerName.includes('elasticsearch')
      )
      .map(containerName => containerName.split('_')[0])
  }
}
