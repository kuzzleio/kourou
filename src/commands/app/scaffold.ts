import { flags } from "@oclif/command";
import chalk from "chalk";
import Listr from "listr";

import { Kommand } from "../../common";
import { execute } from "../../support/execute";

export default class AppScaffold extends Kommand {
  public templatesDir = "/tmp/kuzzle-templates";
  static initSdk = false;

  static description = "Scaffolds a new Kuzzle application";

  static flags = {
    help: flags.help(),
    flavor: flags.string({
      default: "generic",
      description: `Template flavor ("generic", "iot").`,
    }),
  };

  static args = [
    {
      name: "destination",
      description: "Directory to scaffold the app",
      required: true,
    },
  ];

  async runSafe() {
    const destination = this.args.destination;
    const flavor = this.flags.flavor;

    const tasks = new Listr([
      {
        title: "Checking destination",
        task: async () => this.checkDestination(destination),
      },
      {
        title: "Prepare temporary folder",
        task: async () => this.prepareTemplate(),
      },
      {
        title: "Cloning template repository",
        task: async () => this.cloneTemplate(flavor),
      },
      {
        title: "Copying template files",
        task: async () => this.copyTemplate(destination),
      },
      {
        title: "Cleaning up",
        task: async () => this.cleanup(destination),
      },
    ]);

    await tasks.run();
    this.log("");
    this.logOk(`Scaffolding complete!`);
    this.logOk(
      `Use ${chalk.blue.bold(
        `cd ${destination} && docker compose up -d`
      )} to start your Kuzzle stack.`
    );
  }

  getRepo(flavor: string) {
    switch (flavor) {
      case "generic":
        return "template-kuzzle-project";
      case "iot":
        return "template-kiotp-project";
      default:
        return "template-kuzzle-project";
    }
  }

  async checkDestination(destination: string) {
    let process: any;

    try {
      process = await execute("test", "-d", destination);
    } catch (error: any) {
      if (error.result.exitCode === 1) {
        // Destination directory does not exist
        return;
      }
    }

    if (process.exitCode === 0) {
      throw new Error(`Destination directory ${destination} already exists.`);
    }
  }

  async prepareTemplate() {
    await execute("rm", "-rf", this.templatesDir);
  }

  async cloneTemplate(flavor: string) {
    const repo = this.getRepo(flavor);

    await execute(
      "git",
      "clone",
      "--depth=1",
      `https://github.com/kuzzleio/${repo}`,
      "--branch",
      "main",
      "--single-branch",
      this.templatesDir
    );
  }

  async copyTemplate(destination: string) {
    await execute("cp", "-r", `${this.templatesDir}/`, `${destination}/`);
  }

  async cleanup(destination: string) {
    await execute("rm", "-rf", this.templatesDir);
    await execute("rm", "-rf", `${destination}/.git`);
  }
}
