import chalk from 'chalk'
import * as fs from 'fs'

// tslint:disable-next-line
const ndjson = require('ndjson')

function handleError(log: any, dumpFile: string, error: any) {
  if (error.status === 206) {
    const
      errorFile = `${dumpFile.split('.').slice(0, -1).join('.')}-errors.jsonl`
    const writeStream = fs.createWriteStream(errorFile, { flags: 'a' })
    const serialize = ndjson.serialize().pipe(writeStream)

    serialize.on('data', (line: string) => (writeStream.write(line)))

    for (const partialError of error.errors) {
      serialize.write(partialError)
    }

    serialize.end()

    log(chalk.red(`[X] Error importing ${dumpFile}. See errors in ${errorFile}`))
  }
  else {
    log(chalk.red(error.message))
    throw error
  }
}

export async function restoreCollectionData(sdk: any, log: any, batchSize: number, dumpFile: string, index?: string, collection?: string) {
  const mWriteRequest = {
    controller: 'bulk',
    action: 'mWrite',
    index: '',
    collection: '',
    body: {
      documents: [{}]
    }
  }

  let total = 0

  await new Promise((resolve, reject) => {
    let headerSkipped = false
    let documents: any[] = []

    const readStream = fs.createReadStream(dumpFile)
      .pipe(ndjson.parse())
      .on('data', (obj: any) => {
        if (headerSkipped) {
          documents.push(obj)

          if (documents.length === batchSize) {
            mWriteRequest.body.documents = documents
            documents = []

            readStream.pause()

            sdk
              .query(mWriteRequest)
              .then(() => {
                total += mWriteRequest.body.documents.length
                process.stdout.write(`  ${total} documents imported`)
                process.stdout.write('\r')

                readStream.resume()
              })
              .catch((error: any) => {
                try {
                  handleError(log, dumpFile, error)
                  readStream.resume()
                }
                catch (error) {
                  readStream.end()
                  reject(error)
                }
              })
          }
        }
        else {
          if (obj.type !== 'collection') {
            throw new Error('Dump file does not contains collection data')
          }

          headerSkipped = true
          mWriteRequest.index = index || obj.index
          mWriteRequest.collection = collection || obj.collection
        }
      })
      .on('end', () => {
        if (documents.length > 0) {
          mWriteRequest.body.documents = documents

          sdk
            .query(mWriteRequest)
            .then(() => {
              total += mWriteRequest.body.documents.length

              process.stdout.write(`  ${total} documents imported`)
              process.stdout.write('\r')

              resolve()
            })
            .catch((error: any) => {
              try {
                handleError(log, dumpFile, error)
                reject(error)
              }
              catch (error) {
                reject(error)
              }
            })
        }
        else {
          resolve()
        }
      })
  })

  return {
    total,
    collection: mWriteRequest.collection,
    index: mWriteRequest.index
  }
}

/**
 * Imports mappings from a collection mappings dump
 * Expected format:
 * {
 *   type: 'mappings',
 *   content: {
 *     index: {
 *       collection: {
 *         // mappings
 *       }
 *     }
 *   }
 * }
 *
 * @param {Kuzzle} sdk - Kuzzle SDK instance
 * @param {String} dump - Dump object (type, content)
 * @param {String} index - Override index name
 * @param {String} collection - Override collection name
 */
export async function restoreCollectionMappings(sdk: any, dump: any, index?: string, collection?: string) {
  if (dump.type !== 'mappings') {
    throw new Error('Dump file does not contain mappings definition')
  }

  const srcIndex: any = Object.keys(dump.content)[0]
  const srcCollection: any = Object.keys(dump.content[srcIndex])[0]

  const dstIndex: any = index || srcIndex
  const dstCollection: any = collection || srcCollection

  if (!await sdk.index.exists(dstIndex)) {
    await sdk.index.create(dstIndex)
  }

  await sdk.collection.create(dstIndex, dstCollection, dump.content[srcIndex][srcCollection])

  return {
    index: dstIndex,
    collection: dstCollection
  }
}
