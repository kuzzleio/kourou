import { flags } from '@oclif/command'
import chalk from 'chalk'
import { ChildProcess, spawn } from 'child_process'
import cli from 'cli-ux'
import execa from 'execa'
import { writeFileSync } from 'fs'
import Listr from 'listr'
import emoji from 'node-emoji'

import { Kommand } from '../../common'

const MIN_DOCO_VERSION = '1.12.0'


const kuzzleServicesFile = `
version: '3'

services:
  redis:
    image: redis:5
    ports:
      - "6379:6379"

  elasticsearch:
    image: kuzzleio/elasticsearch:7
    ports:
      - "9200:9200"
    ulimits:
      nofile: 65536
`

export default class AppStartServices extends Kommand {
  static initSdk = false

  public static description = 'Starts Kuzzle services (Elasticsearch and Redis)';

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
      await this.checkPrerequisites() :
      true

    if (this.flags.check && successfullCheck) {
      this.log(`\n${emoji.get('ok_hand')} Prerequisites are ${chalk.green.bold('OK')}!`)
    }
    else if (this.flags.check && !successfullCheck) {
      throw new Error(`${emoji.get('shrug')} Your system doesn't satisfy all the prerequisites. Cannot run Kuzzle services.`)
    }

    this.log(chalk.grey(`\nWriting docker-compose file to ${docoFilename}...`))

    writeFileSync(docoFilename, kuzzleServicesFile)

    // clean up
    await execa('docker-compose', ['-f', docoFilename, 'down'])

    const doco: ChildProcess = spawn(
      'docker-compose',
      ['-f', docoFilename, 'up', '-d'])

    const startMessage = ` ${emoji.get('rocket')} Elasticsearch and Redis are launching`

    cli.action.start(startMessage, undefined, { stdout: true })

    const bootingMessage = `\n${emoji.get('thumbsup')} ${chalk.bold(
      'Elasticsearch and Redis are booting',
    )} in the background right now.`

    doco.on('close', docoCode => {
      if (docoCode === 0) {
        cli.action.stop('done')
        this.log(bootingMessage)
        this.log(chalk.grey('To watch the logs, run'))
        this.log(chalk.grey(`  docker-compose -f ${docoFilename} logs -f\n`))
        this.log('  Elasticsearch port: 9200')
        this.log('  Redis port: 6379')
      }
      else {
        cli.action.stop(chalk.red(` Something went wrong: docker-compose exited with ${docoCode}`))

        this.log(chalk.grey('If you want to investigate the problem, try running'))

        this.log(chalk.grey(`  docker-compose -f ${docoFilename} up\n`))

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
              if (docoVersion < MIN_DOCO_VERSION) {
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
      }
    ])

    try {
      await checks.run()

      return true
    }
    catch (error) {
      this.logKo(error.message)

      return false
    }
  }
}
