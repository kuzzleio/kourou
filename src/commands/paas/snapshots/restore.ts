import { flags } from "@oclif/command";

import { PaasKommand } from "../../../support/PaasKommand";

class PaasSnapshotsRestore extends PaasKommand {
  public static description =
    "List all snapshots for a given kuzzle application in a environment";

  public static flags = {
    help: flags.help(),
    token: flags.string({
      default: process.env.KUZZLE_PAAS_TOKEN,
      description: "Authentication token",
    }),
    project: flags.string({
      description: "Current PaaS project",
    }),
  };

  static args = [
    {
      name: "environment",
      description: "Project environment name",
      required: true,
    },
    {
      name: "applicationId",
      description: "Application Identifier",
      required: true,
    },
    {
      name: "snapshotId",
      description: "Snapshot Identifier",
      required: true,
    }
  ];

  async runSafe() {
    const apiKey = await this.getCredentials();

    await this.initPaasClient({ apiKey });

    const user = await this.paas.auth.getCurrentUser();
    this.logInfo(
      `Logged as "${user._id}" for project "${this.flags.project || this.getProject()
      }"`
    );


    await this.paas.query({
      controller: "application",
      action: "restore",
      environmentId: this.args.environment,
      projectId: this.flags.project || this.getProject(),
      applicationId: this.args.applicationId,
      body: {
        repository: "automated",
        snapshot: this.args.snapshotId,
      },
    });

    this.logInfo("Ok");
  }
}

export default PaasSnapshotsRestore;
