import { useSdk } from "../../helpers/sdk";
import { beforeEachTruncateCollections } from "../../hooks/collections";
import { beforeEachLoadFixtures } from "../../hooks/fixtures";
import { resetSecurityDefault } from "../../hooks/securities";

import { Client } from "@elastic/elasticsearch";
import { execute } from "../../../lib/support/execute";
import fs from "fs";
import { exec } from "child_process";

jest.setTimeout(20000);

function kourou(...command: any[]) {
  const kourouRuntime = process.env.KOUROU_RUNTIME || "./bin/run";
  return execute(kourouRuntime, ...command);
}

describe("CSV", () => {
  let sdk = useSdk();
  let shouldResetSecurity = false;
  let shouldLogout = false;
  let esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  });

  beforeAll(async () => {
    await sdk.connect();
  });

  beforeEach(async () => {
    await beforeEachTruncateCollections(sdk);
    await beforeEachLoadFixtures(sdk);
  });

  afterEach(async () => {
    if (shouldResetSecurity) {
      await resetSecurityDefault(sdk);
      shouldResetSecurity = false;
    }

    if (shouldLogout) {
      sdk.jwt = null;
    }
  });

  afterAll(async () => {
    sdk.disconnect();
  });
  it("Exports a collection to CSV specifying the fields", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    await expect(sdk.index.exists("nyc-open-data")).resolves.toBe(true);
    index = "nyc-open-data";

    await expect(
      sdk.collection.exists("nyc-open-data", "yellow-taxi")
    ).resolves.toBe(true);
    collection = "yellow-taxi";

    response = await sdk.document["mCreate"](index, collection, [
      {
        _id: "chuon-chuon-kim",
        body: { city: "hcmc", district: 1, nested: { field: 1 } },
      },
      {
        _id: "the-hive-vn",
        body: { city: "hcmc", district: 2, nested: { field: 2 } },
      },
      {
        _id: "the-hive-th",
        body: { city: "changmai", district: 7, unwanted: "field" },
      },
      { _id: "luca", body: { city: "changmai", district: [7, 8, 9] } },
      {
        _id: "toto",
        body: {
          city: "changmai",
          district: 11,
          object: { field: "this is an object" },
        },
      },
    ]);

    await sdk.collection.refresh(index, collection);

    try {
      const { stdout } = await kourou(
        "export:collection",
        "nyc-open-data",
        "yellow-taxi",
        ["--format", "csv", "--fields", "city,district,nested.field,object"]
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(
      fs.readFileSync("nyc-open-data/yellow-taxi/documents.csv").toString()
    ).resolves.toMatchObject(
      "_id,city,district,nested.field,object\nchuon-chuon-kim,hcmc,1,1,\nthe-hive-vn,hcmc,2,2,\nthe-hive-th,changmai,7,,\nluca,changmai,[NOT_SCALAR],,\ntoto,changmai,11,,[NOT_SCALAR]\n"
    );
  });

  it("Exports a collection to CSV without specifying any field", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    await expect(sdk.index.exists("nyc-open-data")).resolves.toBe(true);
    index = "nyc-open-data";

    await expect(
      sdk.collection.exists("nyc-open-data", "yellow-taxi")
    ).resolves.toBe(true);
    collection = "yellow-taxi";

    response = await sdk.document["mCreate"](index, collection, [
      {
        _id: "the-hive-th",
        body: { city: "changmai", district: 7, unwanted: "field" },
      },
      { _id: "luca", body: { city: "changmai", district: [7, 8, 9] } },
      {
        _id: "chuon-chuon-kim",
        body: { city: "hcmc", district: 1, nested: { field: 1 } },
      },
    ]);

    await sdk.collection.refresh(index, collection);

    try {
      const { stdout } = await kourou(
        "export:collection",
        "nyc-open-data",
        "yellow-taxi",
        ["--format", "csv"]
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(
      fs.readFileSync("nyc-open-data/yellow-taxi/documents.csv").toString()
    ).resolves.toMatchObject(
      "_id,city,firstName,lastName,name\nthe-hive-th,changmai,,,\nluca,changmai,,,\nchuon-chuon-kim,hcmc,,,\n"
    );
  });
});
