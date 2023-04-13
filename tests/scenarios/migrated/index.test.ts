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

describe("Index", () => {
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
  it("Export an index", async () => {
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
      { _id: "chuon-chuon-kim", body: { city: "hcmc", district: 1 } },
      { _id: "the-hive", body: { city: "hcmc", district: 2 } },
    ]);

    await sdk.collection.refresh(index, collection);

    await sdk.collection.create("nyc-open-data", "green-taxi", {
      mappings: {},
    });
    index = "nyc-open-data";
    collection = "green-taxi";

    response = await sdk.document["mCreate"](index, collection, [
      { _id: "chuon-chuon-kim2", body: { city: "hcmc", district: 1 } },
      { _id: "the-hive2", body: { city: "hcmc", district: 2 } },
    ]);

    await sdk.collection.refresh(index, collection);

    try {
      const { stdout } = await kourou("export:index", "nyc-open-data");
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    response = await sdk.query({
      controller: "index",
      action: "delete",
      index: "nyc-open-data",
    });
  });
});
