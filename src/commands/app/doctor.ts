import { flags } from "@oclif/command";

import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";
import { Client } from "@elastic/elasticsearch";
import { execute } from "../../support/execute";
import _ from "lodash";

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

  ELK_MAX_VERSION = 7.17;
  NODEJS_MAX_VERSION = 16;

  // because ocliff we can't use 'as const' inference for object keys and values
  COMMANDS_PLATFORMS: Record<string, string> = {
    linux: "which",
  };

  LIBRARIES_PLATFORMS: Record<string, string[]> = {
    linux: [
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
    ],
  };

  async runSafe() {
    const suggestions = [];

    const [nodeVersion, adminExists, anonymous] = await Promise.all([
      this.sdk.query({ controller: "debug",  action: "nodeVersion", }),
      this.sdk.server.adminExists({}),
      this.sdk.security.getRole("anonymous")
    ]);

    this.log(`----------------- DoKtor begin his job ! -----------------`);
    this.log(`General checks`);

    const anonymousNotRestricted = _.isEqual(anonymous.controllers, {
      "*": { actions: { "*": true } },
    });

    if (adminExists) {
      this.logOk(`An admin user exists`);
    } else {
      this.logKo("No admin user exists");
      suggestions.push(
        `Create an admin user ${
          anonymousNotRestricted ? "and restrict anonymous role " : ""
        }with
           kourou security:createFirstAdmin '{
              credentials: {
                local: {
                  username: "admin",
                  password: "password"
                }
              }
            }' ${anonymousNotRestricted ? "-a reset=true" : ""}`
      );
    }

    if (anonymousNotRestricted && adminExists) {
      this.logKo(`Anonymous role does not restrict access to any controller`);
      suggestions.push(
        `Restrict anonymous role controllers with
           kourou security:updateRole '{
            "controllers": {
              "auth": {
                "actions": {
                  "checkToken": true,
                  "getCurrentUser": true,
                  "getMyRights": true,
                  "login": true
                }
              },
              "server": {
                "actions": {
                  "publicApi": true,
                  "openapi": true
                }
              }
            }
          }' --id=anonymous
          // or make your own restrictions (see: https://docs.kuzzle.io/core/2/guides/main-concepts/permissions/#roles)`
      );
    }
    const config = await this.sdk.server.getConfig({});
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

    this.logOk(`Kuzzle Version: ${config.version}`);
    this.logOk(`Kuzzle NodeJS version: ${nodeVersion.result}`);
    if (nodeVersion.result as any > this.NODEJS_MAX_VERSION) {
      this.logKo(
        `=> Kuzzle NodeJS version is not compatible with Kuzzle (max version is ${this.NODEJS_MAX_VERSION})`
      );
    }
    this.logOk(`NodeJS Building version: ${process.version}`);
    if (nodeVersion.result !== process.version) {
      this.logKo(
        "=> Kuzzle node version is different from the build node version"
      );
      suggestions.push(
        `Match Kuzzle NodeJS version ${nodeVersion.result} with the build NodeJS version ${process.version}`
      );
    }

    let elkVersion;
    try {
      const serverInfo = await this.sdk.server.info({});
      elkVersion = parseFloat(serverInfo.serverInfo.services.publicStorage.version);
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

      const client = new Client({ node: this.flags.elasticsearch });
      const info = await client.info();
      this.log(`ElasticSearch checks`);
      this.logOk(`Elasticsearch Cluster name: ${info.body.cluster_name}`);
      this.logOk(`ElasticSearch Status: ${info.meta.connection.status}`);

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
      this.logKo("=> Cannot show more information about ElasticSearch (cluster name, nodes, indices) because it's not accessible");
    }

    let librairies: string[] = [];
    let command = "";
    const platform = process.platform.toLowerCase();
    if (
      platform in this.LIBRARIES_PLATFORMS &&
      platform in this.COMMANDS_PLATFORMS
    ) {
      librairies = this.LIBRARIES_PLATFORMS[platform];
      command = this.COMMANDS_PLATFORMS[platform];
    }
    this.log("Kuzzle related libraries installed");
    const notInstalled: string[] = [];
    for (const lib of librairies) {
      try {
        const result = await execute(command, lib);
        if (result.stdout) {
          this.logOk(` ${lib} is installed`);
        }
      } catch (e) {
        this.logKo(`  => ${lib} is not installed`);
        notInstalled.push(lib);
      }
    }
    if (notInstalled.length) {
      suggestions.push(
        `Install missing libraries: sudo apt-get install ${notInstalled.join(" ")}`
      );
    }

    this.log("Docker checks");
    try {
      const docov = await execute("docker-compose", "-v");
      const matches = docov.stdout.match(/[^0-9.]*([0-9.]*).*/);
      if (matches === null || matches.length === 0) {
        this.logKo("Docker Version cannot be found");
      } else {
        this.logOk(`Docker Compose Version: ${matches[1]}`);
      }
    } catch (error: any) {
      this.logKo("Docker Compose cannot be found");
      suggestions.push("Install Docker Compose with 'npm run install:docker'");
    }

    this.log(`----------------- DoKtor finish his job ! -----------------`);
    this.log(`He suggest you to check the following points:`);
    for (const suggestion of suggestions) {
      this.logInfo(" => " + suggestion);
    }
    this.log(`-------------------------------------------------------------`);
  }
}
