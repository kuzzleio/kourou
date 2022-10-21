import { flags } from "@oclif/command";
import _ from "lodash";
import fs from "fs";
import stripComments from "strip-json-comments";

import { Kommand } from "../../common";

export class ConfigKeyDiff extends Kommand {
  static initSdk = false;

  static description =
    "Returns differences between two Kuzzle configuration files (kuzzlerc)";

  static examples = [
    "kourou config:diff config/local/kuzzlerc config/production/kuzzlerc",
  ];

  static flags = {
    strict: flags.boolean({
      description: "Exit with an error if differences are found",
      default: false,
    }),
    values: flags.boolean({
      description: "Also displays value changes",
      default: false,
    }),
  };

  static args = [
    { name: "first", description: "First configuration file", required: true },
    {
      name: "second",
      description: "Second configuration file",
      required: true,
    },
  ];

  async runSafe() {
    if (!fs.existsSync(this.args.first)) {
      throw new Error(`File "${this.args.first}" does not exists`);
    }

    if (!fs.existsSync(this.args.second)) {
      throw new Error(`File "${this.args.second}" does not exists`);
    }

    const first = JSON.parse(
      stripComments(fs.readFileSync(this.args.first, "utf8"))
    );
    const second = JSON.parse(
      stripComments(fs.readFileSync(this.args.second, "utf8"))
    );

    const changes = this._keyChanges(first, second);

    if (_.isEmpty(changes)) {
      this.logOk("No differences between keys in the provided configurations");
      return;
    }

    this.logInfo(
      "Found differences between keys in the provided configurations. In the second file:"
    );

    for (const [path, change] of Object.entries(changes)) {
      this.log(` - key "${path}" ${change}`);
    }

    if (this.flags.strict) {
      throw new Error("Provided configuration contains different keys");
    }
  }

  // Returns path who had changed between two objects (inspired by https://gist.github.com/Yimiprod/7ee176597fef230d1451)
  _keyChanges(base: any, object: any) {
    const changes: any = {};

    const walkObject = (_base: any, _object: any, path: any = []) => {
      for (const key of Object.keys(_base)) {
        if (_object[key] === undefined) {
          const ar: [] = [];
          const ar2: [] = [];
          ar.concat(ar2);
          changes[[...path, key].join(".")] = "was removed";
        }
      }

      for (const key of Object.keys(_object)) {
        if (_base[key] === undefined) {
          changes[[...path, key].join(".")] = "was added";
        } else if (
          !_.isEqual(_object[key], _base[key]) &&
          _.isObject(_object[key]) &&
          _.isObject(_base[key])
        ) {
          walkObject(_base[key], _object[key], [...path, key]);
        } else if (this.flags.values && _base[key] !== _object[key]) {
          const currentValue = _.isObject(_object[key])
            ? JSON.stringify(_object[key])
            : _object[key];
          const previousValue = _.isObject(_base[key])
            ? JSON.stringify(_base[key])
            : _base[key];
          changes[
            [...path, key].join(".")
          ] = `value is "${currentValue}" and was "${previousValue}"`;
        }
      }
    };

    walkObject(base, object);

    return changes;
  }
}
