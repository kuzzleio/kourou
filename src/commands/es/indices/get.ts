import { Args, Flags } from "@oclif/core";
import { Client } from "sdk-es7";

import { Kommand } from "../../../common";

export default class EsGet extends Kommand {
  static initSdk = false;

  static description = "Gets a document from ES";

  static flags = {
    help: Flags.help(),
    node: Flags.string({
      char: "n",
      description: "Elasticsearch server URL",
      default: "http://localhost:9200",
    }),
  };

  static args = {
    index: Args.string({ description: "ES Index name", required: true }),
    id: Args.string({ description: "Document ID", required: true }),
  };

  async runSafe() {
    const esClient = new Client({ node: this.flags.node });

    const esRequest = {
      index: this.args.index,
      id: this.args.id,
    };

    const { body } = await esClient.get(esRequest);

    this.log(JSON.stringify(body, null, 2));
  }
}
