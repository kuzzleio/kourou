import { flags } from "@oclif/command";
import fs from "fs";
import path from "path";

import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";
import {
  dumpCollectionData,
  dumpCollectionMappings,
} from "../../support/dump-collection";

export default class ExportCollection extends Kommand {
  static keepAuth = true;
  static description = "Exports a collection (JSONL format)";

  static flags = {
    help: flags.help({}),
    path: flags.string({
      description: "Dump root directory",
    }),
    "batch-size": flags.string({
      description: "Maximum batch size (see limits.documentsFetchCount config)",
      default: "2000",
    }),
    query: flags.string({
      description: "Only dump documents matching the query (JS or JSON format)",
      default: "{}",
    }),
    editor: flags.boolean({
      description:
        "Open an editor (EDITOR env variable) to edit the query before sending",
    }),
    format: flags.string({
      description: `"kuzzle" will export in Kuzzle format usable for internal fixtures,
"jsonl" allows to import that data back with kourou,
"csv" allows to import data into Excel (please, specify the fields to export using the --fields option).`,
      options: ["jsonl", "kuzzle", "csv"],
      default: "jsonl",
    }),
    fields: flags.string({
      description: `[CSV format only] The list of fields to be included in the CSV export in dot-path format.

Example:
--fields oneField,anotherField,yetAnotherOne.nested.moarNested

Note that the '_id' field is always included in the CSV export. Leaving this option empty implies that all
exportable fields in the mapping will be exported.`,
    }),
    scrollTTL: flags.string({
      description: `The scroll TTL option to pass to the dump operation (which performs a document.search under the hood),
expressed in ms format, e.g. '2s', '1m', '3h'.`,
      default: "20s",
    }),
    ...kuzzleFlags,
    protocol: flags.string({
      description: "Kuzzle protocol (http or websocket)",
      default: "ws",
    }),
  };

  static args = [
    { name: "index", description: "Index name", required: true },
    { name: "collection", description: "Collection name", required: true },
  ];

  static examples = [
    "kourou export:collection nyc-open-data yellow-taxi",
    "kourou export:collection nyc-open-data yellow-taxi --query '{ term: { city: \"Saigon\" } }'",
  ];

  async runSafe() {
    const exportPath = this.flags.path
      ? path.join(this.flags.path, this.args.index)
      : this.args.index;

    const fields = this.flags.fields ? this.flags.fields.split(",") : [];

    if (this.flags.format === "csv" && fields.length === 0) {
      this.logInfo(
        "It looks like you are exporting to CSV but you did not select any field. All exportable fields in the mapping will be exported."
      );
    }

    let query = this.parseJs(this.flags.query);

    if (this.flags.editor) {
      query = this.fromEditor(query, { json: true });
    }

    const countAll = await this.sdk.document.count(
      this.args.index,
      this.args.collection
    );
    const count = await this.sdk.document.count(
      this.args.index,
      this.args.collection,
      { query }
    );

    this.logInfo(
      `Dumping ${count} of ${countAll} documents from collection "${this.args.index}:${this.args.collection}" in ${exportPath} ...`
    );

    fs.mkdirSync(exportPath, { recursive: true });

    await dumpCollectionMappings(
      this.sdk,
      this.args.index,
      this.args.collection,
      exportPath,
      this.flags.format
    );

    await dumpCollectionData(
      this.sdk,
      this.args.index,
      this.args.collection,
      Number(this.flags["batch-size"]),
      exportPath,
      query,
      this.flags.format,
      fields,
      this.flags.scrollTTL
    );

    this.logOk(`Collection ${this.args.index}:${this.args.collection} dumped`);
  }
}
