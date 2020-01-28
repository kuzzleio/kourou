import * as fs from 'fs'

// tslint:disable-next-line
const ndjson = require('ndjson')

async function dumpCollection(sdk: any, index: string, collection: string, batchSize: number, path: string) {
  const filename = `${path}/collection-${collection}.jsonl`
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

  await new Promise(resolve => {
    if (ndjsonStream.write({ index: index, collection })) {
      resolve()
    } else {
      ndjsonStream.once('drain', resolve)
    }
  })

  let results = await sdk.document.search(index, collection, {}, options)

  do {
    process.stdout.write(`  ${results.fetched}/${results.total} documents dumped`)
    process.stdout.write('\r')

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

  ndjsonStream.end()
  writeStream.end()

  return waitWrite
}

export default dumpCollection
