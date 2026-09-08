import { Args, Flags } from "@oclif/core";
import fs from "fs";

import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";
import { restoreProfiles } from "../../support/restore-securities";

export default class ProfileImport extends Kommand {
  static description = "Imports profiles";

  static flags = {
    help: Flags.help({}),
    ...kuzzleFlags,
    protocol: Flags.string({
      description: "Kuzzle protocol (http or websocket)",
      default: "ws",
    }),
  };

  static args = {
    path: Args.string({ description: "Dump file", required: true }),
  };

  async runSafe() {
    this.logInfo(`Importing profiles from ${this.args.path} ...`);

    const dump = JSON.parse(fs.readFileSync(this.args.path, "utf-8"));

    const count = await restoreProfiles(this, dump);

    this.logOk(`${count} profiles restored`);
  }
}
