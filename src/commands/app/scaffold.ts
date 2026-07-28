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
      description: `Template flavor ("generic", "iot", "hypervision").`,
    }),
    token: flags.string({
      description: `GitHub token used to clone private template repositories.
    Defaults to the GITHUB_TOKEN environment variable, then to the GitHub CLI credentials.`,
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
        `cd ${destination} && docker compose up -d`,
      )} to start your Kuzzle stack.`,
    );
  }

  getRepo(flavor: string) {
    switch (flavor) {
      case "generic":
        return "template-kuzzle-project";
      case "iot":
        return "template-kiotp-project";
      case "hypervision":
        return "template-hypervision-project";
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

  /**
   * Returns a GitHub token allowing to clone private template repositories,
   * or undefined if none can be found.
   *
   * Looked up in the --token flag, then in the usual environment variables,
   * then in the GitHub CLI credentials.
   */
  async getToken(): Promise<string | undefined> {
    const token =
      this.flags.token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    if (token) {
      return token;
    }

    try {
      const { stdout } = await execute("gh", "auth", "token");

      return stdout.trim() || undefined;
    } catch (error) {
      // GitHub CLI is not installed or not authenticated
      return undefined;
    }
  }

  /**
   * Returns the URLs to try to clone the template repository from, in order.
   *
   * Some templates are hosted in private repositories, so we need credentials:
   * either a token, or the SSH key of the user.
   */
  async getCloneUrls(repo: string): Promise<string[]> {
    const urls = [];
    const token = await this.getToken();

    if (token) {
      urls.push(`https://x-access-token:${token}@github.com/kuzzleio/${repo}`);
    }

    urls.push(`git@github.com:kuzzleio/${repo}`);
    urls.push(`https://github.com/kuzzleio/${repo}`);

    return urls;
  }

  /**
   * Removes any token from a string before displaying it.
   */
  hideToken(message: string) {
    return message.replace(/x-access-token:[^@]*@/g, "x-access-token:***@");
  }

  async cloneTemplate(flavor: string) {
    const repo = this.getRepo(flavor);
    const urls = await this.getCloneUrls(repo);
    let lastError: any;

    for (const url of urls) {
      try {
        await execute(
          "git",
          "clone",
          "--depth=1",
          url,
          "--branch",
          "stable",
          "--single-branch",
          this.templatesDir,
          {
            env: {
              ...process.env,
              // Never prompt for credentials, we want to fail fast and try
              // the next URL instead of hanging on a password prompt
              GIT_TERMINAL_PROMPT: "0",
              GIT_SSH_COMMAND:
                process.env.GIT_SSH_COMMAND ||
                "ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new",
            },
          },
        );

        return;
      } catch (error: any) {
        // Clone failed (e.g. the repository is private and those credentials
        // are not allowed to read it), let's try the next URL
        lastError = error;
        await execute("rm", "-rf", this.templatesDir);
      }
    }

    throw new Error(
      `Unable to clone the template repository "kuzzleio/${repo}". ` +
        "If this repository is private, provide credentials with the --token flag, " +
        "the GITHUB_TOKEN environment variable, the GitHub CLI (gh auth login) " +
        `or a SSH key allowed to read it.\n${this.hideToken(
          lastError?.message || "",
        )}`,
    );
  }

  async copyTemplate(destination: string) {
    // -R (and not -r) so symlinks contained in the template are copied as
    // symlinks instead of being dereferenced (BSD cp -r follows them and fails
    // on dangling symlinks)
    await execute("cp", "-R", `${this.templatesDir}/`, `${destination}/`);
  }

  async cleanup(destination: string) {
    await execute("rm", "-rf", this.templatesDir);
    await execute("rm", "-rf", `${destination}/.git`);
  }
}
