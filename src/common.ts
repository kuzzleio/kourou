import os from "os";
import fs from "fs";
import path from "path";

import { Command } from "@oclif/command";
import chalk from "chalk";
import emoji from "node-emoji";
import get from "lodash/get";
import isObject from "lodash/isObject";
import KeplerCompanion from "kepler-companion";

import { KuzzleSDK } from "./support/kuzzle";
import { Editor, EditorParams } from "./support/editor";

export abstract class Kommand extends Command {
  // Instantiate a dummy SDK to avoid the this.sdk notation everywhere -_-
  protected sdk: KuzzleSDK = new KuzzleSDK({ host: "nowhere" });

  private exitCode = 0;

  private telemetry: KeplerCompanion = new KeplerCompanion();

  public args: any;

  public flags: any;

  public static initSdk = true;

  public static disableLog = false;

  public static readStdin = false;

  public static keepAuth = false;

  public stdin: string | undefined = undefined;

  public sdkOptions: any = {};

  protected kourouDir = path.join(os.homedir(), ".kourou");

  constructor(argv: any, config: any) {
    super(argv, config);

    if (process.env.KOUROU_USAGE && process.env.KOUROU_USAGE !== "true") {
      this.telemetry.turnOff();
    }
  }

  private get logSilent() {
    return this.flags["print-raw"] || (this.constructor as any).disableLog;
  }

  protected createKourouDir() {
    if (!fs.existsSync(this.kourouDir)) {
      fs.mkdirSync(this.kourouDir);
    }
  }

  public printCommand() {
    const klass: any = this.constructor;

    const shortDescription = klass.description
      .split("\n")
      .filter((line: string) => line.length > 0)[0];

    this.log("");
    this.log(
      `${chalk.blue.bold(
        `${emoji.get("rocket")} Kourou`
      )} - ${shortDescription}`
    );
    this.log("");
  }

  public log(message?: string): void {
    if (this.logSilent) {
      return;
    }

    super.log(` ${message}`);
  }

  public logOk(message: string): void {
    if (this.logSilent) {
      return;
    }

    this.log(chalk.green(`[✔] ${message}`));
  }

  public logInfo(message: string): void {
    if (this.logSilent) {
      return;
    }

    this.log(chalk.yellow(`[ℹ] ${message}`));
  }

  public logKo(message?: string): void {
    if (this.logSilent) {
      return;
    }

    this.exitCode = 1;
    this.log(chalk.red(`[X] ${message}`));
  }

  async run() {
    const kommand = this.constructor as unknown as any;

    const result = this.parse(kommand);
    this.args = result.args;
    this.flags = result.flags;

    this.printCommand();

    if (kommand.readStdin) {
      this.stdin = this.fromStdin();

      if (this.stdin && this.flags.editor) {
        throw new Error("Unable to use flag --editor when reading from STDIN");
      }
    }

    // Lifecycle hook
    await this.beforeConnect();

    let err;
    try {
      if (kommand.initSdk) {
        this.sdk = new KuzzleSDK({
          ...this.flags,
          ...this.sdkOptions,
          appName: this.config.name,
          appVersion: this.config.version,
          keepAuth: kommand.keepAuth,
        });

        await this.sdk.init(this);
      }

      if (this.flags.as) {
        this.logInfo(`Impersonate user "${this.flags.as}"`);
        await this.sdk.impersonate(this.flags.as, async () => this.runSafe());
      } else {
        await this.runSafe();
      }
    } catch (error: any) {
      const stack = error.kuzzleStack || error.stack;
      const errorLink =
        typeof error.id === "string" && error.id.split(".").length === 3
          ? ` (https://docs.kuzzle.io/core/2/api/errors/error-codes/${
              error.id.split(".")[0]
            })`
          : "";

      this.logKo(
        `Error stack: \n${stack || error.message}\n\nError status: ${
          error.status
        }\n\nError id: ${error.id}${errorLink}`
      );

      if (Array.isArray(error.errors)) {
        for (const e of error.errors) {
          this.logKo(`${e.document._id} : ${e.reason}`);
        }
      } else {
        this.logKo(JSON.stringify(error.reason));
      }

      err = true;

      this.exitCode = 1;
    } finally {
      if (kommand.id !== undefined) {
        await Promise.race([
          this.telemetry.add({
            action: kommand.id,
            product: this.config.name,
            version: this.config.version,
            tags: { err },
          }),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
      }

      this.sdk.disconnect();

      process.exit(this.exitCode);
    }
  }

  async beforeConnect() {
    // will be called before connecting to Kuzzle
  }

  async runSafe() {
    throw new Error("You must implement runSafe() method");
  }

  /**
   * Reads a value from STDIN.
   *
   * @returns {String} Parsed input
   */
  fromStdin(): string | undefined {
    // cucumber mess with stdin so I have to do this trick
    if (process.env.NODE_ENV === "test" || process.stdin.isTTY) {
      return;
    }

    return fs.readFileSync(0, "utf8");
  }

  fromEditor(
    defaultContent: Record<string, unknown> | string,
    options?: EditorParams
  ): Record<string, unknown> {
    let content = defaultContent;

    if (typeof content !== "string") {
      content = JSON.stringify(content);
    }
    const editor = new Editor(content, options);

    editor.run();

    return this.parseJs(editor.content);
  }

  public parseJs(input?: string) {
    if (!input) {
      return {};
    }

    // eslint-disable-next-line no-eval
    return eval(`var o = ${input}; o`);
  }
}

/**
 * An iteration-order-safe version of lodash.values
 *
 * @param object The object containing the values
 * @param fields The field names to pick in the right order
 * @returns The values in the same order as the fields
 * @see https://lodash.com/docs/4.17.15#values
 */
export function pickValues(object: any, fields: string[]): any[] {
  return fields.map((f) => formatValueForCSV(get(object, f)));
}

/**
 * Formats the value for correct CSV output, avoiding to return
 * values that would badly serialize in CSV.
 *
 * @param value The value to format
 * @returns The value or a string telling the value is not scalar
 */
export function formatValueForCSV(value: any) {
  if (isObject(value)) {
    return "[NOT_SCALAR]";
  }

  return value;
}
