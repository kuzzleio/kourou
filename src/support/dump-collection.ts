import fs from 'fs'
import path from 'path'

import cli from 'cli-ux'
import ndjson from 'ndjson'

export async function dumpCollectionData(sdk: any, index: string, collection: string, batchSize: number, destPath: string, query: any = {}) {
  const collectionDir = path.join(destPath, collection)
  const filename = path.join(collectionDir, 'documents.jsonl')
  const writeStream = fs.createWriteStream(filename)
  const waitWrite = new Promise(resolve => writeStream.on('finish', resolve))
  const ndjsonStream = ndjson.stringify()
  const options = {
    scroll: '1m',
    size: batchSize
  }

  const writeLine = (content: any) => {
    return new Promise(resolve => {
      if (ndjsonStream.write(content)) {
        resolve()
      }
      else {
        ndjsonStream.once('drain', resolve)
      }
    })
  }

  writeStream.on('error', error => {
    throw error
  })

  ndjsonStream.on('data', (line: string) => writeStream.write(line))

  fs.mkdirSync(collectionDir, { recursive: true })

  await writeLine({ type: 'collection', index, collection })

  let results = await sdk.document.search(index, collection, { query }, options)

  const progressBar = cli.progress({
    format: `Dumping ${collection} |{bar}| {percentage}% || {value}/{total} documents`
  })
  progressBar.start(results.total, 0)

  do {
    progressBar.update(results.fetched)

    for (const hit of results.hits) {
      const document = {
        _id: hit._id,
        body: hit._source
      }

      await writeLine(document)
    }
  } while ((results = await results.next()))

  progressBar.stop()
  ndjsonStream.end()
  writeStream.end()

  return waitWrite
}

export async function dumpCollectionMappings(sdk: any, index: string, collection: string, destPath: string) {
  const collectionDir = path.join(destPath, collection)
  const filename = path.join(collectionDir, 'mappings.json')

  fs.mkdirSync(collectionDir, { recursive: true })

  const mappings = await sdk.collection.getMapping(index, collection)

  const dump = {
    type: 'mappings',
    content: {
      [index]: {
        [collection]: mappings
      }
    }
  }

  fs.writeFileSync(filename, JSON.stringify(dump, null, 2))
}
