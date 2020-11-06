import { Command } from '@oclif/command'
import chalk from 'chalk'
import emoji from 'node-emoji'
import fs from 'fs'

import { KuzzleSDK } from './support/kuzzle'
import { Editor, EditorParams } from './support/editor'

export abstract class Kommand extends Command {
  // Instantiate a dummy SDK to avoid the this.sdk notation everywhere -_-
  protected sdk: KuzzleSDK = new KuzzleSDK({ host: 'nowhere' })

  private exitCode = 0

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
    if (this.flags['print-raw']) {
      return
    }

    super.log(` ${message}`)
  }

  public logOk(message: string): void {
    if (this.flags['print-raw']) {
      return
    }

    this.log(chalk.green(`[✔] ${message}`))
  }

  public logInfo(message: string): void {
    if (this.flags['print-raw']) {
      return
    }

    this.log(chalk.yellow(`[ℹ] ${message}`))
  }

  public logKo(message?: string): void {
    if (this.flags['print-raw']) {
      return
    }

    this.exitCode = 1
    this.log(chalk.red(`[X] ${message}`))
  }

  async run() {
    const kommand = (this.constructor as unknown) as any

    const result = this.parse(kommand)
    this.args = result.args
    this.flags = result.flags

    this.printCommand()

    if (kommand.readStdin) {
      this.stdin = this.fromStdin()

      if (this.stdin && this.flags.editor) {
        throw new Error('Unable to use flag --editor when reading from STDIN')
      }
    }

    // Lifecycle hook
    await this.beforeConnect()

    try {
      if (kommand.initSdk) {
        this.sdk = new KuzzleSDK({
          ...this.flags,
          ...this.sdkOptions,
          appName: this.config.name,
          appVersion: this.config.version
        })

        await this.sdk.init(this)
      }

      if (this.flags.as) {
        this.logInfo(`Impersonate user "${this.flags.as}"`)

        await this.sdk.impersonate(this.flags.as, async () => {
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
      this.sdk.disconnect()
      // eslint-disable-next-line
      process.exit(this.exitCode)
    }
  }

  beforeConnect() {
    // will be called before connecting to Kuzzle
  }

  async runSafe() {
    throw new Error('You must implement runSafe() method')
  }

  /**
   * Reads a value from STDIN.
   *
   * @returns {String} Parsed input
   */
  fromStdin(): string | undefined {
    // cucumber mess with stdin so I have to do this trick
    if (process.env.NODE_ENV === 'test' || process.stdin.isTTY) {
      return
    }

    return fs.readFileSync(0, 'utf8')
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
