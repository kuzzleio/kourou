import { flags } from '@oclif/command'
import inquirer from 'inquirer'
import execa from 'execa'

import { Kommand } from '../../common'

export class InstanceLogs extends Kommand {
  static initSdk = false

  static description = 'Kill all the containers of a running kuzzle instance'

  static flags = {
    instance: flags.string({
      char: 'i',
      description: 'Kuzzle instance name'
    })
  }

  async runSafe() {
    let instance: string = this.flags.instance!

    if (!instance) {
      const instancesList = await this.getInstancesList()
      if (instancesList.length === 0) {
        throw new Error('There is no Kuzzle running instances')
      }
      const responses: any = await inquirer.prompt([
        {
          name: 'instance',
          message: 'Which kuzzle instance do you want to kill',
          type: 'list',
          choices: instancesList
        }
      ])
      instance = responses.instance!
    }

    await this.killInstance(instance)
  }

  private async killInstance(instanceName: string) {
    const stack: string = instanceName.split('_')[0]
    const kuzzleName = `${stack}_kuzzle_1`
    const esName = `${stack}_elasticsearch_1`
    const redisName = `${stack}_redis_1`
    const args = ['kill', kuzzleName, esName, redisName]

    const instanceKill = execa('docker', args)

    instanceKill.stdout.pipe(process.stdout)
    instanceKill.stderr.pipe(process.stderr)

    await instanceKill
  }

  private async getInstancesList(): Promise<string[]> {
    let containersListProcess

    try {
      containersListProcess = await execa('docker', [
        'ps',
        '--format',
        '"{{.Names}}"'
      ])
    } catch {
      this.warn(
        'Something went wrong while getting kuzzle running instances list'
      )
      return []
    }

    const containersList: string[] = containersListProcess.stdout
      .replace(/"/g, '')
      .split('\n')

    return containersList.filter(
      containerName =>
        containerName.includes('kuzzle') &&
        !containerName.includes('redis') &&
        !containerName.includes('elasticsearch')
    )
  }
}
