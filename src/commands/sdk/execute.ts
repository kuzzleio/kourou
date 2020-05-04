import { flags } from '@oclif/command'

import { Editor } from '../../support/editor'
import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

class SdkQuery extends Kommand {
  public static description = `
Executes arbitrary code.

Code Execution

  provided code will be executed in an async method
  you can access an connected and authenticated SDK with the "sdk" variable
  return value will be printed on the standard output (eg: 'return await sdk.server.now();')
  error will be catched and printed on the error output (eg: 'throw new Error("failure");')

Provide code

  code can be passed with the --code flag
  code will be read from STDIN if available

  Examples:
    - kourou sdk:execute --code 'return await sdk.server.now()'
    - kourou sdk:execute < snippet.js
    - echo 'return await sdk.server.now()' | kourou sdk:execute

Other

  use the --editor flag to modify the code before executing it

  Examples:
    - kourou sdk:execute --code 'return await sdk.server.now()' --editor
`;

  public static flags = {
    help: flags.help(),
    code: flags.string({
      description: 'Code to execute. Will be read from STDIN if available.'
    }),
    editor: flags.boolean({
      description: 'Open an editor (EDITOR env variable) to edit the code before executing it.'
    }),
    ...kuzzleFlags,
  };

  async runSafe() {
    // try to read stdin
    const stdin = await this.fromStdin()

    if (stdin && this.flags.editor) {
      throw new Error('Unable to use flag --editor when reading from STDIN')
    }

    let code: any = stdin || this.flags.code
    let userError: any

    code = `
(async () => {
  try {
    ${code}
  }
  catch (error) {
    userError = error
  }
})();
`
    // content from user editor
    if (this.flags.editor) {
      const editor = new Editor(code)
      editor.run()
      code = editor.content
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sdk: any = this.sdk?.sdk
    // eslint-disable-next-line no-eval
    const result = await eval(code)

    if (userError) {
      this.logKo(`Error when executing SDK code: ${userError.message}`)
    }
    else {
      this.logOk('Successfully executed SDK code')
      this.log(JSON.stringify(result, null, 2))
    }
  }
}

export default SdkQuery
