import { useSdk } from "../../helpers/sdk";
import { beforeEachTruncateCollections } from "../../hooks/collections";
import { beforeEachLoadFixtures } from "../../hooks/fixtures";
import { resetSecurityDefault } from "../../hooks/securities";

import { execute } from "../../../lib/support/execute";
import fs from "fs";

jest.setTimeout(20000);

function kourou(...command: any[]) {
  const kourouRuntime = process.env.KOUROU_RUNTIME || "./bin/run";
  return execute(kourouRuntime, ...command);
}

describe("CSV", () => {
  const sdk = useSdk();
  let shouldResetSecurity = false;

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
  });

  afterAll(async () => {
    sdk.disconnect();
  });
  it("Exports a collection to CSV specifying the fields", async () => {
    shouldResetSecurity = false;

    const index = "nyc-open-data";
    const collection = "yellow-taxi";

    await expect(sdk.index.exists("nyc-open-data")).resolves.toBe(true);

    await expect(
      sdk.collection.exists("nyc-open-data", "yellow-taxi")
    ).resolves.toBe(true);

    await sdk.document["mCreate"](index, collection, [
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
    ] as Array<any>);

    await sdk.collection.refresh(index, collection);

    try {
      await kourou(
        "export:collection",
        "nyc-open-data",
        "yellow-taxi",
        "--format",
        "csv",
        "--fields",
        "city,district,nested.field,object"
      );
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

    const index = "nyc-open-data";
    const collection  = "yellow-taxi";

    await expect(sdk.index.exists("nyc-open-data")).resolves.toBe(true);

    await expect(
      sdk.collection.exists("nyc-open-data", "yellow-taxi")
    ).resolves.toBe(true);

    await sdk.document["mCreate"](index, collection, [
      {
        _id: "the-hive-th",
        body: { city: "changmai", district: 7, unwanted: "field" },
      },
      { _id: "luca", body: { city: "changmai", district: [7, 8, 9] } },
      {
        _id: "chuon-chuon-kim",
        body: { city: "hcmc", district: 1, nested: { field: 1 } },
      },
    ] as Array<any>);

    await sdk.collection.refresh(index, collection);

    try {
      await kourou(
        "export:collection",
        "nyc-open-data",
        "yellow-taxi",
        "--format",
        "csv"
      );
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
