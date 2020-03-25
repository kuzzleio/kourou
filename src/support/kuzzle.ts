import { flags } from '@oclif/command'
import chalk from 'chalk'

// tslint:disable-next-line
const { Http, WebSocket, Kuzzle } = require('kuzzle-sdk')

const ONE_SECOND = 60 * 1000;

export const kuzzleFlags = {
  host: flags.string({
    char: 'h',
    description: 'Kuzzle server host',
    default: process.env.KUZZLE_HOST || 'localhost',
  }),
  port: flags.string({
    char: 'p',
    description: 'Kuzzle server port',
    default: process.env.KUZZLE_PORT || '7512',
  }),
  ssl: flags.boolean({
    description: 'Use SSL to connect to Kuzzle',
    default: Boolean(process.env.KUZZLE_SSL) || undefined,
  }),
  username: flags.string({
    description: 'Kuzzle username (local strategy)',
    default: process.env.KUZZLE_USERNAME || 'anonymous',
  }),
  password: flags.string({
    description: 'Kuzzle user password',
    default: process.env.KUZZLE_PASSWORD || undefined,
  }),
}
export class KuzzleSDK {
  public sdk: any;

  private host: string;

  private port: number;

  private ssl: boolean;

  private username: string;

  private password: string;

  private refreshLogin: boolean;

  private protocol: string;

  private refreshTimer?: NodeJS.Timeout;

  constructor(options: any) {
    this.host = options.host
    this.port = parseInt(options.port, 10)
    this.ssl = options.ssl || this.port === 443
    this.username = options.username
    this.password = options.password
    this.refreshLogin = options.refreshLogin || false
    this.protocol = options.protocol || 'http'
  }

  public async init(log: any) {
    const protocolClass = this.protocol === 'ws'
      ? WebSocket
      : Http

    this.sdk = new Kuzzle(new protocolClass(this.host, {
      port: this.port,
      sslConnection: this.ssl,
    }))

    log(`[ℹ] Connecting to ${this.protocol}${this.ssl ? 's' : ''}://${this.host}:${this.port} ...`)

    await this.sdk.connect()

    if (this.username !== 'anonymous') {
      const credentials = {
        username: this.username,
        password: this.password,
      }

      await this.sdk.auth.login('local', credentials, '90s')

      if (this.refreshLogin) {
        this.refreshTimer = setInterval(async () => {
          try {
            await this.sdk.auth.refreshToken()
          }
          catch (error) {
            log(`Cannot refresh token: ${error}`)
          }
        }, ONE_SECOND);
      }

      log(chalk.green(`[ℹ] Loggued as ${this.username} (refreshLogin: ${this.refreshLogin}).`))
    }
  }

  disconnect() {
    this.sdk.disconnect()

    if (this.refreshLogin) {
      clearInterval(this.refreshTimer)
    }
  }

  public query(request: any) {
    return this.sdk.query(request)
  }

  get document() {
    return this.sdk.document
  }

  get collection() {
    return this.sdk.collection
  }

  get index() {
    return this.sdk.index
  }

  get security() {
    return this.sdk.security
  }
}
