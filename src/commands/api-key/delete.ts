import { Args, Flags } from "@oclif/core";

import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";

class ApiKeyDelete extends Kommand {
  public static description = "Deletes an API key.";

  public static flags = {
    help: Flags.help(),
    ...kuzzleFlags,
  };

  static args = {
    user: Args.string({ description: "User kuid", required: true }),
    id: Args.string({ description: "API Key unique ID", required: true }),
  };

  static examples = ["kourou vault:delete sigfox-gateway 1k-BF3EBjsXdvA2PR8x"];

  async runSafe() {
    await this.sdk.security.deleteApiKey(this.args.user, this.args.id);

    this.logOk(
      `Successfully deleted API Key "${this.args.id}" of user "${this.args.user}"`,
    );
  }
}

export default ApiKeyDelete;
