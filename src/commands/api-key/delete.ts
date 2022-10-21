import { flags } from "@oclif/command";

import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";

class ApiKeyDelete extends Kommand {
  public static description = "Deletes an API key.";

  public static flags = {
    help: flags.help(),
    ...kuzzleFlags,
  };

  static args = [
    { name: "user", description: "User kuid", required: true },
    { name: "id", description: "API Key unique ID", required: true },
  ];

  static examples = ["kourou vault:delete sigfox-gateway 1k-BF3EBjsXdvA2PR8x"];

  async runSafe() {
    await this.sdk.security.deleteApiKey(this.args.user, this.args.id);

    this.logOk(
      `Successfully deleted API Key "${this.args.id}" of user "${this.args.user}"`
    );
  }
}

export default ApiKeyDelete;
