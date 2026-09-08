import { Args, Flags } from "@oclif/core";
import fs from "fs";

import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";

export default class UserImportMappings extends Kommand {
  static description = "Imports users collection mappings";

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
    this.logInfo(
      `Importing users collection mappings from ${this.args.path} ...`,
    );

    const dump = JSON.parse(fs.readFileSync(this.args.path, "utf-8"));

    const mapping = dump.content.mapping;

    await this.sdk.security.updateUserMapping({ properties: mapping });
    this.logOk("Users collecction mappings restored");
  }
}
