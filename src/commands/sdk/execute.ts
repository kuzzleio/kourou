import { flags } from '@oclif/command'

import { Editor } from '../../support/editor'
import { Kommand } from '../../common'
import { kuzzleFlags } from '../../support/kuzzle'

class SdkQuery extends Kommand {
  public static description = `
Executes an API query.

Query arguments

  arguments can be passed and repeated using the --arg or -a flag.
  index and collection names can be passed with --index (-i) and --collection (-c) flags

  Examples:
    - kourou sdk:query document:get -i iot -c sensors -a _id=sigfox-42

Query body

  body can be passed with the --body flag with either a JSON or JS string.
  body will be read from STDIN if available

  Examples:
    - kourou sdk:query document:create -i iot -c sensors --body '{creation: Date.now())}'
    - kourou sdk:query admin:loadMappings < mappings.json
    - echo '{dynamic: "strict"}' | kourou sdk:query collection:create -i iot -c sensors

Other

  use the --editor flag to modify the query before sending it to Kuzzle

  Examples:
    - kourou query document:create -i iot -c sensors --editor
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
    let userError: any;

    code = `
(async () => {
  try {
    ${code}
  }
  catch (error) {
    userError = error;
  }
})();
`;
    // content from user editor
    if (this.flags.editor) {
      const editor = new Editor(code)
      editor.run()
      code = editor.content
    }

    const sdk: any = this.sdk?.sdk
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
