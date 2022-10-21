import { flags } from "@oclif/command";
import { Client } from "@elastic/elasticsearch";

import { Kommand } from "../../../common";

export default class EsListIndex extends Kommand {
  static initSdk = false;

  static description = "Lists available ES indexes";

  static flags = {
    help: flags.help(),
    node: flags.string({
      char: "n",
      description: "Elasticsearch server URL",
      default: "http://localhost:9200",
    }),
    grep: flags.string({
      char: "g",
      description: "Match output with pattern",
    }),
  };

  async runSafe() {
    const esClient = new Client({ node: this.flags.node });

    try {
      const { body } = await esClient.cat.indices({ format: "json" });
      // nice typescript destructuring syntax (:
      const indexes: string[] = body
        .map(({ index }: { index: string }) => index)
        .filter((index: string) =>
          this.flags.grep ? index.match(new RegExp(this.flags.grep)) : true
        )
        .sort();

      this.log(JSON.stringify(indexes, null, 2));
    } catch (error: any) {
      console.log(error);
    }
  }
}
