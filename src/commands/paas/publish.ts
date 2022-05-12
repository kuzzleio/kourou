import fs from 'fs'

import { flags } from '@oclif/command'
import cli from 'cli-ux'

import PaasLogin from './login'
import { PaasKommand } from '../../support/PaasKommand'

class PaasPublish extends PaasKommand {
  public static description = 'Deploy a new version of the application in the PaaS';

  public static flags = {
    help: flags.help(),
    token: flags.string({
      default: process.env.KUZZLE_PAAS_TOKEN,
      description: 'Authentication token'
    }),
    namespace: flags.string({
      description: 'Current PaaS namespace'
    }),
  };

  static args = [
    { name: 'project', description: 'Project name', required: true },
    { name: 'image', description: 'Image name and hash', required: true },
  ]

  async runSafe() {
    const apiKey = await this.getCredentials();

    await this.initPaasClient({ apiKey });

    const user = await this.paas.auth.getCurrentUser();
    this.logInfo(`Logged as "${user._id}" for project "${this.args.project}"`);

    const [image, tag] = this.args.image.split(':');
    this.logInfo(`Deploy application with image "${image}:${tag}"`)

    await this.paas.query({
      controller: 'config',
      action: 'updateImage',
      body: {
        namespace: this.args.project,
        image,
        tag,
      }
    });

    this.logOk('Deployment in progress');
  }

  async getCredentials() {
    const namespace = this.getProject();
    const namespaceFile = this.fileProjectCredentials(namespace);

    if (!fs.existsSync(namespaceFile)) {
      this.log('');
      const nextStep = await cli.prompt('Cannot find credentials for this namespace. Do you want to login first? [Y/N]', { type: 'single' })
      this.log('');

      if (nextStep.toLowerCase().startsWith('y')) {
        await PaasLogin.run(['--namespace', namespace]);
      }
      else {
        this.logKo('Aborting.');
        process.exit(1);
      }
    }

    const credentials = JSON.parse(fs.readFileSync(namespaceFile, 'utf8'));

    return credentials.apiKey;
  }
}

export default PaasPublish
