import fs from "fs";
import fetch from "node-fetch";

import { flags } from "@oclif/command";
import cli from "cli-ux";
import { ApiKey } from "kuzzle-sdk";

import { PaasKommand } from "../../support/PaasKommand";
import { spawnSync } from "child_process";

class PaasLogin extends PaasKommand {
  public static description = "Login for a PaaS project";

  public static flags = {
    help: flags.help(),
    project: flags.string({
      description: "Current PaaS project",
      required: false,
    }),
    username: flags.string({
      description: "PaaS username",
    }),
    only_npm: flags.boolean({
      description: "Only perform the login on the private NPM registry",
      required: false,
      default: false,
    }),
  };

  async runSafe() {
    this.createKourouDir();

    const username = this.flags.username
      ? this.flags.username
      : await cli.prompt(`    Username`);

    const password = process.env.KUZZLE_PAAS_PASSWORD
      ? process.env.KUZZLE_PAAS_PASSWORD
      : await cli.prompt(`    Password`, { type: "hide" });

    if (this.flags.only_npm) {
      await this.authenticateNPM(username, password);
      return;
    }

    await this.initPaasClient({ username, password });

    const apiKey: ApiKey = await this.paas.auth.createApiKey(
      "Kourou PaaS API Key"
    );

    this.createProjectCredentials(apiKey);
    await this.authenticateNPM(username, password);

    this.logOk(
      `Successfully logged in as ${username}. Your Kuzzle Enterprise license is now enabled on this host.`
    );
  }

  createProjectCredentials(apiKey: ApiKey) {
    const project = this.getProject();
    const projectFile = this.fileProjectCredentials(project);
    const credentials = {
      apiKey: apiKey._source.token,
    };

    this.logInfo(
      `Saving credentials for project "${project}" in "${projectFile}".`
    );

    fs.writeFileSync(projectFile, JSON.stringify(credentials, null, 2));

    fs.chmodSync(projectFile, 0o600);
  }

  async authenticateNPM(username: string, password: string) {
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          "base64"
        )}`,
      },
      body: JSON.stringify({
        name: username,
        password,
      }),
    };

    const response = await fetch(
      `https://packages.paas.kuzzle.io/-/user/org.couchdb.user:${username}`,
      options
    );
    const { token } = await response.json();

    spawnSync(
      "npm",
      [
        "config",
        "set",
        "@kuzzleio:registry",
        "https://packages.paas.kuzzle.io",
      ],
      { stdio: "inherit" }
    );
    spawnSync("npm", ["set", "//packages.paas.kuzzle.io/:_authToken", token], {
      stdio: "inherit",
    });
  }
}

export default PaasLogin;
