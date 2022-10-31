import { flags } from "@oclif/command";
import { PaasKommand } from "../../support/PaasKommand";
import fs from "fs";
import PaasLogin from "./login";
import { cli } from "cli-ux";

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
      `Logged as "${user._id}" for project "${
        this.flags.project || this.getProject()
      }"`
    );

    const logs: any = await this.paas.query({
      controller: "application",
      action: "logs",
      environmentId: this.args.environment,
      projectId: this.flags.project || this.getProject(),
      applicationId: this.args.application,
    });

    this.logOk(logs.result.join("\n "));
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
}

export default PaasLogs;
