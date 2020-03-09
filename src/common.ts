import { Command } from '@oclif/command'
import chalk from 'chalk'
import emoji from 'node-emoji'

export abstract class Kommand extends Command {
  public printCommand() {
    const klass: any = this.constructor

    this.log('')
    this.log(`${chalk.blue.bold(`${emoji.get('rocket')} Kourou`)} - ${klass.description}`)
    this.log('')
  }

  public log(message?: string | undefined, ...args: any[]): void {
    return super.log(` ${message}`, ...args)
  }

  public logError(message?: string | undefined, ...args: any[]): void {
    return this.error(chalk.red(message), ...args)
  }

  /**
   * Reads a value from STDIN or return the default value.
   * This method can parse both JSON string and JS string
   *
   * @param {String} defaultValue - Default value if nothing is written on STDIN
   *
   * @returns {Promise<String>} Parsed input
   */
  fromStdin(defaultValue: string) {
    return new Promise(resolve => {
      if (process.stdin.isTTY) {
        resolve(this._parseInput(defaultValue))
      }
      let input: any;

      process.stdin.on('data', data => {
        input = data.toString()
      })

      process.stdin.on('end', () => resolve(this._parseInput(input)))
    })
  }

  public _parseInput(input: string) {
    // eslint-disable-next-line no-eval
    return eval(`var o = ${input}; o`)
  }
}
