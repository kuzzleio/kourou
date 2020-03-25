import fs from 'fs'
import { spawnSync } from 'child_process'

// tslint:disable-next-line
const tmp = require('tmp')

export interface EditorParams {
  json?: boolean;
}

export class Editor {
  private _content: string;

  private tmpFile: any;

  private defaultEditor: string;

  private options: EditorParams;

  constructor(content = '', options: EditorParams = {}) {
    this._content = content

    this.options = options

    this.defaultEditor = process.platform.startsWith('win')
      ? 'notepad'
      : 'nano'

    if (this.options.json) {
      if (this._content.length === 0) {
        this._content = '{\n\n}'
      }
      else {
        this._content = JSON.stringify(JSON.parse(this._content), null, 2)
      }

      this.tmpFile = tmp.fileSync({ postfix: '.json' })
    }
    else {
      this.tmpFile = tmp.fileSync({ postfix: '.json' })
    }

    fs.writeFileSync(this.tmpFile.name, this._content);
  }

  run() {
    process.env.EDITOR = process.env.EDITOR || this.defaultEditor
    const editor = process.env.EDITOR

    const response = spawnSync(
      editor,
      [this.tmpFile.name],
      { stdio: 'inherit' })

    if (response.status !== 0) {
      // eslint-disable-next-line
      console.error(response.stdout)
      // eslint-disable-next-line
      console.error(response.stderr)
      throw new Error(`Unable to open editor "${editor}": ${response.error}.\nPlease set EDITOR environment variable.`)
    }

    this._content = fs.readFileSync(this.tmpFile.name, 'utf8')

    fs.unlinkSync(this.tmpFile.name)
  }

  get content() {
    return this._content
  }
}
