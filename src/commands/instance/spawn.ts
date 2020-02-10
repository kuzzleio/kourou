import { flags } from '@oclif/command'
import chalk from 'chalk'
import { ChildProcess, spawn } from 'child_process'
import cli from 'cli-ux'
import compareVersion from 'compare-version'
import execa from 'execa'
import { writeFileSync } from 'fs'
import Listr from 'listr'
import net from 'net'
import emoji from 'node-emoji'
import { Kommand } from '../../common'

const MIN_MAX_MAP_COUNT = 262144
const MIN_DOCO_VERSION = '1.12.0'

const kuzzleStackV1 = (increment: number): string => `
version: '3'

services:
  kuzzle:
    image: kuzzleio/kuzzle:1
    ports:
      - "${7512 + increment}:7512"
      - "${1883 + increment}:1883"
      - "${9229 + increment}:9229"
    cap_add:
      - SYS_PTRACE
    depends_on:
      - redis
      - elasticsearch
    environment:
      - kuzzle_services__db__client__host=http://elasticsearch:9200
      - kuzzle_services__internalCache__node__host=redis
      - kuzzle_services__memoryStorage__node__host=redis
      - NODE_ENV=development
      - DEBUG=kuzzle:*,-kuzzle:entry-point:protocols:websocket

  redis:
    image: redis:5

  elasticsearch:
    image: kuzzleio/elasticsearch:5.6.10
    ports:
      - "${9200 + increment}:9200"
    ulimits:
      nofile: 65536
    environment:
      - cluster.name=kuzzle
      - "ES_JAVA_OPTS=-Xms1024m -Xmx1024m"
`

const kuzzleStackV2 = (increment: number): string => `
version: '3'

services:
  kuzzle:
    image: kuzzleio/kuzzle:2
    ports:
      - "${7512 + increment}:7512"
      - "${1883 + increment}:1883"
      - "${9229 + increment}:9229"
    cap_add:
      - SYS_PTRACE
    depends_on:
      - redis
      - elasticsearch
    environment:
    - kuzzle_services__storageEngine__client__node=http://elasticsearch:9200
    - kuzzle_services__internalCache__node__host=redis
    - kuzzle_services__memoryStorage__node__host=redis
    - kuzzle_server__protocols__mqtt__enabled=true
    - kuzzle_server__protocols__mqtt__developmentMode=false
    - kuzzle_limits__loginsPerSecond=50
    - NODE_ENV=development
    - DEBUG=kuzzle:*,-kuzzle:entry-point:protocols:websocket

  redis:
    image: redis:5

  elasticsearch:
    image: kuzzleio/elasticsearch:7
    ports:
      - "${9200 + increment}:9200"
    ulimits:
      nofile: 65536
`
export default class InstanceSpawn extends Kommand {
  public static description = 'Spawn a new Kuzzle instance';

  public static flags = {
    help: flags.help(),
    check: flags.boolean({
      description: 'Check prerequisite before running Kuzzle',
      default: false,
    }),
    version: flags.string({
      char: 'v',
      description: 'Core-version of the instance to spawn',
      default: '2',
    }),
  };

