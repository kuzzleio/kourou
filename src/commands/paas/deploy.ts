import fs from 'fs'

import { flags } from '@oclif/command'
import cli from 'cli-ux'

import PaasLogin from './login'
import { PaasKommand } from '../../support/PaasKommand'

class PaasDeploy extends PaasKommand {
  public static description = 'Deploy a new version of the application in the PaaS';

  public static flags = {
    help: flags.help(),
    token: flags.string({
      default: process.env.KUZZLE_PAAS_TOKEN,
      description: 'Authentication token'
    }),
    project: flags.string({
      description: 'Current PaaS project',
    }),
  };

  static args = [
    { name: 'environment', description: 'Project environment name', required: true },
    { name: 'image', description: 'Image name and hash as myimage:mytag', required: true },
  ]

  async runSafe() {
    const apiKey = await this.getCredentials();

    await this.initPaasClient({ apiKey });

    const user = await this.paas.auth.getCurrentUser();
    this.logInfo(`Logged as "${user._id}" for project "${this.args.project}"`);

    const [image, tag] = this.args.image.split(':');
    this.logInfo(`Deploy application with image "${image}:${tag}"`)

    await this.paas.query({
      controller: 'application',
      action: 'deploy',
      environmentId: this.args.environment,
      projectName: this.flags.project || this.getProject(),
      applicationId: 'kuzzle',
      body: {
        image: {
          name: image,
          tag,
        },
      }
    });

    this.logOk('Deployment in progress');
  }

  async getCredentials() {
    const project = this.getProject();
    const projectFile = this.fileProjectCredentials(project);

    if (!fs.existsSync(projectFile)) {
      this.log('');
      const nextStep = await cli.prompt('Cannot find credentials for this project. Do you want to login first? [Y/N]', { type: 'single' })
      this.log('');

      if (nextStep.toLowerCase().startsWith('y')) {
        await PaasLogin.run(['--project', project]);
      }
      else {
        this.logKo('Aborting.');
        process.exit(1);
      }
    }

    const credentials = JSON.parse(fs.readFileSync(projectFile, 'utf8'));

    return credentials.apiKey;
  }
}

export default PaasDeploy
