import fs from "fs";

import { flags } from "@oclif/command";
import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";
import { restoreRoles } from "../../support/restore-securities";
export default class RoleImport extends Kommand {
  static description = "Import roles";

  static flags = {
    "preserve-anonymous": flags.boolean({
      description: "Preserve anonymous rights",
      default: false,
    }),
    help: flags.help({}),
    ...kuzzleFlags,
    protocol: flags.string({
      description: "Kuzzle protocol (http or websocket)",
      default: "ws",
    }),
  };

  static args = [{ name: "path", description: "Dump file", required: true }];

  async runSafe() {
    this.logInfo(`Importing roles from ${this.args.path} ...`);

    const dump = JSON.parse(fs.readFileSync(this.args.path, "utf-8"));

    const count = await restoreRoles(
      this,
      dump,
      this.flags["preserve-anonymous"]
    );

    this.logOk(`${count} roles restored`);
  }
}
