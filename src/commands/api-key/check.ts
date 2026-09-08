import { Args, Flags } from "@oclif/core";

import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";

class ApiKeyCheck extends Kommand {
  public static description = "Checks an API key validity";

  public static flags = {
    help: Flags.help(),
    ...kuzzleFlags,
  };

  static args = {
    token: Args.string({ description: "API key token", required: true }),
  };

  static examples = ["kourou api-key:check eyJhbG...QxfQrc"];

  async runSafe() {
    const { valid } = await this.sdk.auth.checkToken(this.args.token);

    if (valid) {
      this.logOk("API key is still valid");
    } else {
      this.logKo("API key is not valid");
    }
  }
}

export default ApiKeyCheck;
