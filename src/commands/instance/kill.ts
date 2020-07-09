import { flags } from '@oclif/command'
import inquirer from 'inquirer'
import execa from 'execa'

import { Kommand } from '../../common'

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
        `The instance parameter you setted ${instance} isn\'t running`
      )
    }
    await this.killInstance(instance)
  }

  private async killInstance(instanceName: string) {
    const docoFilename = `/tmp/kuzzle-${instanceName}.yml`
    const instanceKill = execa('docker-compose', [
      '-f',
      docoFilename,
      '-p',
      instanceName,
      'down'
    ])

    instanceKill.stdout.pipe(process.stdout)
    instanceKill.stderr.pipe(process.stderr)

    return instanceKill
  }

  private async getInstancesList(): Promise<string[]> {
    let containersListProcess

    try {
      containersListProcess = await execa('docker', [
        'ps',
        '--format',
        '"{{.Names}}"'
      ])
      this.log(JSON.stringify(containersListProcess.stdout))
    } catch {
      this.warn(
        'Something went wrong while getting kuzzle running instances list'
      )
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
      .map(containerName => containerName.replace('_kuzzle_1', ''))
  }
}
