import { flags } from "@oclif/command";
import inquirer from "inquirer";

import { Kommand } from "../../common";
import { execute } from "../../support/execute";

export class InstanceLogs extends Kommand {
  static initSdk = false;

  static description = "Displays the logs of a running Kuzzle";

  static flags = {
    instance: flags.string({
      char: "i",
      description: "Kuzzle instance name",
    }),
    follow: flags.boolean({
      char: "f",
      description: "Follow log output",
    }),
  };

  async runSafe() {
    let instance: string = this.flags.instance;
    const followOption: boolean = this.flags.follow;

    if (!instance) {
      const instancesList = await this.getInstancesList();
      if (instancesList.length === 0) {
        throw new Error("There are no Kuzzle running instances");
      }

      const responses: any = await inquirer.prompt([
        {
          name: "instance",
          message: "On which kuzzle instance do you want to see the logs",
          type: "list",
          choices: instancesList,
        },
      ]);

      if (!responses.instance) {
        throw new Error("A running Kuzzle instance must be selected.");
      }

      instance = responses.instance;
    }

    await this.showInstanceLogs(instance, followOption);
  }

  private async showInstanceLogs(instanceName: string, followOption: boolean) {
    const args = ["logs", instanceName];
    if (followOption) {
      args.push("-f");
    }

    const instanceLogs = execute("docker", ...args);

    instanceLogs.process.stdout?.pipe(process.stdout);
    instanceLogs.process.stderr?.pipe(process.stderr);

    await instanceLogs;
  }

  private async getInstancesList(): Promise<string[]> {
    let containersListProcess;

    try {
      containersListProcess = await execute(
        "docker",
        "ps",
        "--format",
        '"{{.Names}}"'
      );
    } catch {
      this.warn(
        "Something went wrong while getting kuzzle running instances list"
      );
      return [];
    }

    const containersList: string[] = containersListProcess.stdout
      .replace(/"/g, "")
      .split("\n");

    return containersList.filter(
      (containerName) =>
        containerName.includes("kuzzle") &&
        !containerName.includes("redis") &&
        !containerName.includes("elasticsearch")
    );
  }
}
