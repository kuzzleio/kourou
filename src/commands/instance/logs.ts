import { Command, flags } from '@oclif/command'
import * as inquirer from 'inquirer'
import execa from 'execa'

export class InstanceLogs extends Command {

  static flags = {
    instance: flags.string({
      char: 'i',
      description: 'Kuzzle instance name',
    }),
    follow: flags.boolean({
      char: 'f',
      description: 'Follow log output',
    }),
  }

  async run() {
    const { flags } = this.parse(InstanceLogs)
    let instance: string = flags.instance!;
    let followOption: boolean = flags.follow

    if (!instance) {
      const instancesList = await this.getInstancesList()

      let responses: any = await inquirer.prompt([{
        name: 'instance',
        message: 'On which kuzzle instance do you want to see the logs',
        type: 'list',
        choices: instancesList,
      }])
      instance = responses.instance!
    }

    try {
      await this.showInstanceLogs(instance, followOption)
    }
    catch {
      this.warn('Something went wrong while showing your kuzzle instance logs')
    }

  }

  private async showInstanceLogs(instanceName: string, followOption: boolean) {
    const args = ['logs', instanceName]
    if (followOption) {
      args.push('-f')
    }
    const instanceLogs = execa('docker', args)

    instanceLogs.stdout.pipe(process.stdout)
    instanceLogs.stderr.pipe(process.stderr)
    await instanceLogs
  }

  private async getInstancesList(): Promise<string[] | undefined> {
    let containersListProcess

    try {
      containersListProcess = await execa('docker', ['ps', '--format', '"{{.Names}}"'])
    }
    catch {
      this.warn('Something went wrong while getting kuzzle running instances list')
      return
    }

    const containersList: string[] = containersListProcess.stdout.replace(/"/g, '').split('\n')

    return containersList.filter(containerName => {
      if ( containerName.includes('kuzzle')
        && !containerName.includes('redis')
        && !containerName.includes('elasticsearch')
      ) {
        return true
      }
      return false
    });
  }

}

