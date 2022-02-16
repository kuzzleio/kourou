import path from 'path'
import fs from 'fs'

import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'

class PaasLogin extends Kommand {
  static disableLog = true;
  static initSdk = false;

  private host = 'api.console.kloud.kuzzle.io';
  private port = 443;
  private ssl = true;

  public static description = 'Login for the current project';

  public static flags = {
    help: flags.help(),
    ...kuzzleFlags,
  };

  static args = [
    { name: 'username', description: 'PaaS username', required: true },
    { name: 'password', description: 'PaaS password', required: true },
  ]

  async runSafe() {
    const paas = new KuzzleSDK({
      protocol: 'http',
      host: this.host,
      port: this.port,
      ssl: this.ssl,
      username: this.args.username,
      password: this.args.password,
      ttl: '1d'
    })

    try {
      await paas.init(this);

      console.log('# Execute this to automatically export credentials: $(kourou auth:login <username> <password>)')
      console.log('# or just copy the following line in your terminal:')
      console.log(`export KUZZLE_PAAS_TOKEN=${paas.sdk.jwt}`)
    }
    catch (error: any) {
      console.error(error.message);
    }
  }
}

export default PaasLogin
