import chalk from "chalk";
import { Hook } from "@oclif/config";

/**
 * Hooks that checks if the command is not found and suggest api kourou command.
 */

const hook: Hook<"command_not_found"> = async function (opts) {
  const [controller, action] = opts.id.split(":");

  if (!controller || !action) {
    return;
  }
  const apiBody = process.argv.slice(2).join(" ");
  this.log(
    chalk.yellow(
      `[ℹ] Unknown command "${opts.id}", if you want to execute an API action, use "kourou api ${apiBody}".`
    )
  );
};

export default hook;
