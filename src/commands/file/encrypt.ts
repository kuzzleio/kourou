import fs from "fs";
import _ from "lodash";
import { flags } from "@oclif/command";
import { Cryptonomicon } from "kuzzle-vault";

import { Kommand } from "../../common";

export class VaultEncrypt extends Kommand {
  static initSdk = false;

  static description = "Encrypts an entire file.";

  static examples = [
    "kourou file:encrypt books/cryptonomicon.txt --vault-key <vault-key>",
    "kourou file:encrypt books/cryptonomicon.txt -o books/cryptonomicon.txt.enc --vault-key <vault-key>",
  ];

  static flags = {
    force: flags.boolean({
      char: "f",
      description: "Overwrite the output file if it already exists",
    }),
    "output-file": flags.string({
      char: "o",
      description: "Output file (default: <filename>.enc)",
    }),
    "vault-key": flags.string({
      description: "Kuzzle Vault Key (or KUZZLE_VAULT_KEY)",
      default: process.env.KUZZLE_VAULT_KEY,
    }),
  };

  static args = [{ name: "file", description: "Filename", required: true }];

  async runSafe() {
    if (_.isEmpty(this.flags["vault-key"])) {
      throw new Error("A vault key must be provided");
    }

    if (_.isEmpty(this.args.file)) {
      throw new Error("A file must be provided");
    }

    let outputFile = `${this.args.file}.enc`;
    if (this.flags["output-file"]) {
      outputFile = this.flags["output-file"];
    }

    if (fs.existsSync(outputFile) && !this.flags.force) {
      throw new Error(
        `Output file "${outputFile}" already exists. Use -f flag to overwrite it.`
      );
    }

    const cryptonomicon = new Cryptonomicon(this.flags["vault-key"]);

    if (!fs.existsSync(this.args.file)) {
      throw new Error(`File "${this.args.file}" does not exists`);
    }

    let content;
    try {
      content = fs.readFileSync(this.args.file, "utf8");
    } catch (error: any) {
      throw new Error(`Cannot read file "${this.args.file}": ${error.message}`);
    }

    const encryptedContent = cryptonomicon.encryptString(content);

    fs.writeFileSync(outputFile, encryptedContent);

    this.logOk(`File content successfully encrypted into ${outputFile}`);
  }
}
