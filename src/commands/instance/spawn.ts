import path from "path";
import { writeFileSync } from "fs";
import net from "net";

import { flags } from "@oclif/command";
import chalk from "chalk";
import { ChildProcess, spawn } from "child_process";
import cli from "cli-ux";
import Listr from "listr";
import emoji from "node-emoji";

import { Kommand } from "../../common";
import { execute } from "../../support/execute";

const MIN_MAX_MAP_COUNT = 262144;
const MIN_DOCO_VERSION = "2.0.0";

const kuzzleStackV1 = (increment: number): string => `
version: '3'

services:
  kuzzle:
    image: kuzzleio/kuzzle:1
    ports:
      - "${7512 + increment}:7512"
      - "${1883 + increment}:1883"
      - "${9229 + increment}:9229"
    cap_add:
      - SYS_PTRACE
    depends_on:
      - redis
      - elasticsearch
    environment:
      - kuzzle_services__db__client__host=http://elasticsearch:9200
      - kuzzle_services__internalCache__node__host=redis
      - kuzzle_services__memoryStorage__node__host=redis
      - NODE_ENV=development
      - DEBUG=kuzzle:*,-kuzzle:entry-point:protocols:websocket

  redis:
    image: redis:5

  elasticsearch:
    image: kuzzleio/elasticsearch:5.6.10
    ports:
      - "${9200 + increment}:9200"
    ulimits:
      nofile: 65536
    environment:
      - cluster.name=kuzzle
      - "ES_JAVA_OPTS=-Xms1024m -Xmx1024m"
`;

const kuzzleStackV2 = (increment: number): string => `
version: '3'

services:
  kuzzle:
    image: kuzzleio/kuzzle:2
    ports:
      - "${7512 + increment}:7512"
      - "${1883 + increment}:1883"
      - "${9229 + increment}:9229"
    cap_add:
      - SYS_PTRACE
    depends_on:
      - redis
      - elasticsearch
    environment:
    - kuzzle_services__storageEngine__client__node=http://elasticsearch:9200
    - kuzzle_services__internalCache__node__host=redis
    - kuzzle_services__memoryStorage__node__host=redis
    - kuzzle_server__protocols__mqtt__enabled=true
    - kuzzle_server__protocols__mqtt__developmentMode=false
    - kuzzle_limits__loginsPerSecond=50
    - NODE_ENV=development
    - DEBUG=kuzzle:*,-kuzzle:entry-point:protocols:websocket

  redis:
    image: redis:5

  elasticsearch:
    image: kuzzleio/elasticsearch:7
    ports:
      - "${9200 + increment}:9200"
    ulimits:
      nofile: 65536
`;
export default class InstanceSpawn extends Kommand {
  static initSdk = false;

  public static description = "Spawn a new Kuzzle instance";

  public static flags = {
    help: flags.help(),
    check: flags.boolean({
      description: "Check prerequisite before running Kuzzle",
      default: false,
    }),
    version: flags.string({
      char: "v",
      description: "Core-version of the instance to spawn",
      default: "2",
    }),
  };

