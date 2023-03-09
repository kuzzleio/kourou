import { useSdk } from "../../helpers/sdk";
import { beforeEachTruncateCollections } from "../../hooks/collections";
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

describe("Collection", () => {
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
  it("Export a collection", async () => {
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
      { _id: "the-hive-vn", body: { city: "hcmc", district: 2 } },
      { _id: "the-hive-th", body: { city: "changmai", district: 7 } },
    ]);

    await sdk.collection.refresh(index, collection);

    try {
      const { stdout } = await kourou(
        "export:collection",
        "nyc-open-data",
        "yellow-taxi",
        ["--query", '{ term: { city: "hcmc" } }', "--scrollTTL", "3s"]
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    response = await sdk.query({
      controller: "collection",
      action: "delete",
      index: "nyc-open-data",
      collection: "yellow-taxi",
    });

    try {
      const { stdout } = await kourou("import", "./nyc-open-data", []);
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    response = await sdk.query({
      controller: "collection",
      action: "getMapping",
      index: "nyc-open-data",
      collection: "yellow-taxi",
    });

    await expect(
      sdk.document.get(index, collection, "chuon-chuon-kim")
    ).resolves.toMatchObject({ _source: { city: "hcmc", district: 1 } });

    await expect(
      sdk.document.get(index, collection, "the-hive-vn")
    ).resolves.toMatchObject({ _source: { city: "hcmc", district: 2 } });

    await expect(
      sdk.document.exists(index, collection, "the-hive-th")
    ).resolves.toBe(false);

    response = await sdk.query({
      controller: "collection",
      action: "getMapping",
      index: "nyc-open-data",
      collection: "yellow-taxi",
    });

    expect(response.result["properties"]).toBeDefined();

    expect(response.result["properties"]).toMatchObject({
      city: { type: "keyword" },
      name: { type: "keyword" },
    });
  });

  it("Creates a collection", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    try {
      const { stdout } = await kourou(
        "collection:create",
        "mtp-open-data",
        "yellow-taxi",
        '{ mappings: { dynamic: "false" } }',
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    response = await sdk.query({
      controller: "collection",
      action: "getMapping",
      index: "mtp-open-data",
      collection: "yellow-taxi",
    });

    expect(response.result).toMatchObject({ dynamic: "false" });
  });

  it("Migrate a collection", async () => {
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
      { _id: "antoine", body: { name: "Antoine Ducuroy" } },
      { _id: "karina", body: { name: "Karina Tsimashenka" } },
    ]);

    await sdk.collection.refresh(index, collection);

    try {
      const { stdout } = await kourou(
        "export:collection",
        "nyc-open-data",
        "yellow-taxi",
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    response = await sdk.query({
      controller: "collection",
      action: "truncate",
      index: "nyc-open-data",
      collection: "yellow-taxi",
    });

    try {
      const { stdout } = await kourou(
        "collection:migrate",
        "./features/fixtures/migration.js",
        "./nyc-open-data/yellow-taxi"
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    await expect(
      sdk.document.get(index, collection, "antoine")
    ).resolves.toMatchObject({
      _source: { firstName: "Antoine", lastName: "Ducuroy" },
    });

    await expect(
      sdk.document.get(index, collection, "karina")
    ).resolves.toMatchObject({
      _source: { firstName: "Karina", lastName: "Tsimashenka" },
    });
  });
});
