import fs from "fs";
import _ from "lodash";
import { flags } from "@oclif/command";
import { Cryptonomicon } from "kuzzle-vault";

import { Kommand } from "../../common";

export class FileDecrypt extends Kommand {
  static initSdk = false;

  static description = "Decrypts an encrypted file.";

  static examples = [
    "kourou file:decrypt books/cryptonomicon.txt.enc --vault-key <vault-key>",
    "kourou file:decrypt books/cryptonomicon.txt.enc -o books/cryptonomicon.txt --vault-key <vault-key>",
  ];

  static flags = {
    force: flags.boolean({
      char: "f",
      description: "Overwrite the output file if it already exists",
    }),
    "output-file": flags.string({
      char: "o",
      description: 'Output file (default: remove ".enc")',
    }),
    "vault-key": flags.string({
      description: "Kuzzle Vault Key (or KUZZLE_VAULT_KEY)",
      default: process.env.KUZZLE_VAULT_KEY,
    }),
  };

  static args = [
    { name: "file", description: "Encrypted file", required: true },
  ];

  async runSafe() {
    if (_.isEmpty(this.flags["vault-key"])) {
      throw new Error("A vault key must be provided");
    }

    if (_.isEmpty(this.args.file)) {
      throw new Error("An encrypted file must be provided");
    }

    let outputFile = `${this.args.file.replace(".enc", "")}`;
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
      throw new Error(`File "${this.args.file}" does not exist`);
    }

    let encryptedContent;
    try {
      encryptedContent = fs.readFileSync(this.args.file, "utf8");
    } catch (error: any) {
      throw new Error(
        `Cannot read encrypted content from file "${this.args.file}": ${error.message}`
      );
    }

    const content = cryptonomicon.decryptString(encryptedContent);

    fs.writeFileSync(outputFile, content);

    this.logOk(`Successfully decrypted content into the file ${outputFile}`);
  }
}
