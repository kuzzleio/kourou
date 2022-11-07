import { flags } from "@oclif/command";
import _ from "lodash";
import { Kommand } from "../common";
import { kuzzleFlags } from "../support/kuzzle";

class Api extends Kommand {
  public static description = `Executes an API query.

Query arguments

  Arguments can be passed and repeated using the --arg or -a flag.
  Index and collection names can be passed with --index (-i) and --collection (-c) flags
  ID can be passed with the --id flag.

  Examples:
    - kourou api document:delete -i iot -c sensors -a refresh=wait_for

Query body

  Body can be passed with the --body flag with either a JSON or JS string.
  Body will be read from STDIN if available

  Examples:
    - kourou api document:create -i iot -c sensors --body '{creation: Date.now())}'
    - kourou api admin:loadMappings < mappings.json
    - echo '{dynamic: "strict"}' | kourou api collection:create -i iot -c sensors

Other

  Use the --display flag to display a specific property of the response

  Examples:
    - kourou api document:create -i iot -c sensors
    - kourou api server:now --display 'result.now'

Default fallback to API action

  It's possible to use the "api" command by only specifying the corresponding controller
  and action as first argument.

  Kourou will try to infer the first arguments to one the following pattern:
    - <command> <index>
    - <command> <body>
    - <command> <index> <collection>
    - <command> <index> <collection> <id>
    - <command> <index> <collection> <body>
    - <command> <index> <collection> <id> <body>

  If a flag is given (-i, -c, --body or --id), then the flag value has priority over
  argument infering.

  Examples:
    - kourou collection:list iot
    - kourou security:createUser '{ "content": { "profileIds": ["default"] } }' --id yagmur
    - kourou collection:delete iot sensors
    - kourou document:createOrReplace iot sensors sigfox-1 '{}'
    - kourou bulk:import iot sensors '{ bulkData: [...] }'
    - kourou admin:loadMappings < mappings.json
`;

  public static flags = {
    help: flags.help(),
    arg: flags.string({
      char: "a",
      description:
        'Additional argument. Repeatable. (e.g. "-a refresh=wait_for")',
      multiple: true,
    }),
    body: flags.string({
      description:
        "Request body in JS or JSON format. Will be read from STDIN if available.",
      default: "{}",
    }),
    index: flags.string({
      char: "i",
      description: "Index argument",
    }),
    collection: flags.string({
      char: "c",
      description: "Collection argument",
    }),
    id: flags.string({
      description: "ID argument (_id)",
    }),
    display: flags.string({
      description:
        "Path of the property to display from the response (empty string to display the result)",
      default: "result",
    }),
    "print-raw": flags.boolean({
      description: "Print only the query result to stdout",
    }),
    ...kuzzleFlags,
  };

  static args = [
    {
      name: "controller:action",
      description: 'Controller and action (eg: "server:now")',
      required: true,
    },
  ];

  static readStdin = true;

  async runSafe() {
    const [controller, action] = this.args["controller:action"].split(":");

    const requestArgs: any = {};

    requestArgs.index = this.flags.index;
    requestArgs.collection = this.flags.collection;
    requestArgs._id = this.flags.id;

    for (const keyValue of this.flags.arg || []) {
      const key = keyValue.substr(0, keyValue.indexOf("="));
      requestArgs[key] = keyValue.substr(keyValue.indexOf("=") + 1);
    }

    const body = this.stdin ? this.stdin : this.flags.body;

    let request = {
      controller,
      action,
      ...requestArgs,
      body: this.parseJs(body),
    };

    const response = await this.sdk.query(request);

    const display =
      this.flags.display === ""
        ? response
        : _.get(response, this.flags.display);

    console.log(JSON.stringify(display, null, 2))

    this.logOk(`Successfully executed "${controller}:${action}"`);
  }
}

export default Api;
