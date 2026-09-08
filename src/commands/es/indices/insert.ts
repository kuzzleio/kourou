import { Args, Flags } from "@oclif/core";
import { Client } from "sdk-es7";

import { Kommand } from "../../../common";

export default class EsInsert extends Kommand {
  static initSdk = false;

  static description =
    "Inserts a document directly into ES (will replace if exists)";

  static flags = {
    body: Flags.string({
      description: "Document body in JSON",
      default: "{}",
    }),
    id: Flags.string({
      description: "Document ID",
    }),
    node: Flags.string({
      char: "n",
      description: "Elasticsearch server URL",
      default: "http://localhost:9200",
    }),
    help: Flags.help(),
  };

  static args = {
    index: Args.string({ description: "ES Index name", required: true }),
  };

  async runSafe() {
    const esClient = new Client({ node: this.flags.node });

    const esRequest = {
      index: this.args.index,
      id: this.flags.id,
      body: this.flags.body,
    };

    await esClient.index(esRequest);

    this.logOk("Document successfully inserted.");
  }
}
