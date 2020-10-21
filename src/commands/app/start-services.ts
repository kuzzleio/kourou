import { writeFileSync } from 'fs'

import { flags } from '@oclif/command'
import chalk from 'chalk'
import Listr from 'listr'
import emoji from 'node-emoji'

import { Kommand } from '../../common'
import { execute } from '../../support/execute'

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

    this.log(chalk.grey(`\nWriting docker-compose file to ${docoFilename}...\n`))

    writeFileSync(docoFilename, kuzzleServicesFile)

    // clean up
    await execute('docker-compose', '-f', docoFilename, 'down')

    try {
      await execute('docker-compose', '-f', docoFilename, 'up', '-d')

      this.logOk('Elasticsearch and Redis are booting in the background right now.')
      this.log(chalk.grey('\nTo watch the logs, run'))
      this.log(chalk.grey(`  docker-compose -f ${docoFilename} logs -f\n`))
      this.log('  Elasticsearch port: 9200')
      this.log('  Redis port: 6379')
    }
    catch (error) {
      this.logKo(` Something went wrong: ${error.message}`)
      this.log(chalk.grey('If you want to investigate the problem, try running'))

      this.log(chalk.grey(`  docker-compose -f ${docoFilename} up\n`))
    }
  }

  public async checkPrerequisites(): Promise<boolean> {
    this.log(chalk.grey('Checking prerequisites...'))

    const checks: Listr = new Listr([
      {
        title: `docker-compose exists and the version is at least ${MIN_DOCO_VERSION}`,
        task: async () => {
          try {
            const docov = await execute('docker-compose', '-v')
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
