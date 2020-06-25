import execa from 'execa'

import { Kommand } from '../../common'

export class InstanceList extends Kommand {
  static initSdk = false

  static description = 'Lists the Kuzzle running instances'

  async runSafe() {
    const instancesList = await this.getInstancesList()
    // Disable eslint no-console to allow using console.table
    // Instead of add another dependency to kourou
    // eslint-disable-next-line no-console
    console.table(instancesList, [
      'name',
      'status',
      'kuzzleVersion',
      'kuzzlePort',
      'esVersion',
      'esPort',
      'redisVersion',
      'redisPort'
    ])
  }

  private async getInstancesList(): Promise<object[]> {
    let containersListProcess

    try {
      containersListProcess = await execa('docker', ['ps', '--format', '"{{.Names}}%{{.Image}}%{{.Status}}%{{.Ports}}"'])
    } catch {
      this.warn('Something went wrong while getting kuzzle running instances list')
      return []
    }

    const containersList: string[] = containersListProcess.stdout
      .replace(/"/g, '')
      .split('\n')

    const stacks = [
      ...new Set(containersList.map(container => container.split('_')[0]))
    ].sort((stackA, stackB) => (stackA > stackB ? 1 : stackA < stackB ? -1 : 0))

    const formatedStacks = stacks.map(stack => ({
      name: stack,
      status: '',
      kuzzleVersion: 0,
      kuzzlePort: 0,
      redisVersion: 0,
      redisPort: 0,
      esVersion: 0,
      esPort: 0
    }))

    for (const container of containersList) {
      const splitted: string[] = container.split('%')

      const stackNumber: number = parseInt(
        splitted[0].split('_')[0].split('-')[1],
        10
      )
      const type: string = splitted[0].split('_')[1]
      const version: number = parseInt(splitted[1].split(':')[1], 10)
      const port: string = splitted[3]
      switch (type) {
        case 'kuzzle':
          formatedStacks[stackNumber].status = splitted[2]
          formatedStacks[stackNumber].kuzzleVersion = version
          formatedStacks[stackNumber].kuzzlePort = parseInt(
            port.substring(
              port.indexOf('->7512/tcp') - 4,
              port.indexOf('->7512/tcp')
            ), 10)
          break
        case 'redis':
          formatedStacks[stackNumber].redisVersion = version
          formatedStacks[stackNumber].redisPort = parseInt(
            port.replace('/tcp', ''),
            10)
          break
        case 'elasticsearch':
          formatedStacks[stackNumber].esVersion = version
          formatedStacks[stackNumber].esPort = parseInt(
            port.substring(
              port.indexOf('->9200/tcp') - 4,
              port.indexOf('->9200/tcp')
            ), 10)
          break
      }
    }

    return formatedStacks
  }
}
