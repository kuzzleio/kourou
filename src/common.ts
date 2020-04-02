import { Command } from '@oclif/command'
import chalk from 'chalk'
import emoji from 'node-emoji'
import fs from 'fs'

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

  public logOk(message: string, ...args: any[]): void {
    this.log(chalk.green(`[✔] ${message}`), ...args)
  }

  public logKo(message: string, ...args: any[]): void {
    process.exitCode = 1
    this.log(chalk.red(`[X] ${message}`), ...args)
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
      // cucumber mess with stdin so I have to do this trick
      if (process.env.NODE_ENV === 'test' || process.stdin.isTTY) {
        resolve(this._parseInput(defaultValue))
        return
      }

      const input = fs.readFileSync(0, 'utf8')

      resolve(this._parseInput(input))
    })
  }

  public _parseInput(input: string) {
    // eslint-disable-next-line no-eval
    return eval(`var o = ${input}; o`)
  }
}
