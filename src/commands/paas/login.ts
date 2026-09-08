import fs from "fs";

import { Flags } from "@oclif/core";
import inquirer from "inquirer";
import { ApiKey } from "kuzzle-sdk";

import { PaasKommand } from "../../support/PaasKommand";
import { spawnSync } from "child_process";

class PaasLogin extends PaasKommand {
  public static description = "Login for a PaaS project";

  public static flags = {
    help: Flags.help(),
    project: Flags.string({
      description: "Current PaaS project",
      required: false,
    }),
    username: Flags.string({
      description: "PaaS username",
    }),
    only_npm: Flags.boolean({
      description: "Only perform the login on the private NPM registry",
      required: false,
      default: false,
    }),
  };

  async runSafe() {
    this.createKourouDir();

    const username = this.flags.username
      ? this.flags.username
      : (
          await inquirer.prompt([
            { type: "input", name: "username", message: `    Username` },
          ])
        ).username;

    // "password" echoes nothing, which is what cli-ux's { type: "hide" } did
    const password = process.env.KUZZLE_PAAS_PASSWORD
      ? process.env.KUZZLE_PAAS_PASSWORD
      : (
          await inquirer.prompt([
            { type: "password", name: "password", message: `    Password` },
          ])
        ).password;

    if (this.flags.only_npm) {
      await this.authenticateNPM(username, password);
      return;
    }

    await this.initPaasClient({ username, password });

    await this.authenticateNPM(username, password);

    const apiKey: ApiKey = await this.paas.auth.createApiKey(
      "Kourou PaaS API Key",
    );

    this.createProjectCredentials(apiKey);

    this.logOk(
      `Successfully logged in as ${username}. Your Kuzzle Enterprise license is now enabled on this host.`,
    );
  }

  createProjectCredentials(apiKey: ApiKey) {
    const project = this.getProject();
    const projectFile = this.fileProjectCredentials(project);
    const credentials = {
      apiKey: apiKey._source.token,
    };

    this.logInfo(
      `Saving credentials for project "${project}" in "${projectFile}".`,
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
          "base64",
        )}`,
      },
      body: JSON.stringify({
        name: username,
        password,
      }),
    };

    const targetUrl = `https://${this.packagesHost}/-/user/org.couchdb.user:${username}`;
    const response = await fetch(targetUrl, options);
    const json = (await response.json()) as { error?: string; token?: string };

    if (response.status !== 201) {
      throw new Error(json.error);
    }

    const { token } = json;

    if (!token) {
      throw new Error(
        "The registry accepted the credentials but returned no authentication token",
      );
    }

    spawnSync(
      "npm",
      ["config", "set", "@kuzzleio:registry", `https://${this.packagesHost}`],
      { stdio: "inherit" },
    );
    spawnSync("npm", ["set", `//${this.packagesHost}/:_authToken`, token], {
      stdio: "inherit",
    });
  }
}

export default PaasLogin;
