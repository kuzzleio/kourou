import http from "http";
import https from "https";

import { flags } from "@oclif/command";
import { Http, WebSocket, Kuzzle, JSONObject } from "kuzzle-sdk";

const SECOND = 1000;

export const kuzzleFlags = {
  host: flags.string({
    description: "Kuzzle server host",
    default: process.env.KUZZLE_HOST || "localhost",
  }),
  port: flags.string({
    description: "Kuzzle server port",
    default: process.env.KUZZLE_PORT || "7512",
  }),
  ssl: flags.boolean({
    description: "Use SSL to connect to Kuzzle",
    default: Boolean(process.env.KUZZLE_SSL) || undefined,
  }),
  username: flags.string({
    description: "Kuzzle username (local strategy)",
    default: process.env.KUZZLE_USERNAME || "anonymous",
  }),
  password: flags.string({
    description: "Kuzzle user password",
    default: process.env.KUZZLE_PASSWORD || undefined,
  }),
  protocol: flags.string({
    description: "Kuzzle protocol (http or ws)",
    default: process.env.KUZZLE_PROTOCOL || "ws",
  }),
  as: flags.string({
    description: "Impersonate a user",
  }),
  "api-key": flags.string({
    description: "Kuzzle user api-key",
    default: process.env.KUZZLE_API_KEY || undefined,
  }),
};

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

  private appVersion: string;

  private appName: string;

  private ttl: string;

  private keepAuth: boolean;

  constructor(options: any) {
    this.host = options.host;
    this.port = parseInt(options.port, 10);
    this.ssl = options.ssl || this.port === 443;
    this.username = options.username;
    this.password = options.password;
    this.protocol = options.protocol;
    this.apikey = options["api-key"] || options.apiKey;
    this.appVersion = options.appVersion;
    this.appName = options.appName;
    this.ttl = options.ttl || "90s";
    this.keepAuth = options.keepAuth || false;

    // Instantiate a fake SDK in the constructor to please TS
    this.sdk = new Kuzzle(new WebSocket("nowhere"));
  }

  public async init(logger: any) {
    let ProtocolClass;
    // Avoid common mistake
    if (this.protocol === "websocket") {
      this.protocol = "ws";
    }

    if (this.protocol === "ws") {
      ProtocolClass = WebSocket;
    } else if (this.protocol === "http") {
      ProtocolClass = Http;
    } else {
      throw new TypeError(`Unknown protocol "${this.protocol}"`);
    }

    this.sdk = new Kuzzle(
      new ProtocolClass(this.host, {
        port: this.port,
        sslConnection: this.ssl,
        pingInterval: 20 * 1000,
      })
    );

    this.sdk.volatile = {
      client: `${this.appName}@${this.appVersion}`,
    };

    this.sdk.on("networkError", (error: any) => logger.logKo(error.message));

    logger.logInfo(
      `Connecting to ${this.protocol}${this.ssl ? "s" : ""}://${this.host}:${this.port
      } ...`
    );

    await this.sdk.connect();

    if (this.apikey) {
      this.sdk.jwt = this.apikey;
    } else if (this.username !== "anonymous") {
      const credentials = {
        username: this.username,
        password: this.password,
      };

      await this.sdk.auth.login("local", credentials, this.ttl);

      if (this.keepAuth) {
        this.refreshTimer = setInterval(async () => {
          try {
            await this.sdk.auth.refreshToken();
          } catch (error: any) {
            logger.logKo(`Cannot refresh token: ${error.message}`);
          }
        }, 80 * SECOND);
      }

      logger.logInfo(`Loggued as ${this.username}.`);
    }
  }

  /**
   * Impersonates a user.
   * Every action called in the given callback will be impersonated.
   *
   * @param {string} userKuid - User kuid to impersonate
   * @param {Function} callback - Callback that will be impersonated
   * @returns {void}
   */
  public async impersonate(userKuid: string, callback: { (): Promise<void> }) {
    const currentToken = this.sdk.jwt;
    let apiKey: any;
    let callbackResult;

    try {
      console.log('Starting impersonation process...');
      apiKey = await this.security.createApiKey(
        userKuid,
        "Kourou impersonation token",
        { expiresIn: "2h", refresh: false } as any
      );

      console.log(`Impersonating user ${userKuid}...`, apiKey);
      this.sdk.jwt = apiKey._source.token;

      console.log('Executing callback...');
      callbackResult = await callback(); // Store the result
      console.log('Callback completed successfully');

      return callbackResult; // Return the callback result
    } catch (error) {
      console.error('Error during impersonation:', error);
      throw error;
    } finally {
      console.log("Starting cleanup in finally block...");

      // Move token restoration after cleanup
      if (apiKey?._id) {
        try {
          await this.security.deleteApiKey(userKuid, apiKey._id);
          console.log('API key cleanup successful');
        } catch (cleanupError) {
          console.error('Error cleaning up API key:', cleanupError);
        }
      }

      // Restore token last
      this.sdk.jwt = currentToken;
      console.log("Token restored and cleanup completed");
    }
  }



  disconnect() {
    this.sdk.disconnect();

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  public query(request: any) {
    // Convert string to boolean when protocol is WebSocket
    if (this.protocol === "ws") {
      for (const [key, value] of Object.entries(request)) {
        if (value === "true") {
          request[key] = true;
        } else if (value === "false") {
          request[key] = false;
        }
      }
    }

    return this.sdk.query(request);
  }

  /**
   * Query the Kuzzle API and return a streamed response.
   * @param request The request to send to Kuzzle
   * @returns The response stream
   */
  public queryHttpStream(request: JSONObject): Promise<http.IncomingMessage> {
    // Ensure the protocol is HTTP
    if (this.protocol !== "http") {
      throw new TypeError(
        "HTTP streaming is only available with the HTTP protocol"
      );
    }

    // Construct the URL
    const url = `${this.ssl ? "https" : "http"}://${this.host}:${this.port
      }/_query`;

    // Construct the request
    const body = JSON.stringify(request);

    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "identity",
        Authorization: `Bearer ${this.sdk.jwt}`,
        Connection: "keep-alive",
        "Content-Length": Buffer.byteLength(body),
        "Content-Type": "application/json",
      },
    };

    // Send the request
    return new Promise((resolve, reject) => {
      const httpModule = this.ssl ? https : http;
      const req = httpModule.request(url, options, (res) => {
        resolve(res);
      });

      req.on("error", reject);

      req.write(body);
      req.end();
    });
  }

  get document() {
    return this.sdk.document;
  }

  get collection() {
    return this.sdk.collection;
  }

  get index() {
    return this.sdk.index;
  }

  get security() {
    return this.sdk.security;
  }

  get auth() {
    return this.sdk.auth;
  }

  get server() {
    return this.sdk.server;
  }

  get realtime() {
    return this.sdk.realtime;
  }

  get ms() {
    return this.sdk.ms;
  }
}
