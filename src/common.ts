import { Command } from '@oclif/command'
import chalk from 'chalk'
import emoji from 'node-emoji'
import fs from 'fs'

import { KuzzleSDK } from './support/kuzzle'
import { Editor, EditorParams } from './support/editor'

export abstract class Kommand extends Command {
  protected sdk?: KuzzleSDK;

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
    process.exitCode = 1
    return this.error(chalk.red(`[X] ${message}`), ...args)
  }

  async run() {
    try {
      await this.runSafe()
    }
    catch (error) {
      this.logError(`${error.stack || error.message}\n\tstatus: ${error.status}\n\tid: ${error.id}`)
    }
    finally {
      if (this.sdk) {
        this.sdk.disconnect()
      }
    }
  }

  async runSafe() {
    throw new Error('You must implement runSafe() method')
  }

  /**
   * Reads a value from STDIN.
   *
   * @returns {Promise<String>} Parsed input
   */
  fromStdin(): Promise<string | undefined> {
    return new Promise(resolve => {
      // cucumber mess with stdin so I have to do this trick
      if (process.env.NODE_ENV === 'test' || process.stdin.isTTY) {
        resolve()
        return
      }

      const input = fs.readFileSync(0, 'utf8')

      resolve(input)
    })
  }

  fromEditor(defaultContent: object | string, options?: EditorParams) {
    let content = defaultContent

    if (typeof content !== 'string') {
      content = JSON.stringify(content)
    }
    const editor = new Editor(content, options)

    editor.run()

    return this.parseJs(editor.content)
  }

  public parseJs(input?: string) {
    if (!input) {
      return {}
    }

    // eslint-disable-next-line no-eval
    return (eval(`var o = ${input}; o`))
  }
}
