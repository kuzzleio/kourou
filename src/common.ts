import { Command } from '@oclif/command'
import chalk from 'chalk'
import emoji from 'node-emoji'
import fs from 'fs'

import { KuzzleSDK } from './support/kuzzle'
import { Editor, EditorParams } from './support/editor'

export abstract class Kommand extends Command {
  protected sdk?: KuzzleSDK

  public args: any

  public flags: any

  public static initSdk = true

  public static readStdin = false

  public stdin: string | undefined = undefined

  public sdkOptions: any = {}

  public printCommand() {
    const klass: any = this.constructor

    const shortDescription = klass.description
      .split('\n')
      .filter((line: string) => line.length > 0)[0]

    this.log('')
    this.log(`${chalk.blue.bold(`${emoji.get('rocket')} Kourou`)} - ${shortDescription}`)
    this.log('')
  }

  public log(message?: string): void {
    super.log(` ${message}`)
  }

  public logOk(message: string): void {
    this.log(chalk.green(`[✔] ${message}`))
  }

  public logInfo(message: string): void {
    this.log(chalk.yellow(`[ℹ] ${message}`))
  }

  public logKo(message?: string): void {
    process.exitCode = 1
    this.log(chalk.red(`[X] ${message}`))
  }

  async run() {
    this.printCommand()
    const kommand = (this.constructor as unknown) as any

    const result = this.parse(kommand)
    this.args = result.args
    this.flags = result.flags

    if (kommand.readStdin) {
      this.stdin = await this.fromStdin()

      if (this.stdin && this.flags.editor) {
        throw new Error('Unable to use flag --editor when reading from STDIN')
      }
    }

    // Lifecycle hook
    await this.beforeConnect()

    try {
      if (kommand.initSdk) {
        this.sdk = new KuzzleSDK({ ...this.flags, ...this.sdkOptions })

        await this.sdk.init(this)
      }

      if (this.flags.as) {
        this.logInfo(`Impersonate user "${this.flags.as}"`)

        await this.sdk?.impersonate(this.flags.as, async () => {
          await this.runSafe()
        })
      }
      else {
        await this.runSafe()
      }
    }
    catch (error) {
      this.logKo(`${error.stack || error.message}\n\tstatus: ${error.status}\n\tid: ${error.id}`)
    }
    finally {
      this.sdk?.disconnect()
    }
  }

  beforeConnect() {
    // will be called after arguments parsing
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

  fromEditor(defaultContent: object | string, options?: EditorParams): object {
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
    return eval(`var o = ${input}; o`)
  }
}
