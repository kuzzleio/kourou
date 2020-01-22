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
  } else {
    log(chalk.red(error.message))
  }
  throw error
}

function restoreCollection(sdk: any, log: any, batchSize: number, dumpFile: string, index?: string, collection?: string) {
  const mWriteRequest = {
    controller: 'bulk',
    action: 'mWrite',
    index: '',
    collection: '',
    body: {
      documents: [{}]
    }
  }

  return new Promise(resolve => {
    let
      total = 0
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

            sdk.query(mWriteRequest)
              .catch((error: any) => {
                handleError(log, dumpFile, error)
                readStream.resume()
              })
              .then(() => {
                total += mWriteRequest.body.documents.length
                process.stdout.write(`  ${total} documents handled`)
                process.stdout.write('\r')

                readStream.resume()
              })
          }
        } else {
          headerSkipped = true
          mWriteRequest.index = index || obj.index
          mWriteRequest.collection = collection || obj.collection
        }
      })
      .on('end', () => {
        if (documents.length > 0) {
          mWriteRequest.body.documents = documents

          sdk.query(mWriteRequest)
            .catch((error: any) => handleError(log, dumpFile, error))
            .then(() => {
              total += mWriteRequest.body.documents.length
              process.stdout.write(`  ${total} documents handled`)
              process.stdout.write('\r')

              resolve()
            })
        } else {
          resolve()
        }
      })
  })
}

export default restoreCollection