  /**
   * @override
   */
  public async run() {
    this.printCommand()

    const { flags: userFlags } = this.parse(InstanceSpawn)
    const portIndex = await this.findAvailablePort()
    const dockerComposeFileName = `/tmp/kuzzle-stack-${portIndex}.yml`

    const successfullCheck = userFlags.check ?
      await this.checkPrerequisites() :
      true

    if (userFlags.check && successfullCheck) {
      this.log(
        `\n${emoji.get('ok_hand')} Prerequisites are ${chalk.green.bold('OK')}!`)
    } else if (userFlags.check && !successfullCheck) {
      throw new Error(
        `${emoji.get('shrug')} Your system doesn't satisfy all the prerequisites. Cannot run Kuzzle.`)
    }

    this.log(
      chalk.grey(`\nWriting docker-compose file to ${dockerComposeFileName}...`),
    )
    writeFileSync(dockerComposeFileName, this.generateDocoFile(userFlags.version, portIndex))

    const doco: ChildProcess = spawn(
      'docker-compose',
      ['-f', dockerComposeFileName, '-p', `stack-${portIndex}`, 'up', '-d'])

    cli.action.start(
      ` ${emoji.get('rocket')} Kuzzle version ${userFlags.version} is launching`,
      undefined,
      {
        stdout: true,
      },
    )

    doco.on('close', docoCode => {
      if (docoCode === 0) {
        cli.action.stop('done')
        this.log(
          `\n${emoji.get('thumbsup')} ${chalk.bold(
            'Kuzzle is booting',
          )} in the background right now.`)
        this.log(chalk.grey('To watch the logs, run'))
        this.log(
          chalk.grey(`  docker-compose -f ${dockerComposeFileName} -p stack-${portIndex} logs -f\n`),
        )
        this.log(`  Kuzzle port: ${7512 + portIndex}`)
        this.log(`  MQTT port: ${1883 + portIndex}`)
        this.log(`  Node.js debugger port: ${9229 + portIndex}`)
        this.log(`  Elasticsearch port: ${9200 + portIndex}`)
      } else {
        cli.action.stop(
          chalk.red(
            ` Something went wrong: docker-compose exited with ${docoCode}`,
          ),
        )
        this.log(
          chalk.grey('If you want to investigate the problem, try running'),
        )
        this.log(chalk.grey(`  docker-compose -f ${dockerComposeFileName} -p stack-${portIndex} up\n`))
        throw new Error('docker-compose exited witn non-zero status')
      }
    })
  }

  public async checkPrerequisites(): Promise<boolean> {
    this.log(chalk.grey('Checking prerequisites...'))
    const checks: Listr = new Listr([
      {
        title: `docker-compose exists and the version is at least ${MIN_DOCO_VERSION}`,
        task: async () => {
          try {
            const docov = await execa('docker-compose', ['-v'])
            const matches = docov.stdout.match(/[^0-9.]*([0-9.]*).*/)
            if (matches === null) {
              throw new Error(
                'Unable to read docker-compose verson. This is weird.',
              )
            }
            const docoVersion = matches.length > 0 ? matches[1] : null

            if (docoVersion === null) {
              throw new Error(
                'Unable to read docker-compose version. This is weird.',
              )
            }
            try {
              if (compareVersion(docoVersion, MIN_DOCO_VERSION) === -1) {
                throw new Error(
                  `The detected version of docker-compose (${docoVersion}) is not recent enough (${MIN_DOCO_VERSION})`,
                )
              }
            } catch (error) {
              throw new Error(error)
            }
          } catch (error) {
            throw new Error(
              'No docker-compose found. Are you sure docker-compose is installed?',
            )
          }
        },
      },
      {
        title: `vm.max_map_count is greater than ${MIN_MAX_MAP_COUNT}`,
        task: async () => {
          try {
            const sysctl = await execa('/sbin/sysctl', [
              '-n',
              'vm.max_map_count',
            ])
            if (sysctl.exitCode !== 0) {
              throw new Error('Something went wrong checking vm.max_map_count')
            }

            const value: number = parseInt(sysctl.stdout, 10)
            if (value < MIN_MAX_MAP_COUNT) {
              throw new Error(
                `vm.max_map_count must be at least ${MIN_MAX_MAP_COUNT} (found ${value})`,
              )
            }
          } catch (error) {
            throw new Error('Something went wrong checking vm.max_map_count')
          }
        },
      },
    ])

    try {
      await checks.run()
      return true
    } catch (error) {
      this.logError(error.message)
      return false
    }
  }

  private generateDocoFile(kuzzleMajor: string, portIndex: number): string {
    if (kuzzleMajor === '1') {
      return kuzzleStackV1(portIndex)
    }

    return kuzzleStackV2(portIndex)
  }

  private isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const tester = net.createServer()
        .once('error', error => {
          if (!error.message.match(/EADDRINUSE/)) {
            reject(error)
          }
          resolve(false)
        })
        .once('listening', () => {
          tester
            .once('close', () => resolve(true))
            .close()
        })
        .listen(port)
    })
  }

  private async findAvailablePort(): Promise<number> {
    let i = 0

    // eslint-disable-next-line
    while (true) {
      if (await this.isPortAvailable(7512 + i)) {
        return i
      }
      i++
    }
  }
}
