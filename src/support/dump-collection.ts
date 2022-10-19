import fs from "fs";
import path from "path";

import cli from "cli-ux";
import ndjson from "ndjson";
import { pickValues } from "../common";
import { JSONObject, CollectionController } from "kuzzle-sdk";
/**
 * Flatten an object transform:
 * {
 *  title: "kuzzle",
 *  info : {
 *    tag: "news"
 *  }
 * }
 *
 * Into an object like:
 * {
 *  title: "kuzzle",
 *  info.tag: news
 * }
 *
 * @param {Object} target the object we have to flatten
 * @returns {Object} the flattened object
 */
function flattenObject(target: JSONObject): JSONObject {
  const output = {};

  flattenStep(output, target);

  return output;
}

function flattenStep(
  output: JSONObject,
  object: JSONObject,
  prev: string | null = null
): void {
  const keys = Object.keys(object);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = object[key];
    const newKey = prev ? prev + "." + key : key;

    if (Object.prototype.toString.call(value) === "[object Object]") {
      output[newKey] = value;
      flattenStep(output, value, newKey);
    }

    output[newKey] = value;
  }
}

abstract class AbstractDumper {
  protected collectionDir: string;
  protected filename?: string;
  protected writeStream?: fs.WriteStream;
  protected options: { scroll: string; size: number };

  protected abstract get fileExtension(): string;

  constructor(
    protected readonly sdk: any,
    protected readonly index: string,
    protected readonly collection: string,
    protected readonly batchSize: number,
    protected readonly destPath: string,
    protected readonly query: any = {},
    protected readonly scrollTTL: string = "2s"
  ) {
    this.collectionDir = path.join(this.destPath, this.collection);
    this.options = {
      scroll: scrollTTL,
      size: batchSize,
    };
  }

  /**
   * One-shot call before the dump. Can be used to
   * perform setup operations before dumping.
   *
   * @returns void
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async setup() {}

  /**
   * One-shot call before iterating over the data. Can be
   * used to write the header of the dumped output.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async writeHeader() {}

  /**
   * You can put here the logic to write into the dump.
   *
   * @param data The data to be written to the dump (can be
   *             an item or anything else).
   */
  abstract writeLine(data: any): Promise<void>;

  /**
   * Iterative call, on each item in the collection to
   * be dumped. Useful to perform transformations on the data
   * before writing it in the dump. Usually, writeLine is
   * called by this hook.
   *
   * @param document The document to be written in a line of the dump.
   */
  abstract onResult(document: { _id: string; _source: any }): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async tearDown() {}

  /**
   * The loop that iterates over the documents of the collection and
   * calls all the other hooks.
   *
   * @returns a promise resolving when the dump is finished.
   */
  async dump() {
    this.filename = path.join(
      this.collectionDir,
      `documents.${this.fileExtension}`
    );
    this.writeStream = fs.createWriteStream(this.filename);
    const waitWrite: Promise<void> = new Promise((resolve, reject) =>
      this.writeStream ? this.writeStream.on("finish", resolve) : reject()
    );

    this.writeStream.on("error", (error) => {
      throw error;
    });

    await this.setup();
    await this.writeHeader();

    let results = await this.sdk.document.search(
      this.index,
      this.collection,
      { query: this.query },
      this.options
    );

    const progressBar = cli.progress({
      format: `Dumping ${this.collection} |{bar}| {percentage}% || {value}/{total} documents`,
    });
    progressBar.start(results.total, 0);

    do {
      progressBar.update(results.fetched);

      for (const hit of results.hits) {
        await this.onResult({
          _id: hit._id,
          _source: hit._source,
        });
      }
    } while ((results = await results.next()));

    await this.tearDown();
    progressBar.stop();
    this.writeStream.end();

    return waitWrite;
  }
}

class JSONLDumper extends AbstractDumper {
  protected ndjsonStream = ndjson.stringify();

