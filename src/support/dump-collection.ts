import * as fs from 'fs'
import cli from 'cli-ux'

// tslint:disable-next-line
const ndjson = require('ndjson')

export async function dumpCollectionData(sdk: any, index: string, collection: string, batchSize: number, path: string) {
  const collectionDir = `${path}/${collection}`
  const filename = `${collectionDir}/documents.jsonl`
  const writeStream = fs.createWriteStream(filename)
  const waitWrite = new Promise(resolve => writeStream.on('finish', resolve))
  const ndjsonStream = ndjson.serialize()
  const options = {
    scroll: '10m',
    size: batchSize
  }

  writeStream.on('error', error => {
    throw error
  })

  ndjsonStream.on('data', (line: string) => writeStream.write(line))

  fs.mkdirSync(collectionDir, { recursive: true })

  await new Promise(resolve => {
    if (ndjsonStream.write({ index: index, collection })) {
      resolve()
    } else {
      ndjsonStream.once('drain', resolve)
    }
  })

  let results = await sdk.document.search(index, collection, {}, options)

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

      if (!ndjsonStream.write(document)) {
        await new Promise(resolve => ndjsonStream.once('drain', resolve))
      }
    }
  } while ((results = await results.next()))

  progressBar.stop()
  ndjsonStream.end()
  writeStream.end()

  return waitWrite
}

export async function dumpCollectionMappings(sdk: any, index: string, collection: string, path: string) {
  const collectionDir = `${path}/${collection}`
  const filename = `${collectionDir}/mappings.json`

  fs.mkdirSync(collectionDir, { recursive: true })

  const mappings = await sdk.collection.getMapping(index, collection)

  const content = {
    [index]: {
      [collection]: mappings
    }
  }

  fs.writeFileSync(filename, JSON.stringify(content, null, 2))
}
