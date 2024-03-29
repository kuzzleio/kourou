import * as readline from "readline";

import { flags } from "@oclif/command";
import chalk from "chalk";
import * as chrono from "chrono-node";

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
    tail: flags.integer({
      char: "n",
      description: "Number of lines to show from the end of the logs",
    }),
    podName: flags.string({
      description: "Name of the pod to show logs from",
    }),
    since: flags.string({
      description:
        "Display logs from a specific absolute (e.g. 2022/12/02 09:41) or relative (e.g. a minute ago) time",
    }),
    until: flags.string({
      description:
        "Display logs until a specific absolute (e.g. 2022/12/02 09:41) or relative (e.g. a minute ago) time",
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
  private readonly allColors = [
    chalk.red,
    chalk.green,
    chalk.yellow,
    chalk.blue,
    chalk.magenta,
    chalk.cyan,
    chalk.gray,
  ];

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

    // Parse the time arguments
    const since = this.flags.since
      ? chrono.parseDate(this.flags.since).toISOString()
      : undefined;
    const until = this.flags.until
      ? chrono.parseDate(this.flags.until).toISOString()
      : undefined;

    // Perform the streamed request
    const incomingMessage = await this.paas.queryHttpStream({
      controller: "application",
      action: "logs",
      environmentId: this.args.environment,
      projectId: this.flags.project || this.getProject(),
      applicationId: this.args.application,
      follow: this.flags.follow,
      tailLines: this.flags.tail,
      podName: this.flags.podName,
      since,
      until,
    });

    // Don't continue if an error occurred
    if (incomingMessage.statusCode !== 200) {
      return new Promise<void>((_, reject) => {
        // Collect the whole response body
        let responseBody = "";

        incomingMessage.on("data", (buffer) => {
          responseBody += buffer.toString();
        });

        incomingMessage.on("end", () => {
          let response;

          try {
            response = JSON.parse(responseBody);
          } catch (error: any) {
            reject(new Error("An error occurred while parsing the error response body from Kuzzle"));
            return;
          }

          reject(response.error);
        });
      });
    }

    // Read the response line by line
    const lineStream = readline.createInterface({
      input: incomingMessage,
      crlfDelay: Infinity,
      terminal: false,
    });

    // Display the response
    for await (const line of lineStream) {
      try {
        const data: PaasLogData = JSON.parse(line);

        // Exclude logs that are empty or that are not from a pod
        if (!data.content || !data.podName) {
          continue;
        }

        // Get the pod color
        const podColor = this.getPodColor(data.podName);

        // Display the log
        const timestamp = this.flags.timestamp
          ? `[${new Date(data.timeStamp).toLocaleString()}] `
          : "";
        const name = podColor(`${data.podName}${separator}`);

        this.log(`${timestamp}${name}| ${data.content}`);
      } catch (error) {
        this.logKo(`Error while parsing log: ${error} (Received: "${line}")`);
      }
    }
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
