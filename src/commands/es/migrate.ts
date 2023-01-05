import { flags } from "@oclif/command";
import path from "path";
import cli from "cli-ux";
import chalk from "chalk";
import emoji from "node-emoji";
import { promises as fs } from "fs";

import { Kommand } from "../../common";
import { Elasticsearch, File, Provider, isURL, fileExists } from "../../support/migrate/providers";

export default class EsMigrate extends Kommand {
  static initSdk = false;

  static description =
    "Migrate all the index from an Elasticsearch (or a file) to another Elasticsearch";

  static flags = {
    help: flags.help(),
    src: flags.string({
      description: "Migration source provider",
      env: "KUZZLE_MIGRATION_SRC",
      required: true,
    }),
    dest: flags.string({
      description: "Migration destination provider",
      env: "KUZZLE_MIGRATION_DEST",
      required: true,
    }),
    reset: flags.boolean({
      description: "Reset destination Elasticsearch server",
      default: false,
    }),
    "batch-size": flags.integer({
      description: "How many documents to move in batch per operation",
      default: 1000,
    }),
    "no-interactive": flags.boolean({
      description:
        "Skip confirmation interactive prompts (perfect for scripting)",
      default: false,
    }),
    "dry-run": flags.boolean({
      description: "Print witch collections will be migrated",
      default: false,
    }),
    pattern: flags.string({
      description: "Pattern to match indices to migrate",
    }),
    scroll: flags.string({
      description: "Scroll duration for Elasticsearch scrolling",
      default: "30s",
    }),
  };

  static examples = [
    "kourou es:migrate --src http://elasticsearch:9200 --dest ./my-backup --batch-size 2000 --pattern '&myindexes.collection-*'",
    "kourou es:migrate --src ./my-backup --dest http://elasticsearch:9200 --reset --batch-size 2000 --no-interactive",
  ];

  private src: Provider = undefined as any;
  private dest: Provider = undefined as any;

  private async detectProviderType(provider: string) {
    if (isURL(provider)) {
      return new Elasticsearch(provider, {
        batchSize: this.flags["batch-size"],
        scrollDuration: this.flags.scroll,
      });
    } else if (path.basename(provider)) {
      if (!fileExists(provider)) {
        await fs.mkdir(provider, { recursive: true });
      }

      return new File(provider);
    } else {
      throw new Error(
        `Unknown provider type: ${provider}. You should provide either an Elasticsearch URL or a file path.`
      );
    }
  }

  private async migrateIndex(index: string) {
    const indexDefinition = await this.src.getIndex(index);
    await this.dest.createIndex(index, indexDefinition);
    return;
  }

  private async migrateData(index: string) {
    const queue = [];
    let documents;

    const data = await this.src.readData(index);
    const scrollId = data.scrollId;
    const total = data.total;
    documents = data.documents;

    const progressBar = cli.progress({
      format: chalk.blue(
        " [*] Importing |{bar}| {percentage}% || {value}/{total} documents"
      ),
    });

    if (total) {
      progressBar.start(total, 0);
    }

    queue.push(documents);
    let count = 0;
    while (queue.length && total !== count) {
      count += await this.dest.writeData(index, documents);
      documents = queue.pop();

      progressBar.update(count);
      queue.push(await this.src.readData(index, { scrollId }));
    }

    progressBar.stop();

    return total;
  }

  async runMigrate(index: string) {
    this.logInfo(
      `Importing ${chalk.bold(index)} to ${chalk.bold(this.flags.dest)}`
    );

    await this.migrateIndex(index);
    this.logOk("Mappings successfully imported!");

    const count = await this.migrateData(index);

    if (count === 0) {
      this.logInfo("No documents to import\n");
    } else {
      this.logOk(`${chalk.bold(count)} document(s) imported!\n`);
    }
  }

  async runSafe() {
    this.src = await this.detectProviderType(this.flags.src);
    this.dest = await this.detectProviderType(this.flags.dest);

    if (this.flags.reset) {
      if (!this.flags["no-interactive"]) {
        this.log(
          chalk.red(
            `${emoji.get("fire")} Are you sure you want to reset ${chalk.bold(
              this.flags.dest
            )}?`
          )
        );
        await cli.confirm(
          chalk.redBright(
            ` ${emoji.get(
              "fire"
            )} You will lose all the data stored in it (Type "yes" to confirm)`
          )
        );
      }
      await this.dest.clear();
    }

    this.logInfo(`Fetching indices list from ${chalk.bold(this.flags.src)}`);
    const srcIndices = await this.src.listIndices(this.flags.pattern);

    if (this.flags["dry-run"]) {
      this.log(`${chalk.bold(srcIndices)}`);
      this.logInfo(`${chalk.bold(srcIndices.length)} indices will be migrated`);

      return;
    }

    this.logInfo(
      `Starting indices migration from ${chalk.bold(
        this.flags.src
      )} to ${chalk.bold(this.flags.dest)}`
    );

    for (const index of srcIndices) {
      await this.runMigrate(index);
    }
  }
}
