import { flags } from "@oclif/command";

import { PaasKommand } from "../../support/PaasKommand";

class PaasDeploy extends PaasKommand {
  public static description =
    "Deploy a new version of the application in the PaaS";

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
      name: "image",
      description: "Image name and hash as myimage:mytag",
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

    const [image, tag] = this.args.image.split(":");
    this.logInfo(`Deploy application with image "${image}:${tag}"`);

    await this.paas.query({
      controller: "application",
      action: "deploy",
      environmentId: this.args.environment,
      projectId: this.flags.project || this.getProject(),
      applicationId: this.args.applicationId,
      body: {
        image: {
          name: image,
          tag,
        },
      },
    });

    this.logOk("Deployment in progress");
  }
}

export default PaasDeploy;
