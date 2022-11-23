import { cli } from "cli-ux";
import { flags } from "@oclif/command";
import chalk, { Chalk, ChalkFunction } from "chalk";
import fs from "fs";

import PaasLogin from "./login";
import { PaasKommand } from "../../support/PaasKommand";

class PaasLogs extends PaasKommand {
  public static description = "Show logs of the targeted application";

  public static flags = {
    help: flags.help(),
    project: flags.string({
      description: "Current PaaS project",
    }),
  };

  static args = [
    {
      name: "environment",
      description: "Kuzzle PaaS environment",
      required: true,
    },
    {
      name: "application",
      description: "Kuzzle PaaS application",
      required: true,
    },
  ];

  async runSafe() {
    const apiKey = await this.getCredentials();

    await this.initPaasClient({ apiKey });

    const user = await this.paas.auth.getCurrentUser();
    this.logInfo(
      `Logged as "${user._id}" for project "${this.flags.project || this.getProject()
      }"`
    );

    const logs: any = await this.paas.query({
      controller: "application",
      action: "logs",
      environmentId: this.args.environment,
      projectId: this.flags.project || this.getProject(),
      applicationId: this.args.application,
    });

    const separator = " ";
    const podNames = Object.keys(logs.result);

    for (const podName of podNames) {
      const log = logs.result[podName];
      const chalkColor = this.getRandomChalkColor();

      for (const line of log) {
        const spaces = this.getNumberOfSpaces(podNames, podName);
        const name = chalkColor(`${line.podName}${separator.repeat(spaces)}`);
        this.log(`${name}| ${line.content}`);
      }
    }
  }

  async getCredentials() {
    const project = this.getProject();
    const projectFile = this.fileProjectCredentials(project);

    if (!fs.existsSync(projectFile)) {
      this.log("");
      const nextStep = await cli.prompt(
        "Cannot find credentials for this project. Do you want to login first? [Y/N]",
        { type: "single" }
      );
      this.log("");

      if (nextStep.toLowerCase().startsWith("y")) {
        await PaasLogin.run(["--project", project]);
      } else {
        this.logKo("Aborting.");
        process.exit(1);
      }
    }

    const credentials = JSON.parse(fs.readFileSync(projectFile, "utf8"));

    return credentials.apiKey;
  }

  getNumberOfSpaces(names: string[], currentName: string) {
    const end = 10;
    let max = { name: '', length: 0 };

    for (const name of names) {
      if (max.length < name.length) {
        max = { name: name, length: name.length };
      }
    }

    return currentName === max.name ? end : end + (max.length - currentName.length);
  }

  getRandomChalkColor() {
    // Create an array of possible colors
    const color = ['green', 'blue', 'yellow', 'cyan'];
    const random = Math.floor(Math.random() * color.length);
    const key = color[random];

    switch (key) {
      case 'green':
        return chalk.green;
      case 'blue':
        return chalk.blue;
      case 'yellow':
        return chalk.yellow;
      case 'cyan':
        return chalk.cyan;
      default:
        return chalk.green;
    }
  }
}

export default PaasLogs;
