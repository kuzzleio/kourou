import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'
import http from 'http';
import { JSONObject } from 'kuzzle-sdk';
import WebSocket from 'ws';

// Add the proper headers and send the body in the response
function sendResponse(response: http.ServerResponse, bodyObject: JSONObject) {
  response.setHeader('Content-Type', 'application/json; charset=UTF-8');
  response.setHeader('Cache-Control', 'no-cache');
  const body = JSON.stringify(bodyObject);
  response.setHeader('Content-Length', Buffer.byteLength(body));
  response.writeHead(200);
  response.end(body);
}

export default class DebugProxy extends Kommand {
  public static description = 'Create a Proxy Server that allows Chrome to debug Kuzzle remotely using the DebugController';

  public static flags = {
    help: flags.help(),
    forwardPort: flags.integer({
      description: 'Port of the forwarding server',
      default: 9222
    }),
    nonoAutoEnableDebugger: flags.boolean({
      description: 'True if Kourou should not enable and disable the Debugger automatically before and after usage',
      default: true
    }),
    showDebuggerEvents: flags.boolean({
      description: 'Verbose mode to display events sent to the Chrome Debugger',
      default: false,
    }),
    showDebuggerPayloads: flags.boolean({
      description: 'Verbose mode to display payloads sent by and to the Chrome Debugger',
      default: false,
    }),
    ...kuzzleFlags,
  };

  // Force the usage of Websocket otherwise each request might end up executed on a different Kuzzle Node
  public static sdkOptions = {
    protocol: 'ws'
  };

  async runSafe() {

    const nodeVersionResponse = await this.sdk.query({
      controller: 'debug',
      action: 'nodeVersion'
    }) as JSONObject;

    this.logInfo(`Connected to Kuzzle node: ${nodeVersionResponse.node}`);

    /**
     * To allow the Chrome Debugger to see the proxy server we must implement the following routes:
     * - /json/version
     * - /json
     */
    const server = http.createServer((request, response) => {
      if (request.url === '/json/version') {
        sendResponse(response, {
          Browser: `node.js/${nodeVersionResponse.result}`,
          "Protocol-Version": "1.1"
        });
        return;
      } else if (request.url === '/json') {
        // Here we send a bunch of information about the Remote Target to the Chrome Debugger
        // Those are the informations that the Chrome Debugger uses to know how to connect to Remote Target
        // We give the Chrome Inspector our own Websocket endpoint so that it can connect to our proxy server
        sendResponse(response, [{
          description: 'node.js instance',
          devtoolsFrontendUrl: `devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&ws=${request.headers.host}/kuzzle-debugger`,
          devtoolsFrontendUrlCompat: `devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${request.headers.host}/kuzzle-debugger`,
          faviconUrl: 'https://nodejs.org/static/images/favicons/favicon.ico',
          id: 'kuzzle-debugger',
          title: `Kuzzle Debugger - ${this.flags.host}:${this.flags.port}`,
          type: 'node',
          webSocketDebuggerUrl: `ws://${request.headers.host}/kuzzle-debugger`
        }]);
        return;
      }
      response.writeHead(404);
    });

    const closeServer = async () => {
      this.logInfo('Connection closed.');

      if (!this.flags.noAutoEnableDebugger) {
        await this.sdk.query({
          controller: 'debug',
          action: 'disable'
        });
      }

      this.sdk.disconnect();
      server.close();
    }

    const wss = new WebSocket.Server({
      server
    });

    if (!this.flags.noAutoEnableDebugger) {
      await this.sdk.query({
        controller: 'debug',
        action: 'enable'
      });
    }

    // Listen to all events emitted by the Debug Controller
    await this.sdk.query({
      controller: 'debug',
      action: 'addListener',
      body: {
        event: '*'
      }
    });

    wss.on('connection', ws => {
      this.logInfo('Connection established.');

      /**
       * Listen to the room were events from the DebugController are sent
       * and only forward events from the Chrome  Devtools Protocol
       */
      this.sdk.sdk.protocol.on('kuzzle-debugger-event', (payload: JSONObject) => {
        if (!payload.event || payload.event.startsWith('Kuzzle')) {
          return;
        }
        if (this.flags.showDebuggerEvents) {
          this.logInfo(JSON.stringify(payload.result, null, 2));
        }
        ws.send(JSON.stringify(payload.result));
      });

      // When receiving message from Chrome Devtools Protocol, we forward it to the DebugController
      ws.on('message', async message => {
        try {
          const json = JSON.parse(message.toString());

          if (json.id === undefined || json.method === undefined) {
            return;
          }


          if (this.flags.showDebuggerPayloads) {
            this.logInfo(JSON.stringify({
              method: json.method,
              params: json.params,
            }, null, 2));
          }

          const response = await this.sdk.query({
            controller: 'debug',
            action: 'post',
            body: {
              method: json.method,
              params: json.params,
            }
          });

          if (this.flags.showDebuggerPayloads) {
            this.logInfo(JSON.stringify({
              id: json.id,
              result: response.result
            }, null, 2));
          }

          // Send back the response using the same ID received
          ws.send(JSON.stringify({
            id: json.id,
            result: response.result
          }));
        } catch (e) {
          this.logKo(`${e}`);
        }
      });

      ws.on('close', closeServer);
    });

    server.on('error', async err => {
      this.logKo(err.message);
      this.logKo(err.stack);

      await closeServer();
    });

    server.listen(this.flags.forwardPort, () => {
      this.logOk(`Listening on port ${this.flags.forwardPort}, forwarding to Kuzzle at ${this.flags.host}:${this.flags.port}`);
      this.logInfo(`Showing to Chrome Debugger as "Kuzzle Debugger - ${this.flags.host}:${this.flags.port}"`)
      this.logInfo('Waiting for Chrome Debugger to connect...');
    });

    let resolve: () => void;
    const promise = new Promise<void>(res => {
      resolve = res;
    });

    server.on('close', () => {
      resolve();
    });

    await promise;
  }
}