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
      description: 'Kuzzle instance name',
    }),
    all: flags.boolean({
      char: 'a',
      description: 'Kill all instances',
    }),
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
    this.logInfo(JSON.stringify(instancesList))
    this.logInfo(instance)
    this.logInfo(instancesList.includes(instance) ? 'true': 'false')
    if (!instance) {
      const responses: any = await inquirer.prompt([{
          name: 'instance',
          message: 'Which kuzzle instance do you want to kill',
          type: 'list',
          choices: instancesList
      }])
      instance = responses.instance!
    }
    else if (!instancesList.includes(instance)) {
      throw new Error('The instance parameter you setted isn\'t running')
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

    return instanceKill
  }

  private async getInstancesList(): Promise<string[]> {
    let containersListProcess

    try {
      containersListProcess = await execa('docker', ['ps', '--format', '"{{.Names}}"'])
    }
    catch {
      this.warn('Something went wrong while getting kuzzle running instances list')
      return []
    }

    const containersList: string[] = containersListProcess.stdout.replace(/"/g, '').split('\n')

    return containersList.filter(containerName =>
      (containerName.includes('kuzzle')
        && !containerName.includes('redis')
        && !containerName.includes('elasticsearch')))
  }
}
