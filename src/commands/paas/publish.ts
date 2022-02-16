import path from 'path'
import fs from 'fs'

import { flags } from '@oclif/command'

import { Kommand } from '../../common'
import { kuzzleFlags, KuzzleSDK } from '../../support/kuzzle'

class PaasPublish extends Kommand {
  static initSdk = false;

  private host = 'api.console.kloud.kuzzle.io';
  private port = 443;
  private ssl = true;

  public static description = 'Deploy a new version of the application';

  public static flags = {
    help: flags.help(),
    token: flags.string({
      default: process.env.KUZZLE_PAAS_TOKEN,
      description: 'Authentication token'
    }),
    ...kuzzleFlags,
  };

  static args = [
    { name: 'project', description: 'Project name', required: true },
    { name: 'image', description: 'Image name and hash', required: true },
  ]

  async runSafe() {
    const paas = new KuzzleSDK({
      protocol: 'ws',
      host: this.host,
      port: this.port,
      ssl: this.ssl,
      apiKey: this.flags.token,
    })

    try {
      await paas.init(this);

      const user = await paas.auth.getCurrentUser();
      this.logInfo(`Logged as "${user._id}" for project "${this.args.project}`);

      const [image, tag] = this.args.image.split(':');
      this.logInfo(`Deploy application with image "${image}:${tag}"`)

      await paas.query({
        controller: 'github',
        action: 'updateImage',
        body: {
          namespace: this.args.project,
          image,
          tag,
        }
      });

      this.logOk('Deployment in progress');
    }
    catch (error: any) {
      this.logKo(error.message)
    }
  }
}

export default PaasPublish
