import { Args, Flags } from "@oclif/core";
import { Client } from "sdk-es7";

import { Kommand } from "../../../common";

export default class EsSnapshotsCreateRepository extends Kommand {
  static initSdk = false;

  static description = "Create a FS snapshot repository inside an ES instance";

  static flags = {
    compress: Flags.boolean({
      description: "Compress data when storing them",
      default: false,
    }),
    node: Flags.string({
      char: "n",
      description: "Elasticsearch server URL",
      default: "http://localhost:9200",
    }),
    help: Flags.help(),
  };

  static args = {
    repository: Args.string({
      description: "ES repository name",
      required: true,
    }),
    location: Args.string({
      description: "ES snapshot repository location",
      required: true,
    }),
  };

  async runSafe() {
    const esClient = new Client({ node: this.flags.node });

    const esRequest = {
      repository: this.args.repository,
      verify: true,
      body: {
        type: "fs",
        settings: {
          location: this.args.location,
          compress: this.flags.compress,
        },
      },
    };

    const response = await esClient.snapshot.createRepository(esRequest);

    this.logOk(`Success ${JSON.stringify(response.body)}`);
  }
}
