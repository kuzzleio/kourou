import fs from "fs";
import * as readline from "readline";

import { cli } from "cli-ux";
import { flags } from "@oclif/command";
import chalk from "chalk";

import PaasLogin from "./login";
import { PaasKommand } from "../../support/PaasKommand";

/**
 * Data contained a PaaS log, as given by the API.
 */
type PaasLogData = {
  /**
   * Contents of the log.
   */
  content: string;

  /**
   * Timestamp of the log.
   */
  timeStamp: string;

  /**
   * Whether this is the last log of the stream.
   */
  last: boolean;

  /**
   * Name of the pod that generated the log.
   */
  podName: string;
};

class PaasLogs extends PaasKommand {
  public static description = "Show logs of the targeted application";

  public static flags = {
    follow: flags.boolean({
      char: "f",
      description: "Follow log output",
    }),
    timestamp: flags.boolean({
      char: "t",
      description: "Show timestamp",
    }),
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

  /**
   * Allowed colors for pod names.
   */
  private readonly allColors = [chalk.red, chalk.green, chalk.yellow, chalk.blue, chalk.magenta, chalk.cyan, chalk.gray];

  /**
   * Available colors for pod names.
   */
  private availableColors = [...this.allColors];

  /**
   * The color to use for pod names.
   * @private
   */
  private podsColor = new Map<string, chalk.Chalk>();

  async runSafe() {
    const apiKey = await this.getCredentials();

    await this.initPaasClient({ apiKey });

    const user = await this.paas.auth.getCurrentUser();
    this.logInfo(
      `Logged as "${user._id}" for project "${this.flags.project || this.getProject()
      }"`
    );

    const separator = "\t";

    // Perform the streamed request
    const incomingMessage = await this.paas.queryHttpStream({
      controller: "application",
      action: "logs",
      environmentId: this.args.environment,
      projectId: this.flags.project || this.getProject(),
      applicationId: this.args.application,
      follow: this.flags.follow,
    });

    // Read the response line by line
    const lineStream = readline.createInterface({
      input: incomingMessage,
      crlfDelay: Infinity,
      terminal: false,
    });

    // Display the response
    for await (const line of lineStream) {
      // Parse the data
      const data: PaasLogData = JSON.parse(line);

      // Exclude logs that are empty or that are not from a pod
      if (!data.content || !data.podName) {
        continue;
      }

      // Get the pod color
      const podColor = this.getPodColor(data.podName);

      // Display the log
      const timestamp = this.flags.timestamp ? `[${new Date(data.timeStamp).toLocaleString()}] ` : "";
      const name = podColor(`${data.podName}${separator}`);

      this.log(`${timestamp}${name}| ${data.content}`);
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

  /**
   * Returns the color to use for a pod name.
   * @param podName Name of the pod.
   * @returns The color to use.
   */
  getPodColor(podName: string): chalk.Chalk {
    // Attempt to get the color from the list
    let podColor = this.podsColor.get(podName);

    if (!podColor) {
      // Get a random color
      const index = Math.floor(Math.random() * this.availableColors.length);
      [podColor] = this.availableColors.splice(index, 1);

      this.podsColor.set(podName, podColor);

      // If all colors are used, reset the available colors
      if (this.availableColors.length === 0) {
        this.availableColors = [...this.allColors];
      }
    }

    return podColor;
  }
}

export default PaasLogs;
