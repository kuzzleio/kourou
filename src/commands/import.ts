import { flags } from '@oclif/command'
import fs from 'fs'
import path from 'path'

import { Kommand } from '../common'
import { kuzzleFlags } from '../support/kuzzle'
import { restoreCollectionData, restoreCollectionMappings } from '../support/restore-collection'
import { restoreProfiles, restoreRoles, restoreUsers } from '../support/restore-securities'

export default class Import extends Kommand {
  static description = 'Recursively imports dump files from a root directory'

  static flags = {
    'preserve-anonymous': flags.boolean({
      description: 'Preserve anonymous rights',
      default: false
    }),
    help: flags.help({}),
    'batch-size': flags.string({
      description: 'Maximum batch size (see limits.documentsWriteCount config)',
      default: '200'
    }),
    ...kuzzleFlags,
    protocol: flags.string({
      description: 'Kuzzle protocol (http or websocket)',
      default: 'ws',
    }),
  }

  static args = [
    { name: 'path', description: 'Root directory containing dumps', required: true }
  ]

  async runSafe() {
    const files = await this.walkDirectories(this.args.path)

    for (const file of files.mappings) {
      try {
        this.logInfo(`[collection] Start importing mappings in ${file}`)

        const dump = JSON.parse(fs.readFileSync(file, 'utf8'))
        const { index, collection } = await restoreCollectionMappings(this.sdk, dump)

        this.logOk(`[collection] Imported mappings for "${index}":"${collection}"`)
      } catch (error) {
        this.logKo(`Error during import of ${file}: ${error.message}. Skipped.`)
      }
    }

    for (const file of files.documents) {
      try {
        this.logInfo(`[collection] Start importing documents in ${file}`)

        const { total, index, collection } = await restoreCollectionData(
          this.sdk,
          this.log.bind(this),
          Number(this.flags['batch-size']),
          file)

        this.logOk(`[collection] Imported ${total} documents in "${index}":"${collection}"`)
      } catch (error) {
        this.logKo(`Error during import of ${file}: ${error.message}. Skipped.`)
      }
    }

    for (const file of files.roles) {
      try {
        this.logInfo(`[roles] Start importing roles in ${file}`)

        const dump = JSON.parse(fs.readFileSync(file, 'utf8'))
        const total = await restoreRoles(this, dump, this.flags['preserve-anonymous'])

        this.logOk(`[roles] Imported ${total} roles`)
      } catch (error) {
        this.logKo(`Error during import of ${file}: ${error.message}. Skipped.`)
      }
    }

    for (const file of files.profiles) {
      try {
        this.logInfo(`[profiles] Start importing profiles in ${file}`)

        const dump = JSON.parse(fs.readFileSync(file, 'utf8'))
        const total = await restoreProfiles(this, dump)

        this.logOk(`[profiles] Imported ${total} profiles`)
      }
      catch (error) {
        this.logKo(`Error during import of ${file}: ${error.message}. Skipped.`)
      }
    }
    if (files.userMapping.length !== 0) {
      const file = files.userMapping[0]
      try {
        this.logInfo(`[user mapping] Start importing user mapping in ${file}`)
        const dump = JSON.parse(fs.readFileSync(file, 'utf8'))

        const mapping = dump.content.mapping
        delete mapping.profileIds
        await this.sdk?.security.updateUserMapping({
          properties: mapping
        })

        this.logOk('[user mapping] imported')
      } catch (error) {
        this.logKo(`Error during import of ${file}: ${error.message}. Skipped.`)
      }
    }

    for (const file of files.users) {
      try {
        this.logInfo(`[users] Start importing users in ${file}`)

        const dump = JSON.parse(fs.readFileSync(file, 'utf8'))
        const total = await restoreUsers(this, dump)

        this.logOk(`[users] Imported ${total} users`)
      }
      catch (error) {
        this.logKo(`Error during import of ${file}: ${error.message}. Skipped.`)
      }
    }
  }

  async walkDirectories(directory: string) {
    const entries = fs.readdirSync(directory)

    const directories = entries
      .map(entry => path.join(directory, entry))
      .filter(dirName => fs.lstatSync(dirName).isDirectory())

    const files = entries
      .map(entry => path.join(directory, entry))
      .filter(fileName => fs.lstatSync(fileName).isFile())
      .reduce((memo: any, file: string) => {
        const fileType = this.getFileType(file)

        memo[fileType].push(file)

        return memo
        }, { documents: [], mappings: [], roles: [], profiles: [], userMapping: [], users: [] })

    for (const dir of directories) {
      const { documents, mappings, roles, profiles, userMapping, users } = await this.walkDirectories(dir)

      files.documents = files.documents.concat(documents)
      files.mappings = files.mappings.concat(mappings)
      files.roles = files.roles.concat(roles)
      files.profiles = files.profiles.concat(profiles)
      files.userMapping = files.userMapping.concat(userMapping)
      files.users = files.users.concat(users)
    }

    return files
  }

  getFileType(file: string) {
    if (file.endsWith('.jsonl')) {
      return 'documents'
    }

    try {
      const dump = JSON.parse(fs.readFileSync(file, 'utf8'))

      return dump.type
    }
    catch (error) {
      this.logKo(`Invalid JSON file "${file}". Import skipped. ${error.message}`)
    }
  }
}
