import { flags } from "@oclif/command";

import { PaasKommand } from "../../../support/PaasKommand";

class PaasSnapshotsRestore extends PaasKommand {
  public static description =
    "Restore a snapshot of the current application state";

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

  static examples = ["kourou paas:snapshots:restore --project paas-project-myproject api main snapshot-id"];

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
      snapshotId: this.args.snapshotId
    });

    this.logOk("Your snapshot is being restored.");
  }
}

export default PaasSnapshotsRestore;
