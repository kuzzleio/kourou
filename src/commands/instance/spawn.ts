import { flags } from "@oclif/command";
import chalk from "chalk";
import { ChildProcess, spawn } from "child_process";
import cli from "cli-ux";
import compareVersion from "compare-version";
import execa from "execa";
import { writeFileSync } from "fs";
import Listr from "listr";
import emoji from "node-emoji";
import { Kommand, printCliName } from "../../common";

const MIN_MAX_MAP_COUNT = 262144;
const MIN_DOCO_VERSION = "1.12.0";

export default class InstanceSpawn extends Kommand {
  public static description = "Spawn a new Kuzzle instance";

  public static flags = {
    help: flags.help(),
    version: flags.string({
      char: "v",
      description: "Core-version of the instance to spawn",
      default: "2",
    }),
  };

  /**
   * @override
   */
  public async run() {
    this.log("");
    this.log(`${printCliName()} - ${InstanceSpawn.description}`);
    this.log("");

    const { flags: userFlags } = this.parse(InstanceSpawn);
    const dockerComposeFileName: string = this.getDocoFileName();

    if ((await this.checkPrerequisites()) === true) {
      this.log("");
      this.log(
        `${emoji.get("ok_hand")} Prerequisites are ${chalk.green.bold("OK")}!`,
      );
    } else {
      this.log("");
      throw new Error(
        `${emoji.get(
          "shrug",
        )} Your system doesn't satisfy all the prerequisites. Cannot run Kuzzle.`,
      );
    }

    this.log("");
    this.log(
      chalk.grey(`Writing docker-compose file to ${dockerComposeFileName}...`),
    );
    writeFileSync(dockerComposeFileName, this.generateDocoFile(userFlags.version));

    const doco: ChildProcess = spawn("docker-compose", [
      "-f",
      dockerComposeFileName,
      "up",
      "-d",
    ]);

    cli.action.start(
      ` ${emoji.get("rocket")} Kuzzle version ${userFlags.version} is launching`,
      undefined,
      {
        stdout: true,
      },
    );

    doco.on("close", (docoCode) => {
      if (docoCode === 0) {
        cli.action.stop("done");
        this.log("");
        this.log(
          `${emoji.get("thumbsup")} ${chalk.bold(
            "Kuzzle is booting",
          )} in the background right now.`,
        );
        this.log(chalk.grey("To watch the logs, run"));
        this.log(
          chalk.grey(`  docker-compose -f ${this.getDocoFileName()} logs -f`),
        );
        this.log("");
      } else {
        cli.action.stop(
          chalk.red(
            ` Something went wrong: docker-compose exited with ${docoCode}`,
          ),
        );
        this.log(
          chalk.grey("If you want to investigate the problem, try running"),
        );
        this.log(chalk.grey(`  docker-compose -f ${this.getDocoFileName()} up`));
        this.log("");
        throw new Error("docker-compose exited witn non-zero status");
      }
    });
  }

  public async checkPrerequisites(): Promise<boolean> {
    this.log(chalk.grey("Checking prerequisites..."));
    const checks: Listr = new Listr([
      {
        title: `docker-compose exists and the version is at least ${MIN_DOCO_VERSION}`,
        task: async () => {
          try {
            const docov = await execa("docker-compose", ["-v"]);
            const matches = docov.stdout.match(/[^0-9.]*([0-9.]*).*/);
            if (matches === null) {
              throw new Error(
                "Unable to read docker-compose verson. This is weird.",
              );
            }
            const version = matches.length > 0 ? matches[1] : null;

            if (version === null) {
              throw new Error(
                "Unable to read docker-compose verson. This is weird.",
              );
            }
            try {
              if (compareVersion(version, MIN_DOCO_VERSION) === -1) {
                throw new Error(
                  `The detected version of docker-compose (${version}) is not recent enough (${MIN_DOCO_VERSION})`,
                );
              }
            } catch (error) {
              throw new Error(error);
            }
          } catch (error) {
            throw new Error(
              "No docker-compose found. Are you sure docker-compose is installed?",
            );
          }
        },
      },
      {
        title: `vm.max_map_count is greater than ${MIN_MAX_MAP_COUNT}`,
        task: async () => {
          try {
            const sysctl = await execa("/sbin/sysctl", [
              "-n",
              "vm.max_map_count",
            ]);
            if (sysctl.exitCode !== 0) {
              throw new Error("Something went wrong checking vm.max_map_count");
            }

            const value: number = parseInt(sysctl.stdout, 10);
            if (value < MIN_MAX_MAP_COUNT) {
              throw new Error(
                `vm.max_map_count must be at least ${MIN_MAX_MAP_COUNT} (found ${value})`,
              );
            }
          } catch (error) {
            throw new Error("Something went wrong checking vm.max_map_count");
          }
        },
      },
    ]);

    try {
      await checks.run();
      return true;
    } catch (error) {
      this.logError(error.message);
      return false;
    }
  }

  public getDocoFileName(): string {
    return "/tmp/kuzzle-stack.yml";
  }

  public generateDocoFile(version = "2"): string {
    return `version: '3'

services:
  kuzzle:
    image: kuzzleio/kuzzle:${version}
    ports:
      - "7512:7512"
      - "1883:1883"
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
      - NODE_ENV=production

  redis:
    image: redis:5

  elasticsearch:
    image: kuzzleio/elasticsearch:${this.getESVersion(version)}
    ulimits:
      nofile: 65536`;
  }

  public getESVersion(kuzzleVersion: string): string {
    switch (kuzzleVersion) {
      case "1":
        return "5.6.10";
      case "2":
        return "7";
      default:
        throw new Error(`Invalid Kuzzle Core version number: ${kuzzleVersion}`);
    }
  }
}
