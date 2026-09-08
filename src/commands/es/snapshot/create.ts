import { Args, Flags } from "@oclif/core";
import { Client } from "sdk-es7";

import { Kommand } from "../../../common";

const SNAPSHOT_TIMEOUT = 30 * 60 * 1000;

export default class EsSnapshotsCreate extends Kommand {
  static initSdk = false;

  static description = "Create a snapshot repository inside an ES instance";

  static flags = {
    node: Flags.string({
      char: "n",
      description: "Elasticsearch server URL",
      default: "http://localhost:9200",
    }),
    wait: Flags.boolean({
      description:
        "Wait for the snapshot to complete before returning. Use --no-wait to return as soon as Elasticsearch has accepted the request",
      default: true,
      allowNo: true,
    }),
    help: Flags.help(),
  };

  static args = {
    repository: Args.string({
      description: "ES repository name",
      required: true,
    }),
    name: Args.string({ description: "ES snapshot name", required: true }),
  };

  async runSafe() {
    const esClient = new Client({
      node: this.flags.node,
      // Waiting holds the HTTP request open for as long as the snapshot takes,
      // which the 30s default would cut short on any real dataset.
      requestTimeout: this.flags.wait ? SNAPSHOT_TIMEOUT : undefined,
    });

    const esRequest = {
      repository: this.args.repository,
      snapshot: this.args.name,
      wait_for_completion: this.flags.wait,
      body: {
        indices: "*",
        include_global_state: false,
        partial: false,
      },
    };

    const response = await esClient.snapshot.create(esRequest);

    this.logOk(`Success ${JSON.stringify(response.body)}`);
  }
}
