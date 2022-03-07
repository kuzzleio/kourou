import fs from 'fs';
import path from 'path';

import { flags } from '@oclif/command'
import cli from 'cli-ux'
import { ApiKey } from 'kuzzle-sdk';

import { PaasKommand } from '../../support/PaasKommand';

class PaasLogin extends PaasKommand {
  public static description = 'Login for a PaaS namespace';

  public static flags = {
    help: flags.help(),
    namespace: flags.string({
      description: 'Current PaaS namespace'
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

    this.createNamespaceCredentials(apiKey);
  }

  createNamespaceCredentials(apiKey: ApiKey) {
    const namespace = this.getNamespace();
    const namespaceFile = this.fileNamespaceCredentials(namespace);
    const credentials = {
      apiKey: apiKey._source.token,
    };

    this.logInfo(`Saving credentials for namespace "${namespace}" in "${namespaceFile}".`);

    fs.writeFileSync(namespaceFile, JSON.stringify(credentials, null, 2));

    fs.chmodSync(namespaceFile, 0o600);
  }
}

export default PaasLogin
