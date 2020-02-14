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

    log(chalk.red(`[ℹ] Error importing ${dumpFile}. See errors in ${errorFile}`))
  }
  else {
    log(chalk.red(error.message))
    throw error;
  }
}

export async function restoreCollectionData(sdk: any, log: any, batchSize: number, dumpDir: string, index?: string, collection?: string) {
  const dumpFile = `${dumpDir}/documents.jsonl`;
  const mWriteRequest = {
    controller: 'bulk',
    action: 'mWrite',
    index: '',
    collection: '',
    body: {
      documents: [{}]
    }
  }

  return new Promise((resolve, reject) => {
    let total = 0
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
            .catch((error: any) => {
              try {
                handleError(log, dumpFile, error)
              }
              catch (error) {
                reject(error)
              }
            })
            .then(() => {
              total += mWriteRequest.body.documents.length
              process.stdout.write(`  ${total} documents imported`)
              process.stdout.write('\r')

              resolve()
            })
        }
        else {
          resolve()
        }
      })
  })
}

/**
 * Imports mappings from a collection mappings dump
 * Expected format:
 * {
 *   index: {
 *     collection: {
 *       // mappings
 *     }
 *   }
 * }
 *
 * @param sdk - Kuzzle SDK instance
 * @param dumpDir - Path to the collection dump dir
 * @param index - Override index name
 * @param collection - Override collection name
 *
 * @returns {Promise}
 */
export async function restoreCollectionMappings(sdk: any, dumpDir: string, index?: string, collection?: string) {
  const dumpFile = `${dumpDir}/mappings.json`;
  const content: any = JSON.parse(fs.readFileSync(dumpFile, 'utf8'));

  const srcIndex: any = Object.keys(content)[0];
  const srcCollection: any = Object.keys(content[srcIndex])[0];

  const dstIndex: any = index || srcIndex;
  const dstCollection: any = collection || srcCollection;

  if (! await sdk.index.exists(dstIndex)) {
    await sdk.index.create(dstIndex)
  }

  return sdk.collection.create(dstIndex, dstCollection, content[srcIndex][srcCollection]);
}
