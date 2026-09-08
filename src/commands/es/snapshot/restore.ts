import { Args, Flags } from "@oclif/core";
import { Client } from "sdk-es7";

import { Kommand } from "../../../common";

const RESTORE_TIMEOUT = 30 * 60 * 1000;

export default class EsSnapshotsRestore extends Kommand {
  static initSdk = false;

  static description = "Restore a snapshot repository inside an ES instance";

  static flags = {
    node: Flags.string({
      char: "n",
      description: "Elasticsearch server URL",
      default: "http://localhost:9200",
    }),
    wait: Flags.boolean({
      description:
        "Wait for the restore to complete before returning. Use --no-wait to return as soon as Elasticsearch has accepted the request",
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
      // Waiting holds the HTTP request open for as long as the restore takes,
      // which the 30s default would cut short on any real dataset.
      requestTimeout: this.flags.wait ? RESTORE_TIMEOUT : undefined,
    });

    await esClient.indices.close({
      index: "*",
      expand_wildcards: "all",
    });

    const esRequest = {
      repository: this.args.repository,
      snapshot: this.args.name,
      wait_for_completion: this.flags.wait,
      body: {
        feature_states: ["none"],
        include_global_state: false,
        indices: "*",
      },
    };

    const response = await esClient.snapshot.restore(esRequest);

    this.logOk(`Success ${JSON.stringify(response.body)}`);
  }
}
