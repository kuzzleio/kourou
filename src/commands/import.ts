import { flags } from '@oclif/command'
import * as fs from 'fs'
import * as path from 'path'

import { Kommand } from '../common'
import { kuzzleFlags, KuzzleSDK } from '../support/kuzzle'
import { restoreCollectionData, restoreCollectionMappings } from '../support/restore-collection'
import { restoreProfiles, restoreRoles } from '../support/restore-securities'

const revAlphaSort = (a: string, b: string) => {
  if (a < b) {
    return 1
  }

  if (a > b) {
    return -1
  }

  return 0
}

export default class Import extends Kommand {
  private userFlags: any

  static description = 'Recursively imports dump files from a root directory'

  static flags = {
    help: flags.help({}),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsWriteCount config)',
      default: '200'
    }),
    ...kuzzleFlags,
  }

  static args = [
    { name: 'path', description: 'Root directory containing dumps', required: true },
  ]

  async runSafe() {
    const { args, flags: userFlags } = this.parse(Import)

    this.userFlags = userFlags

    this.sdk = new KuzzleSDK({ protocol: 'ws', ...userFlags })
    await this.sdk.init(this.log)

    await this.walkDirectories(args.path)
  }

  async walkDirectories(directory: string) {
    const entries = fs.readdirSync(directory)

    const directories = entries
      .map(entry => path.join(directory, entry))
      .filter(dirName => fs.lstatSync(dirName).isDirectory())
      .sort(revAlphaSort)

    // Sort files by name some mappings.json come before documents.jsonl
    const files = entries
      .map(entry => path.join(directory, entry))
      .filter(fileName => fs.lstatSync(fileName).isFile())
      .sort(revAlphaSort)

    for (const file of files) {
      await this.importFile(file)
    }

    for (const dir of directories) {
      await this.walkDirectories(dir)
    }
  }

  async importFile(file: string) {
    if (file.endsWith('.jsonl')) {
      this.logInfo(`[collection] Start importing documents in ${file}`)
      const { total, index, collection } = await restoreCollectionData(
        this.sdk,
        this.log.bind(this),
        Number(this.userFlags['batch-size']),
        file)

      this.logOk(`[collection] Imported ${total} documents in "${index}":"${collection}"`)
    }
    else if (file.endsWith('.json')) {
      try {
        const dump = JSON.parse(fs.readFileSync(file, 'utf8'))

        if (dump.type === 'roles') {
          this.logInfo(`[roles] Start importing roles in ${file}`)
          const total = await restoreRoles(this.sdk, dump)
          this.logOk(`[roles] Imported ${total} roles`)
        }
        else if (dump.type === 'profiles') {
          this.logInfo(`[profiles] Start importing profiles in ${file}`)
          const total = await restoreProfiles(this.sdk, dump)
          this.logOk(`[profiles] Imported ${total} profiles`)
        }
        else if (dump.type === 'mappings') {
          this.logInfo(`[collection] Start importing mappings in ${file}`)
          const { index, collection } = await restoreCollectionMappings(this.sdk, dump)
          this.logOk(`[collection] Imported mappings for "${index}":"${collection}"`)
        }
      }
      catch (error) {
        this.logKo(`Invalid JSON file "${file}". Import skipped. ${error.message}`)
      }
    }
  }
}
