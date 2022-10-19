import { flags } from "@oclif/command";
import { Client } from "@elastic/elasticsearch";

import { Kommand } from "../../../common";

export default class EsGet extends Kommand {
  static initSdk = false;

  static description = "Gets a document from ES";

  static flags = {
    help: flags.help(),
    node: flags.string({
      char: "n",
      description: "Elasticsearch server URL",
      default: "http://localhost:9200",
    }),
  };

  static args = [
    { name: "index", description: "ES Index name", required: true },
    { name: "id", description: "Document ID", required: true },
  ];

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
