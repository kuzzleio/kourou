import { Args, Flags, ux } from "@oclif/core";
import fs from "fs";
import path from "path";

import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";
import {
  dumpCollectionData,
  dumpCollectionMappings,
} from "../../support/dump-collection";

export default class IndexExport extends Kommand {
  static keepAuth = true;

  static description = "Exports an index (JSONL or Kuzzle format)";

  static flags = {
    help: Flags.help({}),
    path: Flags.string({
      description: "Dump root directory",
    }),
    "batch-size": Flags.string({
      description: "Maximum batch size (see limits.documentsFetchCount config)",
      default: "2000",
    }),
    query: Flags.string({
      description:
        "Only dump documents in collections matching the query (JS or JSON format)",
      default: "{}",
    }),
    format: Flags.string({
      description:
        '"jsonl or kuzzle - kuzzle will export in Kuzzle format usable for internal fixtures and jsonl allows to import that data back with kourou',
      default: "jsonl",
    }),
    scrollTTL: Flags.string({
      description: `The scroll TTL option to pass to the dump operation (which performs a document.search under the hood),
expressed in ms format, e.g. '2s', '1m', '3h'.`,
      default: "20s",
    }),
    ...kuzzleFlags,
    protocol: Flags.string({
      description: "Kuzzle protocol (http or websocket)",
      default: "ws",
    }),
    type: Flags.string({
      description: "Type of the export: all, mappings, data",
      default: "all",
    }),
  };

  static args = {
    index: Args.string({ description: "Index name", required: true }),
  };

  static examples = [
    "kourou index:export nyc-open-data",
    'kourou index:export nyc-open-data --query \'{"range":{"_kuzzle_info.createdAt":{"gt":1632935638866}}}\'',
  ];

  async runSafe() {
    const exportPath = this.flags.path
      ? path.join(this.flags.path, this.args.index)
      : this.args.index;

    const query = this.parseJs(this.flags.query);

    this.logInfo(
      `Dumping index "${this.args.index}" in ${exportPath}${path.sep} ...`,
    );

    fs.mkdirSync(exportPath, { recursive: true });

    const { collections } = await this.sdk.collection.list(this.args.index);

    for (const collection of collections) {
      try {
        if (collection.type === "realtime") {
          continue;
        }

        if (this.flags.type === "all" || this.flags.type === "mappings") {
          this.logInfo(`Dumping collection "${collection.name}" mappings ...`);
          await dumpCollectionMappings(
            this.sdk,
            this.args.index,
            collection.name,
            exportPath,
            this.flags.format,
          );
        }

        if (this.flags.type === "all" || this.flags.type === "data") {
          this.logInfo(`Dumping collection "${collection.name}" documents ...`);
          await dumpCollectionData(
            this.sdk,
            this.args.index,
            collection.name,
            Number(this.flags["batch-size"]),
            exportPath,
            query,
            this.flags.format,
            this.flags.scrollTTL,
          );
        }

        ux.action.stop();
      } catch (error: any) {
        this.logKo(
          `Error when exporting collection "${collection.name}": ${error}`,
        );
      }
    }

    this.logOk(`Index ${this.args.index} dumped`);
  }
}
