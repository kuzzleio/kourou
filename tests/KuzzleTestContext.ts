import {Http, Kuzzle, WebSocket} from "kuzzle-sdk";
import {testMappings} from "./fixtures/mappings";
import {testFixtures} from "./fixtures/fixtures";
import {testSecurities} from "./fixtures/securities";

type KuzzleTestOptions = {
  host: string;
  port: number;
  protocol: string;
  ssl: boolean;
};

type LoginCredentials = {
  apikey?: string;
  username?: string;
  password?: string;
};

/**
 * A Kuzzle SDK wrapper dedicated only for Jest Tests.
 * Provide some functions to reset data/users/mappings and login.
 */
export class KuzzleTestContext {
  public sdk: Kuzzle;

  private host: string;

  private port: number;

  private protocol: string;

  private ssl: boolean;

  constructor(opts: KuzzleTestOptions = {
    host: "localhost",
    port: 7512,
    protocol: "websocket",
    ssl: false,
  }) {
    this.host = opts.host;
    this.port = opts.port;
    this.protocol = opts.protocol;
    this.ssl = opts.ssl;

    let protocol;
    const options = {
      port: opts.port,
      sslConnection: opts.ssl,
      pingInterval: 20 * 1000,
    };
    switch (opts.protocol) {
      case "http":
        protocol = new Http(this.host, options);
        break;
      case "websocket":
        protocol = new WebSocket(this.host, options);
        break;
      default:
        throw new Error(`Unknown protocol "${this.protocol}".`);
    }
    this.sdk = new Kuzzle(protocol);
  }

  async connect() {
    await this.sdk.connect();
  }

  disconnect() {
    this.sdk.disconnect();
  }

  async login(credentials: LoginCredentials) {
    if (credentials.apikey) {
      this.sdk.jwt = credentials.apikey;
    } else if (credentials.username !== "anonymous") {
      const creds = {
        username: credentials.username,
        password: credentials.password,
      };
      await this.auth.login("local", creds, "90s");
    }
  }

  async resetSecurity() {
    await this.sdk.query({
      controller: "admin",
      action: "resetSecurity",
      refresh: "wait_for",
    });

    await this.sdk.query({
      controller: "admin",
      action: "loadSecurities",
      body: testSecurities,
      refresh: "wait_for",
      onExistingUsers: "overwrite",
    });
  }

  async resetDatabase() {
    await this.login({
      username: "test-admin",
      password: "password",
    })

    await this.sdk.query({
      controller: "admin",
      action: "resetDatabase",
      refresh: "wait_for",
    });
  }

  async resetMappings() {
    await this.sdk.query({
      controller: "admin",
      action: "loadMappings",
      body: testMappings,
      refresh: "wait_for",
    });

    await this.sdk.query({
      controller: "admin",
      action: "loadFixtures",
      body: testFixtures,
      refresh: "wait_for",
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
