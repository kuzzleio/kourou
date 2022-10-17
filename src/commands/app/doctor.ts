import { flags } from "@oclif/command";

import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";
import { Client } from "@elastic/elasticsearch";
import { execute } from "../../support/execute";

export default class AppDoctor extends Kommand {
  static description = "Analyze a Kuzzle application";

  static flags = {
    help: flags.help(),
    elasticsearch: flags.string({
      description: "Elasticsearch server URL",
      default: "http://localhost:9200",
    }),
    ...kuzzleFlags,
  };

  static args = [];

  static readStdin = true;

  ELK_MAX_VERSION = "7.17";
  NODEJS_MAX_VERSION = "14";

  async runSafe() {
    const suggestions = [];
    const nodeVersion = await this.sdk.query({
      controller: "debug",
      action: "nodeVersion",
    });
    const adminExists = await this.sdk.server.adminExists();

    this.log(`----------------- Doctor begin his job ! -----------------`);
    this.log(`General checks`);
    if (adminExists) {
      this.logOk(`An admin user exists`);
    } else {
      this.logKo("No admin user exists");
      suggestions.push(
        `Create an admin user with "kourou security:createUser '{"content":{"profileIds":["admin"]}}' --id admin"`
      );
    }

    const config = await this.sdk.server.getConfig();
    if (config) {
      if (config.cluster.enabled) {
        this.logOk(`Cluster is enabled`);
      } else {
        this.logKo("Cluster is disabled");
      }
    } else {
      this.logInfo("No config found for the server");
    }

    // Redis
    if ("PONG" === (await this.sdk.ms.ping())) {
      this.logOk("Redis Memory Storage is running");
    } else {
      this.logKo("=> Redis Memory Storage is not running");
      suggestions.push("Check Redis instance dedicated to memory storage");
    }

    this.logOk("Kuzzle Version: " + config.version);
    this.logOk("Kuzzle NodeJS version: " + nodeVersion.result);
    if (nodeVersion.result > this.NODEJS_MAX_VERSION) {
      this.logKo(
        "=> Kuzzle NodeJS version is not compatible with Kuzzle (max version is " +
          this.NODEJS_MAX_VERSION +
          ")"
      );
    }
    this.logOk("NodeJS Building version: " + process.version);
    if (nodeVersion.result != process.version) {
      this.logKo(
        "=> Kuzzle node version is different from the build node version"
      );
      suggestions.push(
        `Match Kuzzle NodeJS version ${nodeVersion.result} with the build NodeJS version ${process.version}`
      );
    }

    let elkVersion;
    try {
      const client = new Client({ node: this.flags.elasticsearch });
      const info = await client.info();

      this.log(`ElasticSearch checks`);
      this.logOk(`Elasticsearch Cluster name: ${info.body.cluster_name}`);
      this.logOk(`ElasticSearch Status: ${info.meta.connection.status}`);
      elkVersion = info.body.version.number;
      if (elkVersion < this.ELK_MAX_VERSION) {
        this.logOk(
          `ElasticSearch Version: ${elkVersion} which is compatible with Kuzzle (max version is ${this.ELK_MAX_VERSION})`
        );
      } else {
        this.logKo(
          `=> ElasticSearch version ${elkVersion} is not compatible with Kuzzle (max version is ${this.ELK_MAX_VERSION})`
        );
        suggestions.push(
          `Downgrade ElasticSearch to a compatible version (max: ${this.ELK_MAX_VERSION})`
        );
      }

      const nodes = await client.cat.nodes({ format: "json" });

      this.log(`ElasticSearch nodes`);
      console.table(
        nodes.body.map((i: any) => ({ node_name: i.name, ip: i.ip }))
      );
      const indices = await client.cat.indices({ format: "json" });

      this.log(`ElasticSearch indices`);
      console.table(
        indices.body.map((i: any) => ({
          indice_name: i.index,
          health: i.health,
          status: i.status,
          count_docs: i["docs.count"],
        }))
      );
    } catch (e) {
      this.logKo("=> ElasticSearch is not reachable");
    }

    let librairies: string[] = [];
    let command = "";
    // TODO : other platforms
    if (process.platform === "linux") {
      librairies = [
        "curl",
        "gdb",
        "git",
        "gnupg",
        "make",
        "python3",
        "libfontconfig",
        "libzmq3-dev",
        "wget",
        "procps",
        "libunwind-dev",
      ];
      command = "which";
    }
    this.log("Kuzzle related libraries installed");
    const notInstalled: string[] = [];
    for (const lib of librairies) {
      try {
        const result = await execute(command, lib);
        if (result.stdout) {
          this.logOk("   " + lib + " is installed");
        }
      } catch (e) {
        this.logKo("  => " + lib + " is not installed");
        notInstalled.push(lib);
      }
    }
    if (notInstalled.length) {
      suggestions.push(
        "Install missing libraries: sudo apt-get install " +
          notInstalled.join(" ")
      );
    }

    this.log("Docker checks");
    try {
      const docov = await execute("docker-compose", "-v");
      const matches = docov.stdout.match(/[^0-9.]*([0-9.]*).*/);
      if (matches === null || matches.length === 0) {
        this.logKo("Docker Version cannot be found");
      } else {
        this.logOk("Docker Compose Version: " + matches[1]);
      }
    } catch (error: any) {
      this.logKo("Docker Compose cannot be found");
      suggestions.push("Install Docker Compose with 'npm run install:docker'");
    }

    this.log(`----------------- Doctor finish his job ! -----------------`);
    this.log(`He suggest you to check the following points:`);
    for (const suggestion of suggestions) {
      this.logInfo(" => " + suggestion);
    }
    this.log(`-------------------------------------------------------------`);
  }
}
