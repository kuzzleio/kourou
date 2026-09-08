import { Help } from "@oclif/core";

/**
 * Adds a pointer to sdk:query when help cannot be shown.
 *
 * A command name that is not found here is often an API action, which the
 * command_not_found hook forwards to sdk:query. Help has no way to know that,
 * so it fails on a name that is in fact usable, and the message says so.
 *
 * This used to be a monkey patch of Help.prototype.showHelp in bin/run.
 * @oclif/plugin-help is ESM-only since its 7.0, so it can no longer be
 * required from a CommonJS entry point, and a help class declared through
 * `oclif.helpClass` is the supported way to do this anyway.
 */
export default class KourouHelp extends Help {
  async showHelp(argv: string[]): Promise<void> {
    try {
      return await super.showHelp(argv);
    } catch (error: any) {
      error.message += `

If you tried to execute and API action you can see
available options by displaying the "sdk:query" command help:
  - kourou sdk:query --help`;

      throw error;
    }
  }
}
