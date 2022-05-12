import fs from 'fs';

import { flags } from '@oclif/command'
import cli from 'cli-ux'
import { ApiKey } from 'kuzzle-sdk';

import { PaasKommand } from '../../support/PaasKommand';

class PaasLogin extends PaasKommand {
  public static description = 'Login for a PaaS project';

  public static flags = {
    help: flags.help(),
    project: flags.string({
      description: 'Current PaaS project'
    }),
    username: flags.string({
      description: 'PaaS username',
    }),
  };

  async runSafe() {
    this.createKourouDir();

    const username = this.flags.username
      ? this.flags.username
      : await cli.prompt(`    Username`);

    const password = process.env.KUZZLE_PAAS_PASSWORD
      ? process.env.KUZZLE_PAAS_PASSWORD
      : await cli.prompt(`    Password`, { type: 'hide' });

    await this.initPaasClient({ username, password });

    const apiKey: ApiKey = await this.paas.auth.createApiKey('Kourou PaaS API Key');

    this.createProjectCredentials(apiKey);
  }

  createProjectCredentials(apiKey: ApiKey) {
    const project = this.getProject();
    const projectFile = this.fileProjectCredentials(project);
    const credentials = {
      apiKey: apiKey._source.token,
    };

    this.logInfo(`Saving credentials for project "${project}" in "${projectFile}".`);

    fs.writeFileSync(projectFile, JSON.stringify(credentials, null, 2));

    fs.chmodSync(projectFile, 0o600);
  }
}

export default PaasLogin
