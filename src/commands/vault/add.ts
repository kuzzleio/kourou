import fs from "fs";

import { flags } from "@oclif/command";
import _ from "lodash";
import { Cryptonomicon, Vault } from "kuzzle-vault";

import { Kommand } from "../../common";

export class VaultAdd extends Kommand {
  static initSdk = false;

  static description = `
Adds an encrypted key to an encrypted secrets file.

A new secrets file is created if it does not yet exist.

Encrypted secrets are meant to be loaded inside an application with Kuzzle Vault.

See https://github.com/kuzzleio/kuzzle-vault/ for more information.
`;

  static examples = [
    "kourou vault:add config/secrets.enc.json aws.s3.keyId b61e267676660c314b006b06 --vault-key <vault-key>",
  ];

  static flags = {
    "vault-key": flags.string({
      description: "Kuzzle Vault Key (or KUZZLE_VAULT_KEY)",
      default: process.env.KUZZLE_VAULT_KEY,
    }),
  };

  static args = [
    {
      name: "secrets-file",
      description: "Encrypted secrets file",
      required: true,
    },
    {
      name: "key",
      description: "Path to the key (lodash style)",
      required: true,
    },
    { name: "value", description: "Value to encrypt", required: true },
  ];

  async runSafe() {
    if (_.isEmpty(this.flags["vault-key"])) {
      throw new Error("A vault key must be provided");
    }

    if (_.isEmpty(this.args["secrets-file"])) {
      throw new Error("A secrets file must be provided");
    }

    const cryptonomicon = new Cryptonomicon(this.flags["vault-key"]);
    const PARSER = Vault.getParser(this.args["secrets-file"]);

    let encryptedSecrets = {};
    if (fs.existsSync(this.args["secrets-file"])) {
      encryptedSecrets = PARSER.parse(
        fs.readFileSync(this.args["secrets-file"], "utf8")
      );

      try {
        cryptonomicon.decryptObject(encryptedSecrets);
      } catch (error: any) {
        throw new Error(
          "Trying to add a secret encrypted with a different key"
        );
      }
    }

    _.set(
      encryptedSecrets,
      this.args.key,
      cryptonomicon.encryptString(this.args.value)
    );

    fs.writeFileSync(
      this.args["secrets-file"],
      PARSER.stringify(encryptedSecrets, null, 2)
    );

    this.logOk(
      `Key "${this.args.key}" has been securely added "${this.args["secrets-file"]}"`
    );
  }
}
