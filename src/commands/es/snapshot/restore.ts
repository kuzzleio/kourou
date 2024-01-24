import { flags } from "@oclif/command";
import { Client } from "@elastic/elasticsearch";

import { Kommand } from "../../../common";

export default class EsSnapshotsRestore extends Kommand {
  static initSdk = false;

  static description = "Restore a snapshot repository inside an ES instance";

  static flags = {
    node: flags.string({
      char: "n",
      description: "Elasticsearch server URL",
      default: "http://localhost:9200",
    }),
    help: flags.help(),
  };

  static args = [
    { name: "repository", description: "ES repository name", required: true },
    { name: "name", description: "ES snapshot name", required: true },
  ];

  async runSafe() {
    const esClient = new Client({ node: this.flags.node });

    const esRequest = {
      repository: this.args.repository,
      snapshot: this.args.name,
      body: {
        feature_states: ["geoip"],
        include_global_state: false,
        indices: "*",
      },
    };

    const response = await esClient.snapshot.create(esRequest);

    this.logOk(`Success ${JSON.stringify(response.body)}`);
  }
}
