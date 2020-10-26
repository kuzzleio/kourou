import { flags } from '@oclif/command'

import { Http, WebSocket, Kuzzle } from 'kuzzle-sdk'

const SECOND = 1000

export const kuzzleFlags = {
  host: flags.string({
    description: 'Kuzzle server host',
    default: process.env.KUZZLE_HOST || 'localhost',
  }),
  port: flags.string({
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
  protocol: flags.string({
    description: 'Kuzzle protocol (http or ws)',
    default: process.env.KUZZLE_PROTOCOL || 'http',
  }),
  as: flags.string({
    description: 'Impersonate a user',
  }),
  'api-key': flags.string({
    description: 'Kuzzle user api-key',
    default: process.env.KUZZLE_API_KEY || undefined,
  })
}

export class KuzzleSDK {
  public sdk: Kuzzle;

  private host: string;

  private port: number;

  private ssl: boolean;

  private username: string;

  private password: string;

  private protocol: string;

  private apikey: string;

  private refreshTimer?: NodeJS.Timeout;

  constructor(options: any) {
    this.host = options.host
    this.port = parseInt(options.port, 10)
    this.ssl = options.ssl || this.port === 443
    this.username = options.username
    this.password = options.password
    this.protocol = options.protocol
    this.apikey = options['api-key']

    // Instantiate a fake SDK in the constructor to please TS
    this.sdk = new Kuzzle(new WebSocket('nowhere'))
  }

  public async init(logger: any) {
    let ProtocolClass

    // Avoid common mistake
    if (this.protocol === 'websocket') {
      this.protocol = 'ws'
    }

    if (this.protocol === 'ws') {
      ProtocolClass = WebSocket
    }
    else if (this.protocol === 'http') {
      ProtocolClass = Http
    }
    else {
      throw new TypeError(`Unknown protocol "${this.protocol}"`)
    }

    this.sdk = new Kuzzle(new ProtocolClass(this.host, {
      port: this.port,
      sslConnection: this.ssl,
    }))

    this.sdk.on('networkError', (error: any) => logger.logKo(error.message))

    logger.logInfo(`Connecting to ${this.protocol}${this.ssl ? 's' : ''}://${this.host}:${this.port} ...`)

    await this.sdk.connect()

    if (this.apikey) {
      this.sdk.jwt = this.apikey
    } else if (this.username !== 'anonymous') {
      const credentials = {
        username: this.username,
        password: this.password,
      }

      await this.sdk.auth.login('local', credentials, '90s')

      this.refreshTimer = setInterval(async () => {
        try {
          await this.sdk.auth.refreshToken()
        }
        catch (error) {
          logger.logKo(`Cannot refresh token: ${error.message}`)
        }
      }, 80 * SECOND)

      logger.logInfo(`Loggued as ${this.username}.`)
    }
  }

  /**
   * Impersonates a user.
   * Every action called in the given callback will be impersonated.
   *
   * @param {string} userKuid - User kuid to impersonate
   * @param {Function} callback - Callback that will be impersonated
   */
  public async impersonate(userKuid: string, callback: Function) {
    const currentToken = this.sdk.jwt

    let apiKey: any

    try {
      const apiKey = await this.security.createApiKey(
        userKuid,
        'Kourou impersonation token',
        { expiresIn: '2h', refresh: false })

      this.sdk.jwt = apiKey._source.token

      const promise = callback()

      if (typeof promise !== 'object' && typeof promise.then !== 'function') {
        throw new TypeError('The impersonate callback function must return a promise')
      }

      await promise
    }
    catch (error) {
      throw error
    }
    finally {
      this.sdk.jwt = currentToken

      if (apiKey?._id) {
        await this.security.deleteApiKey(userKuid, apiKey._id)
      }
    }
  }

  disconnect() {
    this.sdk.disconnect()

    if (this.refreshTimer) {
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

  get auth() {
    return this.sdk.auth
  }

  get server() {
    return this.sdk.server
  }

  get realtime() {
    return this.sdk.realtime
  }

  get ms() {
    return this.sdk.ms
  }
}
