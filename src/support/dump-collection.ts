import fs from 'fs'
import path from 'path'

import cli from 'cli-ux'
import ndjson from 'ndjson'

abstract class AbstractDumper {
  protected collectionDir: string
  protected filename?: string
  protected writeStream?: fs.WriteStream
  protected options: {scroll: string, size: number}

  protected abstract get fileExtension(): string

  constructor(
    protected readonly sdk: any,
    protected readonly index: string,
    protected readonly collection: string,
    protected readonly batchSize: number,
    protected readonly destPath: string,
    protected readonly query: any = {},
    protected readonly format = 'jsonl'
  ) {
    this.collectionDir = path.join(this.destPath, this.collection)
    this.options = {
      scroll: '1m',
      size: batchSize
    }
  }

  abstract setup(): Promise<void>
  abstract writeHeader(): Promise<void>
  abstract writeLine(line: any): Promise<void>
  abstract onResult(document: {_id: string, _source: any}): Promise<void>
  abstract tearDown(): Promise<void>

  async dump(): Promise<void> {
    this.filename = path.join(this.collectionDir, `documents.${this.fileExtension}`)
    this.writeStream = fs.createWriteStream(this.filename)
    const waitWrite: Promise<void> = new Promise(
      (resolve, reject) => this.writeStream ? this.writeStream.on('finish', resolve) : reject()
    )

    this.writeStream.on('error', error => {
      throw error
    })

    await this.setup()
    await this.writeHeader()

    let results = await this.sdk.document.search(
      this.index,
      this.collection,
      { query: this.query },
      this.options
    )

    const progressBar = cli.progress({
      format: `Dumping ${this.collection} |{bar}| {percentage}% || {value}/{total} documents`
    })
    progressBar.start(results.total, 0)

    do {
      progressBar.update(results.fetched)

      for (const hit of results.hits) {
        await this.onResult({
          _id: hit._id,
          _source: hit._source
        })
      }
    } while ((results = await results.next()))

    await this.tearDown()
    progressBar.stop()
    this.writeStream.end()

    return waitWrite
  }
}

class JSONLDumper extends AbstractDumper {
  protected ndjsonStream = ndjson.stringify()

  setup(): Promise<void> {
    this.ndjsonStream.on('data', (line: string) => {
      if (!this.writeStream) {
        throw new Error('Cannot write data: WriteStream is not initialized.')
      }
      this.writeStream.write(line)
    })
    return new Promise(resolve => resolve())
  }
  async writeHeader(): Promise<void> {
    await this.writeLine({ type: 'collection', index: this.index, collection: this.collection })
  }
  writeLine(content: any): Promise<void> {
    return new Promise(resolve => {
      if (this.ndjsonStream.write(content)) {
        resolve(undefined)
      }
      else {
        this.ndjsonStream.once('drain', resolve)
      }
    })
  }
  onResult(document: {_id: string, _source: any}): Promise<void> {
    return this.writeLine({_id: document._id, body: document._source})
  }
  tearDown(): Promise<void> {
    return new Promise(resolve => resolve())
  }
  protected get fileExtension() {
    return 'jsonl'
  }
}

class KuzzleDumper extends JSONLDumper {
  private rawDocuments: any = {
    [this.index]: {
      [this.collection]: []
    }
  }
  protected get fileExtension() {
    return 'json'
  }
  async writeHeader(): Promise<void> {
    return new Promise(resolve => resolve())
  }
  onResult(document: {_id: string, _source: any}): Promise<void> {
    this.rawDocuments[this.index][this.collection].push({
      index: {
        _id: document._id
      }
    })
    this.rawDocuments[this.index][this.collection].push(document._source)
    return new Promise(resolve => resolve())
  }
  tearDown(): Promise<void> {
    return this.writeLine(this.rawDocuments)
  }
}

export async function dumpCollectionData(sdk: any, index: string, collection: string, batchSize: number, destPath: string, query: any = {}, format = 'jsonl') {
  let dumper: AbstractDumper
  switch (format.toLowerCase()) {
    case 'jsonl':
      dumper = new JSONLDumper(sdk, index, collection, batchSize, destPath, query, format)
      return dumper.dump();

    default:
      dumper = new KuzzleDumper(sdk, index, collection, batchSize, destPath, query, format)
      return dumper.dump();
  }
  // const collectionDir = path.join(destPath, collection)
  // const filename = path.join(collectionDir, (format.toLowerCase() === 'jsonl' ? 'documents.jsonl' : 'documents.json'))
  // const writeStream = fs.createWriteStream(filename)
  // const waitWrite = new Promise(resolve => writeStream.on('finish', resolve))
  // const ndjsonStream = ndjson.stringify()
  // const options = {
  //   scroll: '1m',
  //   size: batchSize
  // }

  // // WriteLine
  // const writeLine = (content: any) => {
  //   return new Promise(resolve => {
  //     if (ndjsonStream.write(content)) {
  //       resolve(undefined)
  //     }
  //     else {
  //       ndjsonStream.once('drain', resolve)
  //     }
  //   })
  // }

  // writeStream.on('error', error => {
  //   throw error
  // })

  // // Setup
  // ndjsonStream.on('data', (line: string) => writeStream.write(line))

  // fs.mkdirSync(collectionDir, { recursive: true })

  // // Write Header
  // if (format.toLowerCase() === 'jsonl') {
  //   await writeLine({ type: 'collection', index, collection })
  // }

  // let results = await sdk.document.search(index, collection, { query }, options)

  // const progressBar = cli.progress({
  //   format: `Dumping ${collection} |{bar}| {percentage}% || {value}/{total} documents`
  // })
  // progressBar.start(results.total, 0)

  // const rawDocuments: any = {
  //   [index]: {
  //     [collection]: []
  //   }
  // }

  // do {
  //   progressBar.update(results.fetched)

  //   for (const hit of results.hits) {
  //     let document = null
  //     if (format.toLocaleLowerCase() === 'jsonl') {
  //       document = {
  //         _id: hit._id,
  //         body: hit._source
  //       }

  //       await writeLine(document)
  //     } else {
  //       rawDocuments[index][collection].push({
  //         index: {
  //           _id: hit._id
  //         }
  //       })
  //       rawDocuments[index][collection].push(hit._source)
  //     }
  //   }
  // } while ((results = await results.next()))

  // if (format.toLocaleLowerCase() === 'kuzzle') {
  //   await writeLine(rawDocuments)
  // }

  // progressBar.stop()
  // ndjsonStream.end()
  // writeStream.end()

  // return waitWrite
}

export async function dumpCollectionMappings(sdk: any, index: string, collection: string, destPath: string, format = 'jsonl') {
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

  fs.writeFileSync(filename, JSON.stringify((format.toLowerCase() === 'jsonl' ? dump : mappings), null, 2))
}
