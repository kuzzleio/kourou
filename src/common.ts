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
    return this.log(chalk.red(message), ...args)
  }
}