  async runSafe() {
    const portIndex = await this.findAvailablePort();
    const docoFilename = path.join(
      this.kourouDir,
      `kuzzle-stack-${portIndex}.yml`
    );

    const successfullCheck = this.flags.check
      ? await this.checkPrerequisites()
      : true;

    if (this.flags.check && successfullCheck) {
      this.log(
        `\n${emoji.get("ok_hand")} Prerequisites are ${chalk.green.bold("OK")}!`
      );
    } else if (this.flags.check && !successfullCheck) {
      throw new Error(
        `${emoji.get(
          "shrug"
        )} Your system doesn't satisfy all the prerequisites. Cannot run Kuzzle.`
      );
    }

    this.log(chalk.grey(`\nWriting docker compose file to ${docoFilename}...`));
    writeFileSync(
      docoFilename,
      this.generateDocoFile(this.flags.version, portIndex)
    );

    // clean up
    await execute(
      "docker",
      "compose",
      "-f",
      docoFilename,
      "-p",
      `stack-${portIndex}`,
      "down"
    );

    const doco: ChildProcess = spawn("docker", [
      "compose",
      "-f",
      docoFilename,
      "-p",
      `stack-${portIndex}`,
      "up",
      "-d",
    ]);

    cli.action.start(
      ` ${emoji.get("rocket")} Kuzzle version ${this.flags.version
      } is launching`,
      undefined,
      {
        stdout: true,
      }
    );

    doco.on("close", (docoCode) => {
      if (docoCode === 0) {
        cli.action.stop("done");
        this.log(
          `\n${emoji.get("thumbsup")} ${chalk.bold(
            "Kuzzle is booting"
          )} in the background right now.`
        );
        this.log(chalk.grey("To watch the logs, run"));
        this.log(
          chalk.grey(
            `  docker compose -f ${docoFilename} -p stack-${portIndex} logs -f\n`
          )
        );
        this.log(`  Kuzzle port: ${7512 + portIndex}`);
        this.log(`  MQTT port: ${1883 + portIndex}`);
        this.log(`  Node.js debugger port: ${9229 + portIndex}`);
        this.log(`  Elasticsearch port: ${9200 + portIndex}`);
      } else {
        cli.action.stop(
          chalk.red(
            ` Something went wrong: docker compose exited with ${docoCode}`
          )
        );
        this.log(
          chalk.grey("If you want to investigate the problem, try running")
        );
        this.log(
          chalk.grey(
            `  docker compose -f ${docoFilename} -p stack-${portIndex} up\n`
          )
        );
        throw new Error("docker compose exited with a non-zero status");
      }
    });
  }

  public async checkPrerequisites(): Promise<boolean> {
    this.log(chalk.grey("Checking prerequisites..."));
    const checks: Listr = new Listr([
      {
        title: `docker compose exists and the version is at least ${MIN_DOCO_VERSION}`,
        task: async () => {
          try {
            const docov = await execute("docker", "compose version");
            const matches = docov.stdout.match(/[^0-9.]*([0-9.]*).*/);

            if (matches === null) {
              throw new Error(
                "Unable to read the version of Docker Compose. This is weird."
              );
            }
            const docoVersion = matches.length > 0 ? matches[1] : null;

            if (docoVersion === null) {
              throw new Error(
                "Unable to read the version of Docker Compose. This is weird."
              );
            }
            try {
              if (docoVersion < MIN_DOCO_VERSION) {
                throw new Error(
                  `Your version of Docker Compose (${docoVersion}) is below the required version (${MIN_DOCO_VERSION}).`
                );
              }
            } catch (error: any) {
              throw new Error(error);
            }
          } catch (error: any) {
            throw new Error(
              "Docker Compose couldn't be found. Are you sure Docker and the Compose plugin are installed?"
            );
          }
        },
      },
      {
        title: `vm.max_map_count is greater than ${MIN_MAX_MAP_COUNT}`,
        task: async () => {
          try {
            const sysctl = await execute(
              "/sbin/sysctl",
              "-n",
              "vm.max_map_count"
            );

            if (sysctl.exitCode !== 0) {
              throw new Error("Something went wrong checking vm.max_map_count");
            }

            const value: number = parseInt(sysctl.stdout, 10);
            if (value < MIN_MAX_MAP_COUNT) {
              throw new Error(
                `vm.max_map_count must be at least ${MIN_MAX_MAP_COUNT} (found ${value})`
              );
            }
          } catch (error: any) {
            throw new Error(
              `Something went wrong checking vm.max_map_count: ${error.message}`
            );
          }
        },
      },
    ]);

    try {
      await checks.run();
      return true;
    } catch (error: any) {
      this.logKo(error.message);
      return false;
    }
  }

  private generateDocoFile(kuzzleMajor: string, portIndex: number): string {
    if (kuzzleMajor === "1") {
      return kuzzleStackV1(portIndex);
    }

    return kuzzleStackV2(portIndex);
  }

  private isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const tester = net
        .createServer()
        .once("error", (error) => {
          if (!error.message.match(/EADDRINUSE/)) {
            reject(error);
          }
          resolve(false);
        })
        .once("listening", () => {
          tester.once("close", () => resolve(true)).close();
        })
        .listen(port);
    });
  }

  private async findAvailablePort(): Promise<number> {
    let i = 0;

    // eslint-disable-next-line
    while (true) {
      if (await this.isPortAvailable(7512 + i)) {
        return i;
      }
      i++;
    }
  }
}
