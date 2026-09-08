import fs from "fs";
import path from "path";

import { Flags } from "@oclif/core";
import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";

export default class UserExportMappings extends Kommand {
  static description = "Exports users collection mappings to JSON.";

  static flags = {
    help: Flags.help({}),
    path: Flags.string({
      description: "Dump directory",
      default: "users",
    }),
    ...kuzzleFlags,
    protocol: Flags.string({
      description: "Kuzzle protocol (http or websocket)",
      default: "ws",
    }),
  };

  async runSafe() {
    const filename = path.join(
      this.flags.path,
      "users-collection-mappings.json",
    );

    this.logInfo(`Exporting users collection mappings in ${filename} ...`);

    fs.mkdirSync(this.flags.path, { recursive: true });

    const mapping = await this.sdk.security.getUserMapping();

    const dump = {
      type: "usersMappings",
      content: mapping,
    };

    fs.writeFileSync(filename, JSON.stringify(dump, null, 2));

    this.logOk("Users collection mappings dumped");
  }
}
