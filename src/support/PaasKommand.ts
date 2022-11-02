import fs from "fs";
import path from "path";

import { Kommand } from "../common";
import { KuzzleSDK } from "./kuzzle";

type PaaSClientCredentials =
  | { username: string; password: string }
  | { apiKey: string };

export class PaasKommand extends Kommand {
  static initSdk = false;

  protected host = process.env.KUZZLE_PAAS_HOST
    ? process.env.KUZZLE_PAAS_HOST
    : "console.paas.kuzzle.io";
  protected port = process.env.KUZZLE_PAAS_PORT
    ? parseInt(process.env.KUZZLE_PAAS_PORT as string)
    : 443;
  protected ssl = process.env.KUZZLE_PAAS_SSL
    ? JSON.parse(process.env.KUZZLE_PAAS_SSL as string)
    : true;

  // Instantiate a dummy SDK to avoid the this.paas? notation everywhere -_-
  protected paas = new KuzzleSDK({});

  async initPaasClient(credentials: PaaSClientCredentials) {
    this.paas = new KuzzleSDK({
      protocol: "http",
      host: this.host,
      port: this.port,
      ssl: this.ssl,
      ...credentials,
    });

    try {
      await this.paas.init(this);
    } catch (error: any) {
      if (error.id === "plugin.strategy.missing_user") {
        this.logKo("Incorrect username or password.");
        process.exit(1);
      }

      throw error;
    }
  }

  fileProjectCredentials(project: string) {
    return path.join(this.kourouDir, `${project}.paas.json`);
  }

  /**
   * Retrieve the current project name from the command line or current package.json
   */
  getProject() {
    const packageJsonPath = path.join(process.cwd(), "package.json");

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

      if (packageJson.kuzzle && packageJson.kuzzle.paas) {
        return packageJson.kuzzle.paas.project;
      }
    }

    if (!this.flags.project) {
      throw new Error(
        "Cannot find PaaS project in package.json or command line"
      );
    }

    return this.flags.project;
  }
}
