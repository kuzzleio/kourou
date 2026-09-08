import { Args, Flags } from "@oclif/core";

import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";

export default class CollectionCreate extends Kommand {
  static description = "Creates a collection";

  static flags = {
    help: Flags.help(),
    ...kuzzleFlags,
  };

  static args = {
    index: Args.string({ description: "Index name", required: true }),
    collection: Args.string({ description: "Collection name", required: true }),
    body: Args.string({
      description:
        "Collection mappings and settings in JS or JSON format. Will be read from STDIN if available",
    }),
  };

  static readStdin = true;

  async runSafe() {
    const body = this.stdin ? this.stdin : this.args.body || "{}";

    if (!(await this.sdk.index.exists(this.args.index))) {
      await this.sdk.index.create(this.args.index);

      this.logInfo(`Index "${this.args.index}" created`);
    }

    await this.sdk.collection.create(
      this.args.index,
      this.args.collection,
      this.parseJs(body),
    );

    this.logOk(
      `Collection "${this.args.index}":"${this.args.collection}" created`,
    );
  }
}
