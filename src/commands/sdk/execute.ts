import { flags } from "@oclif/command";
import { isEmpty } from "lodash";

import { Editor } from "../../support/editor";
import { Kommand } from "../../common";
import { kuzzleFlags } from "../../support/kuzzle";
import ts from "typescript";
import vm from 'node:vm'

class SdkExecute extends Kommand {
  public static description = `
Executes arbitrary code.

Code Execution

  Provided code will be executed in an async method.
  You can access a connected and authenticated SDK with the "sdk" variable.
  Templated variable passed as the command arguments are also accessible within the same name.
  Returned value will be printed on the standard output (e.g. 'return await sdk.server.now();').
  Errors will be caught and printed on the error output (e.g. 'throw new Error("failure");').

Provide code

  code can be passed as an argument
  code will be read from STDIN if available

  Examples:
    - kourou sdk:execute 'return await sdk.server.now()'
    - kourou sdk:execute 'return await sdk.index.exists(index)' --var 'index="iot-data"'
    - kourou sdk:execute < snippet.js
    - echo 'return await sdk.server.now()' | kourou sdk:execute

Other

  use the --editor flag to modify the code before executing it

  Examples:
    - kourou sdk:execute 'return await sdk.server.now()' --editor
`;

  public static flags = {
    help: flags.help(),
    var: flags.string({
      char: "v",
      description:
        "Additional arguments injected into the code. (eg: --var 'index=\"iot-data\"'",
      multiple: true,
    }),
    editor: flags.boolean({
      description:
        "Open an editor (EDITOR env variable) to edit the code before executing it.",
    }),
    "keep-alive": flags.boolean({
      description: "Keep the connection running (websocket only)",
    }),
    "print-raw": flags.boolean({
      description: "Print only the script result to stdout",
    }),
    ...kuzzleFlags,
  };

  public static args = [
    {
      name: "code",
      description: "Code to execute. Will be read from STDIN if available.",
      required: false,
    },
  ];

  private code = "";

  static readStdin = true;

  async beforeConnect() {
    this.code = this.stdin || this.args.code || "// paste your code here";
    try {
      vm.runInContext(this.code, vm.createContext({}));
    } catch (e: any) {
      if (e.name === "SyntaxError") {
        const result = ts.transpileModule(this.code, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
        this.code = result.outputText;
      }
    }
    if (this.haveSubscription) {
      this.sdkOptions.protocol = "ws";
    }
  }

  getVariables() {
    return (this.flags.var || [])
      .map((nameValue: string) => {
        const [name, value] = nameValue.split("=");

        return `    let ${name} = ${value};`;
      })
      .join("\n");


  }

  async runSafe() {
    if (isEmpty(this.code)) {
      throw new Error("No code provided.");
    }

    let userError: Error | null = null;



    this.code = `
(async () => {
  try {
${this.getVariables()}
    ${this.code}
  }
  catch (error) {
    userError = error
  }
})();
`;
    // content from user editor
    if (this.flags.editor) {
      const editor = new Editor(this.code);
      editor.run();
      this.code = editor.content;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sdk: any = this.sdk.sdk;

    let result;
    try {
      // eslint-disable-next-line no-eval
      result = vm.runInContext(this.code, vm.createContext({}));
    } catch (error: any) {
      userError = error;
    }

    if (userError) {
      this.logKo(`Error when executing SDK code: ${userError}`);
      this.log(userError.stack);
    } else {
      this.logOk("Successfully executed SDK code");

      if (result !== undefined) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(result, null, 2));
      }
    }

    if (!userError && (this.haveSubscription || this.flags["keep-alive"])) {
      this.logInfo("Keep alive for realtime notifications ...");

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await new Promise(() => { });
    }
  }

  get haveSubscription() {
    return this.code.includes("sdk.realtime.subscribe");
  }
}

export default SdkExecute;
