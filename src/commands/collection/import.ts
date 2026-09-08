import path from "path";
import fs from "fs";

import { Args, Flags } from "@oclif/core";
import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";
import {
  restoreCollectionData,
  restoreCollectionMappings,
} from "../../support/restore-collection";

export default class CollectionImport extends Kommand {
  static keepAuth = true;

  static description = "Imports a collection";

  static flags = {
    help: Flags.help({}),
    "batch-size": Flags.string({
      description: "Maximum batch size (see limits.documentsWriteCount config)",
      default: "200",
    }),
    index: Flags.string({
      description: "If set, override the index destination name",
    }),
    collection: Flags.string({
      description: "If set, override the collection destination name",
    }),
    "no-mappings": Flags.boolean({
      description: "Skip collection mappings",
    }),
    ...kuzzleFlags,
    protocol: Flags.string({
      description: "Kuzzle protocol (http or websocket)",
      default: "ws",
    }),
  };

  static args = {
    path: Args.string({ description: "Dump directory path", required: true }),
  };

  async runSafe() {
    this.logInfo(`Start importing dump from ${this.args.path}`);

    if (!this.flags["no-mappings"]) {
      const mappingsPath = path.join(this.args.path, "mappings.json");
      const dump = JSON.parse(fs.readFileSync(mappingsPath, "utf8"));

      await restoreCollectionMappings(
        this.sdk,
        dump,
        this.flags.index,
        this.flags.collection,
      );
    }

    const { index, collection, total } = await restoreCollectionData(
      this.sdk,
      this.log.bind(this),
      Number(this.flags["batch-size"]),
      path.join(this.args.path, "documents.jsonl"),
      this.flags.index,
      this.flags.collection,
    );

    this.logOk(
      `Successfully imported ${total} documents from "${this.args.path}" in "${index}:${collection}"`,
    );
  }
}
