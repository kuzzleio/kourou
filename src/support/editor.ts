import fs from 'fs'
import { spawnSync } from 'child_process'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export interface IEditorParams {
  json?: boolean;
}

export default class Editor {
  private _content: string;
  private tmpFile: string;
  private defaultEditor: string;
  private options: IEditorParams;

  constructor(content: string = '', options: IEditorParams = {}) {
    this._content = content

    this.options = options

    this.defaultEditor = /^win/.test(process.platform)
      ? 'notepad'
      : 'nano'

    if (this.options.json) {
      if (this._content.length === 0) {
        this._content = '{\n\n}'
      }
      else {
        this._content = JSON.stringify(JSON.parse(this._content), null, 2)
      }

      this.tmpFile = `/tmp/${this._randomString()}.json`
    }
    else {
      this.tmpFile = `/tmp/${this._randomString()}.tmp`
    }

    this._createTmpFile()
  }

  run() {
    process.env.EDITOR = process.env.EDITOR || this.defaultEditor
    const editor = process.env.EDITOR

    const response = spawnSync(
      editor,
      [this.tmpFile]);

    if (response.status !== 0) {
      console.error(response.stdout)
      console.error(response.stderr)
      throw new Error(`Unable to open editor "${editor}": ${response.error}.\nPlease set EDITOR environment variable.`)
    }

    this._content = fs.readFileSync(this.tmpFile, 'utf8')

    fs.unlinkSync(this.tmpFile)
  }

  get content() {
    if (this.options.json) {
      // remove newlines and spaces
      return JSON.stringify(JSON.parse(this._content))
    }

    return this._content
  }

  _createTmpFile() {
    fs.writeFileSync(this.tmpFile, this._content, 'utf8');
  }

  _randomString() {
    let string = '';

    for (let i = 12; i--;) {
      string += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
    }

    return string;
  }
}