  async setup() {
    this.ndjsonStream.on("data", (line: string) => {
      if (!this.writeStream) {
        throw new Error("Cannot write data: WriteStream is not initialized.");
      }
      this.writeStream.write(line);
    });
    return;
  }
  async writeHeader() {
    await this.writeLine({
      type: "collection",
      index: this.index,
      collection: this.collection,
    });
  }
  writeLine(content: any): Promise<void> {
    return new Promise((resolve) => {
      if (this.ndjsonStream.write(content)) {
        resolve(undefined);
      } else {
        this.ndjsonStream.once("drain", resolve);
      }
    });
  }
  onResult(document: { _id: string; _source: any }): Promise<void> {
    return this.writeLine({ _id: document._id, body: document._source });
  }
  protected get fileExtension() {
    return "jsonl";
  }
}

class KuzzleDumper extends JSONLDumper {
  private rawDocuments: any = {
    [this.index]: {
      [this.collection]: [],
    },
  };
  protected get fileExtension() {
    return "json";
  }
  async onResult(document: { _id: string; _source: any }) {
    this.rawDocuments[this.index][this.collection].push({
      index: {
        _id: document._id,
      },
    });
    this.rawDocuments[this.index][this.collection].push(document._source);
    return;
  }
  tearDown(): Promise<void> {
    return this.writeLine(this.rawDocuments);
  }
}

class CSVDumper extends AbstractDumper {
  constructor(
    sdk: any,
    index: string,
    collection: string,
    batchSize: number,
    destPath: string,
    query: any = {},
    protected fields: string[],
    protected readonly separator = ",",
    protected readonly scrollTTL: string = "2s"
  ) {
    super(sdk, index, collection, batchSize, destPath, query, scrollTTL);
  }

  protected get fileExtension(): string {
    return "csv";
  }
  async setup() {
    if (!this.fields.length) {
      // If no field has been selected, then all fields are selected.
      const mappings = await (
        this.sdk.collection as CollectionController
      ).getMapping(this.index, this.collection);
      if (!mappings.properties) {
        return;
      }
      this.fields = Object.keys(flattenObject(mappings.properties));
    } else {
      // Delete '_id' from the selected fields, since IDs are
      // _always_ exported.
      if (this.fields.includes("_id")) {
        this.fields.splice(this.fields.indexOf("_id"), 1);
      }
    }
  }
  writeHeader() {
    return this.writeLine(["_id", ...this.fields].join(this.separator));
  }
  async writeLine(line: any) {
    if (!this.writeStream) {
      throw new Error("Cannot write data: WriteStream is not initialized.");
    }
    this.writeStream.write(line);
    this.writeStream.write("\n");
    return;
  }
  onResult(document: { _id: string; _source: any }): Promise<void> {
    const values = [document._id, ...pickValues(document._source, this.fields)];
    return this.writeLine(values.join(this.separator));
  }
}

export async function dumpCollectionData(
  sdk: any,
  index: string,
  collection: string,
  batchSize: number,
  destPath: string,
  query: any = {},
  format = "jsonl",
  fields: string[] = [],
  scrollTTL?: string
) {
  let dumper: AbstractDumper;
  switch (format.toLowerCase()) {
    case "jsonl":
      dumper = new JSONLDumper(
        sdk,
        index,
        collection,
        batchSize,
        destPath,
        query,
        scrollTTL
      );
      return dumper.dump();

    case "csv":
      dumper = new CSVDumper(
        sdk,
        index,
        collection,
        batchSize,
        destPath,
        query,
        fields,
        ",",
        scrollTTL
      );
      return dumper.dump();

    default:
      dumper = new KuzzleDumper(
        sdk,
        index,
        collection,
        batchSize,
        destPath,
        query,
        scrollTTL
      );
      return dumper.dump();
  }
}

export async function dumpCollectionMappings(
  sdk: any,
  index: string,
  collection: string,
  destPath: string,
  format = "jsonl"
) {
  const collectionDir = path.join(destPath, collection);
  const filename = path.join(collectionDir, "mappings.json");

  fs.mkdirSync(collectionDir, { recursive: true });

  const mappings = await sdk.collection.getMapping(index, collection);

  const dump = {
    type: "mappings",
    content: {
      [index]: {
        [collection]: mappings,
      },
    },
  };

  fs.writeFileSync(
    filename,
    JSON.stringify(format.toLowerCase() === "jsonl" ? dump : mappings, null, 2)
  );
}
