import { Args, Flags } from "@oclif/core";

import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";

export default class DocumentSearch extends Kommand {
  static description = "Searches for documents";

  static examples = [
    "kourou document:search iot sensors '{ equals: { name: \"corona\" } }'",
    "kourou document:search iot sensors '{ match: { name: \"cOrOnna\" } }' -a lang=elasticsearch",
    "kourou document:search iot sensors --editor",
  ];

  static flags = {
    sort: Flags.string({
      description: "Sort in JS or JSON format.",
      default: "{}",
    }),
    from: Flags.string({
      description: "Optional offset",
    }),
    size: Flags.string({
      description: "Optional page size",
    }),
    scroll: Flags.string({
      description: "Optional scroll TTL",
    }),
    lang: Flags.string({
      description: "Specify the query language to use",
      default: "koncorde",
    }),
    editor: Flags.boolean({
      description:
        "Open an editor (EDITOR env variable) to edit the request before sending",
    }),
    help: Flags.help(),
    ...kuzzleFlags,
  };

  static args = {
    index: Args.string({ description: "Index name", required: true }),
    collection: Args.string({ description: "Collection name", required: true }),
    query: Args.string({ description: "Search query in JS or JSON format." }),
  };

  async runSafe() {
    let request: any = {
      controller: "document",
      action: "search",
      index: this.args.index,
      collection: this.args.collection,
      from: this.flags.from,
      size: this.flags.size,
      scroll: this.flags.scroll,
      lang: this.flags.lang,
      body: {
        query: this.parseJs(this.args.query || "{}"),
        sort: this.parseJs(this.flags.sort),
      },
    };

    // allow to edit request before send
    if (this.flags.editor) {
      request = this.fromEditor(request, { json: true });
    }

    const { result }: any = await this.sdk.query(request);

    for (const document of result?.hits || []) {
      this.logInfo(`Document ID: ${document._id}`);
      this.log(`Content: ${JSON.stringify(document._source, null, 2)}`);
    }

    this.logOk(
      `${result?.hits.length} documents fetched on a total of ${result?.total}`,
    );
  }
}
