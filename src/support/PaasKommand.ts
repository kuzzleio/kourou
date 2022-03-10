import fs from 'fs';
import path from 'path';

import { Kommand } from '../common';
import { KuzzleSDK } from './kuzzle';

type PaaSClientCredentials = { username: string, password: string } | { apiKey: string };

export class PaasKommand extends Kommand {
  static initSdk = false;

  protected host = 'api.console.paas.kuzzle.io';
  protected port = 443;
  protected ssl = true;

  // Instantiate a dummy SDK to avoid the this.paas? notation everywhere -_-
  protected paas = new KuzzleSDK({});

  async initPaasClient(credentials: PaaSClientCredentials) {
    this.paas = new KuzzleSDK({
      protocol: 'http',
      host: this.host,
      port: this.port,
      ssl: this.ssl,
      ...credentials
    });

    try {
      await this.paas.init(this);
    }
    catch (error: any) {
      if (error.id === 'plugin.strategy.missing_user') {
        this.logKo('Incorrect username or password.');
        process.exit(1);
      }

      throw error;
    }
  }

  fileNamespaceCredentials(namespace: string) {
    return path.join(this.kourouDir, `${namespace}.paas.json`);
  }

  /**
   * Retrieve the current namespace name from the command line or current package.json
   */
  getNamespace() {
    const packageJsonPath = path.join(process.cwd(), 'package.json')

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      if (packageJson.kuzzle && packageJson.kuzzle.paas) {
        return packageJson.kuzzle.paas.namespace;
      }
    }

    if (!this.flags.namespace) {
      throw new Error('Cannot find PaaS namespace in package.json or command line');
    }

    return this.flags.namespace;
  }
}