import { writeFileSync } from "fs";
import path from "path";

import { flags } from "@oclif/command";
import chalk from "chalk";

import emoji from "node-emoji";

import { Kommand } from "../../common";
import { execute } from "../../support/execute";
import { checkPrerequisites } from "../../support/docker/checkPrerequisites";

const kuzzleServicesFile = `
services:
  redis:
    image: redis:5
    ports:
      - "6379:6379"

  elasticsearch:
    image: kuzzleio/elasticsearch:7
    ports:
      - "9200:9200"
    ulimits:
      nofile: 65536
`;

export default class AppStartServices extends Kommand {
  static initSdk = false;

  public static description =
    "Starts Kuzzle services (Elasticsearch and Redis)";

  public static flags = {
    help: flags.help(),
    check: flags.boolean({
      description: "Check prerequisite before running services",
      default: false,
    }),
  };

  async runSafe() {
    this.createKourouDir();

    const docoFilename = path.join(this.kourouDir, "kuzzle-services.yml");

    const successfullCheck = this.flags.check
      ? await checkPrerequisites(this)
      : true;

    if (this.flags.check && successfullCheck) {
      this.log(
        `\n${emoji.get("ok_hand")} Prerequisites are ${chalk.green.bold("OK")}!`
      );
    } else if (this.flags.check && !successfullCheck) {
      throw new Error(
        `${emoji.get(
          "shrug"
        )} Your system doesn't satisfy all the prerequisites. Cannot run Kuzzle services.`
      );
    }

    this.log(
      chalk.grey(`\nWriting the Docker Compose file to ${docoFilename}...\n`)
    );

    writeFileSync(docoFilename, kuzzleServicesFile);

    // clean up
    await execute("docker", "compose", "-f", docoFilename, "down");

    try {
      await execute("docker", "compose", "-f", docoFilename, "up", "-d");

      this.logOk(
        "Elasticsearch and Redis are booting in the background right now."
      );
      this.log(chalk.grey("\nTo watch the logs, run"));
      this.log(chalk.blue.bold(`  docker compose -f ${docoFilename} logs -f\n`));
      this.log(`  Elasticsearch port: ${chalk.bold("9200")}`);
      this.log(`          Redis port: ${chalk.bold("6379")}`);
    } catch (error: any) {
      this.logKo(` Something went wrong: ${error.message}`);
      this.log(
        chalk.grey("If you want to investigate the problem, try running")
      );

      this.log(chalk.grey(`  docker compose -f ${docoFilename} up\n`));
    }
  }
}
