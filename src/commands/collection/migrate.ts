import path from "path";
import fs from "fs";

import { flags } from "@oclif/command";

import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";
import { restoreCollectionData } from "../../support/restore-collection";
import { JSONObject } from "kuzzle-sdk";

export default class CollectionMigrate extends Kommand {
  static keepAuth = true;

  static description = "Migrate a collection by transforming documents from a dump file and importing them into Kuzzle";

  static flags = {
    help: flags.help({}),
    "batch-size": flags.string({
      description: "Maximum batch size (see limits.documentsWriteCount config)",
      default: "200",
    }),
    index: flags.string({
      description: "If set, override the index destination name",
    }),
    collection: flags.string({
      description: "If set, override the collection destination name",
    }),
    ...kuzzleFlags,
    protocol: flags.string({
      description: "Kuzzle protocol (http or websocket)",
      default: "ws",
    }),
  };

  static args = [
    { name: "script", description: "Migration script path", required: true },
    { name: "path", description: "Collection dump path", required: true },
  ];

  async runSafe() {
    this.logInfo(`Start migration documents with ${this.args.script} from ${this.args.path}`);

    const migrateDocument = this.getMigrationFunction();

    const { index, collection, total } = await restoreCollectionData(
      this.sdk,
      this.log.bind(this),
      Number(this.flags["batch-size"]),
      path.join(this.args.path, "documents.jsonl"),
      this.flags.index,
      this.flags.collection,
      migrateDocument
    );

    this.logOk(
      `Successfully migrated ${total} documents from "${this.args.path}" in "${index}:${collection}"`
    );
  }

  private getMigrationFunction(): (document: JSONObject) => JSONObject {
    const migrationScript = fs.readFileSync(this.args.script, "utf8");

    let migrationFunction;
    {
      migrationFunction = eval(`var f = ${migrationScript}; f`);
    }

    return migrationFunction;
  }
}
